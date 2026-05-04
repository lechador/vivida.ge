import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profilePhotos } from "@/db/schema";
import { deleteObject } from "@/lib/r2";

/** Delete a photo. Owner-only. Removes the R2 object and the DB row. */
export async function DELETE(
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

  // Best-effort R2 delete — don't block the DB cleanup if it fails.
  try {
    await deleteObject(photo.key);
  } catch (err) {
    console.warn("[photos/delete] R2 delete failed", err);
  }

  await db.delete(profilePhotos).where(eq(profilePhotos.id, id));

  return NextResponse.json({ ok: true });
}
