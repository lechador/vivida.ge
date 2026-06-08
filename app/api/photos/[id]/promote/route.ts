import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { promotePhoto } from "@/lib/photos-core";

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
  const { id } = await params;

  const result = await promotePhoto(session.user.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.code }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
