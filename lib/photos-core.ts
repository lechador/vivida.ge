import { and, asc, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profilePhotos, type ProfilePhoto } from "@/db/schema";
import { CREDIT_REWARD, earnOnce } from "@/lib/credits";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import {
  PHOTO_LIMITS,
  deleteObject,
  isR2Configured,
  objectExistsDetailed,
  presignedUploadUrl,
  publicUrlFor,
} from "@/lib/r2";

/**
 * Framework-agnostic profile-photo logic, shared by the website
 * (app/api/photos/*) and the mobile API (app/api/v1/me/photos/*). Callers do
 * their own auth and pass the resolved user id in; these functions return a
 * discriminated result with a stable `code` so each transport can map it to
 * the right HTTP status. Cache invalidation (in-memory header cache) stays
 * here so the navbar avatar refreshes for both clients.
 */

export type PhotoUploadResult =
  | { ok: true; photoId: string; uploadUrl: string; publicUrl: string }
  | {
      ok: false;
      code:
        | "storage_not_configured"
        | "bad_request"
        | "invalid_type"
        | "too_large"
        | "empty"
        | "limit_reached";
    };

/** List a user's own photos (incl. not-yet-ready ones) in display order. */
export async function listOwnPhotos(userId: string): Promise<ProfilePhoto[]> {
  return db
    .select()
    .from(profilePhotos)
    .where(eq(profilePhotos.userId, userId))
    .orderBy(asc(profilePhotos.sortOrder));
}

/**
 * Reserve a photo slot: validate the content type/size, insert a pending
 * row, and return a presigned R2 upload URL. The client PUTs the bytes to
 * `uploadUrl`, then calls finalize to flip `ready`.
 */
export async function createPhotoUpload(
  userId: string,
  input: { contentType?: unknown; contentLength?: unknown }
): Promise<PhotoUploadResult> {
  if (!isR2Configured()) return { ok: false, code: "storage_not_configured" };

  if (
    typeof input.contentType !== "string" ||
    typeof input.contentLength !== "number"
  ) {
    return { ok: false, code: "bad_request" };
  }
  const contentType = input.contentType;
  const contentLength = input.contentLength;
  if (
    !PHOTO_LIMITS.ALLOWED_TYPES.includes(
      contentType as (typeof PHOTO_LIMITS.ALLOWED_TYPES)[number]
    )
  ) {
    return { ok: false, code: "invalid_type" };
  }
  if (contentLength > PHOTO_LIMITS.MAX_BYTES) {
    return { ok: false, code: "too_large" };
  }
  if (contentLength <= 0) {
    return { ok: false, code: "empty" };
  }

  // Limit check
  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(profilePhotos)
    .where(eq(profilePhotos.userId, userId));
  if (Number(existingCount) >= PHOTO_LIMITS.MAX_PER_USER) {
    return { ok: false, code: "limit_reached" };
  }

  // Determine next sortOrder
  const [last] = await db
    .select({ sortOrder: profilePhotos.sortOrder })
    .from(profilePhotos)
    .where(eq(profilePhotos.userId, userId))
    .orderBy(desc(profilePhotos.sortOrder))
    .limit(1);
  const nextSortOrder = (last?.sortOrder ?? -1) + 1;

  // Build a key the user can't influence
  const photoId = crypto.randomUUID();
  const ext =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/png"
        ? "png"
        : "webp";
  const key = `users/${userId}/${photoId}.${ext}`;
  const url = publicUrlFor(key);

  await db.insert(profilePhotos).values({
    id: photoId,
    userId,
    key,
    url,
    sortOrder: nextSortOrder,
    ready: false,
  });

  const uploadUrl = await presignedUploadUrl({ key, contentType });

  return { ok: true, photoId, uploadUrl, publicUrl: url };
}

/**
 * Confirm a successful upload — flips `ready` to true so the photo renders
 * publicly. A background HEAD probe logs on disagreement but never blocks
 * (read-after-write lag made blocking flaky in production).
 */
export async function finalizePhoto(
  userId: string,
  photoId: string
): Promise<{ ok: true; photo: ProfilePhoto } | { ok: false; code: "not_found" }> {
  const [photo] = await db
    .select()
    .from(profilePhotos)
    .where(and(eq(profilePhotos.id, photoId), eq(profilePhotos.userId, userId)))
    .limit(1);
  if (!photo) return { ok: false, code: "not_found" };

  void objectExistsDetailed(photo.key)
    .then((r) => {
      if (!r.ok) {
        console.warn("[photos/finalize] HEAD probe disagreed with PUT", {
          key: photo.key,
          reason: r.reason,
          detail: "detail" in r ? r.detail : undefined,
        });
      }
    })
    .catch((err) => {
      console.warn("[photos/finalize] HEAD probe threw", {
        key: photo.key,
        message: (err as Error)?.message,
      });
    });

  await db
    .update(profilePhotos)
    .set({ ready: true })
    .where(eq(profilePhotos.id, photoId));

  invalidateHeaderForUser(userId);

  // One-time reward for adding a profile picture. Idempotent — only the very
  // first ready photo ever pays out (guarded by the ledger reason). Best-effort:
  // a credit hiccup must never fail the upload finalize.
  earnOnce(userId, CREDIT_REWARD.profilePhoto, "earn_profile_photo").catch(
    (err) =>
      console.warn("[photos/finalize] profile-photo reward failed", {
        userId,
        message: (err as Error)?.message,
      })
  );

  return { ok: true, photo: { ...photo, ready: true } };
}

/**
 * Move a photo to the front of the gallery so it becomes the "main" profile
 * picture. The others keep their relative order and shift down by one.
 */
export async function promotePhoto(
  userId: string,
  photoId: string
): Promise<{ ok: true } | { ok: false; code: "not_found" }> {
  const [target] = await db
    .select({ id: profilePhotos.id })
    .from(profilePhotos)
    .where(and(eq(profilePhotos.id, photoId), eq(profilePhotos.userId, userId)))
    .limit(1);
  if (!target) return { ok: false, code: "not_found" };

  await db.transaction(async (tx) => {
    const all = await tx
      .select({ id: profilePhotos.id })
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, userId))
      .orderBy(asc(profilePhotos.sortOrder));

    const reordered = [
      { id: target.id },
      ...all.filter((p) => p.id !== target.id),
    ];

    for (let i = 0; i < reordered.length; i++) {
      await tx
        .update(profilePhotos)
        .set({ sortOrder: i })
        .where(eq(profilePhotos.id, reordered[i].id));
    }
  });

  invalidateHeaderForUser(userId);
  return { ok: true };
}

/** Delete a photo. Owner-only. Removes the R2 object and the DB row. */
export async function deletePhoto(
  userId: string,
  photoId: string
): Promise<{ ok: true } | { ok: false; code: "not_found" }> {
  const [photo] = await db
    .select()
    .from(profilePhotos)
    .where(and(eq(profilePhotos.id, photoId), eq(profilePhotos.userId, userId)))
    .limit(1);
  if (!photo) return { ok: false, code: "not_found" };

  // Best-effort R2 delete — don't block the DB cleanup if it fails.
  try {
    await deleteObject(photo.key);
  } catch (err) {
    console.warn("[photos/delete] R2 delete failed", err);
  }

  await db.delete(profilePhotos).where(eq(profilePhotos.id, photoId));

  invalidateHeaderForUser(userId);
  return { ok: true };
}
