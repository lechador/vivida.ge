import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { finalizePhoto } from "@/lib/photos-core";

/**
 * Confirm a successful upload, verifies the row belongs to the user and
 * flips `ready` to true. Only after this does the photo render publicly.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const result = await finalizePhoto(session.user.id, id);
    if (!result.ok) {
      return NextResponse.json({ error: result.code }, { status: 404 });
    }
    return NextResponse.json({ ok: true, photo: result.photo });
  } catch (err) {
    const e = err as { name?: string; message?: string };
    console.error("[photos/finalize] failed", {
      name: e?.name,
      message: e?.message,
      stack: (err as Error)?.stack?.split("\n").slice(0, 4).join("\n"),
    });
    return NextResponse.json(
      {
        error: "finalize_failed",
        detail: `${e?.name ?? "Error"}: ${e?.message ?? "unknown"}`,
      },
      { status: 500 }
    );
  }
}
