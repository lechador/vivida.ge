import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deletePhoto } from "@/lib/photos-core";

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

  const result = await deletePhoto(session.user.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.code }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
