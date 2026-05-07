import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profilePhotos } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { objectExistsDetailed } from "@/lib/r2";

/**
 * Confirm a successful upload — verifies the object exists in R2 and flips
 * the row's `ready` flag to true. Only after this does the photo render
 * publicly.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const [photo] = await db
    .select()
    .from(profilePhotos)
    .where(
      and(
        eq(profilePhotos.id, id),
        eq(profilePhotos.userId, session.user.id)
      )
    )
    .limit(1);
  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // R2 is normally strongly consistent, but read-after-write can lag a
  // few hundred ms on the edge. Try up to 3 times with brief backoff
  // before giving up so a transient HEAD miss doesn't fail the upload.
  let lastResult: Awaited<ReturnType<typeof objectExistsDetailed>> | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 250 * attempt));
    lastResult = await objectExistsDetailed(photo.key);
    if (lastResult.ok) break;
    if (lastResult.reason === "error") {
      // Auth / CORS / network — retrying won't help, log and bail.
      console.error("[photos/finalize] HeadObject error", {
        key: photo.key,
        detail: lastResult.detail,
      });
      return NextResponse.json(
        { error: "head_failed", detail: lastResult.detail },
        { status: 500 }
      );
    }
  }
  if (!lastResult?.ok) {
    console.warn("[photos/finalize] object missing after retries", {
      key: photo.key,
    });
    return NextResponse.json(
      { error: "object_missing", key: photo.key },
      { status: 400 }
    );
  }

  await db
    .update(profilePhotos)
    .set({ ready: true })
    .where(eq(profilePhotos.id, id));

  // First-photo uploads become the navbar avatar — refresh the cache.
  invalidateHeaderForUser(session.user.id);

  return NextResponse.json({ ok: true, photo: { ...photo, ready: true } });
}
