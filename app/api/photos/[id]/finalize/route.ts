import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profilePhotos } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { objectExists } from "@/lib/r2";

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

  const exists = await objectExists(photo.key);
  if (!exists) {
    return NextResponse.json(
      { error: "object_missing" },
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
