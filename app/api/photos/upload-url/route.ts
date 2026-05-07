import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profilePhotos } from "@/db/schema";
import {
  PHOTO_LIMITS,
  isR2Configured,
  presignedUploadUrl,
  publicUrlFor,
} from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "storage_not_configured" },
        { status: 503 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      contentType?: string;
      contentLength?: number;
    } | null;
    if (
      !body ||
      typeof body.contentType !== "string" ||
      typeof body.contentLength !== "number"
    ) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    if (
      !PHOTO_LIMITS.ALLOWED_TYPES.includes(
        body.contentType as (typeof PHOTO_LIMITS.ALLOWED_TYPES)[number]
      )
    ) {
      return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }
    if (body.contentLength > PHOTO_LIMITS.MAX_BYTES) {
      return NextResponse.json({ error: "too_large" }, { status: 400 });
    }
    if (body.contentLength <= 0) {
      return NextResponse.json({ error: "empty" }, { status: 400 });
    }

    const userId = session.user.id;

    // Limit check
    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, userId));
    if (Number(existingCount) >= PHOTO_LIMITS.MAX_PER_USER) {
      return NextResponse.json({ error: "limit_reached" }, { status: 400 });
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
      body.contentType === "image/jpeg"
        ? "jpg"
        : body.contentType === "image/png"
          ? "png"
          : "webp";
    const key = `users/${userId}/${photoId}.${ext}`;
    const url = publicUrlFor(key);

    // Insert pending row
    await db.insert(profilePhotos).values({
      id: photoId,
      userId,
      key,
      url,
      sortOrder: nextSortOrder,
      ready: false,
    });

    // Generate presigned URL for the upload
    const uploadUrl = await presignedUploadUrl({
      key,
      contentType: body.contentType,
    });

    return NextResponse.json({
      photoId,
      uploadUrl,
      publicUrl: url,
    });
  } catch (err) {
    // Surface the underlying Postgres / R2 error. Drizzle wraps the real
    // cause in `err.cause` and just shows "Failed query: …" on the top
    // message — that hides FK / unique / type violations. Walk the chain
    // and stitch a useful detail string.
    const detail = describeError(err);
    console.error("[photos/upload-url] failed", {
      detail,
      stack: (err as Error)?.stack?.split("\n").slice(0, 6).join("\n"),
    });
    return NextResponse.json(
      { error: "presign_failed", detail },
      { status: 500 }
    );
  }
}

function describeError(err: unknown): string {
  const parts: string[] = [];
  let cur: unknown = err;
  let depth = 0;
  while (cur && depth < 4) {
    const e = cur as {
      name?: string;
      message?: string;
      code?: string;
      cause?: unknown;
    };
    const name = e.name ?? "Error";
    const code = e.code ? ` [${e.code}]` : "";
    const msg = e.message ?? "";
    parts.push(`${name}${code}: ${msg}`);
    cur = e.cause;
    depth += 1;
  }
  return parts.join(" · cause: ");
}
