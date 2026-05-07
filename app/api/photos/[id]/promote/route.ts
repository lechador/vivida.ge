import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profilePhotos } from "@/db/schema";

/**
 * Move a photo to the front of the user's gallery so it becomes the
 * "main" profile picture. The other photos keep their relative order
 * and shift down by one.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  const [target] = await db
    .select({ id: profilePhotos.id })
    .from(profilePhotos)
    .where(
      and(eq(profilePhotos.id, id), eq(profilePhotos.userId, userId))
    )
    .limit(1);
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

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

  return NextResponse.json({ ok: true });
}
