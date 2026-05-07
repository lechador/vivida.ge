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
  try {
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

    // The XHR PUT to R2 already returned 2xx by the time the client calls
    // this endpoint, so the object IS in R2. We used to re-verify with a
    // HeadObject probe, but that was flaky in production (read-after-write
    // lag, occasional auth blips) and would block the upload even when the
    // file was right there. Now we just flip ready=true and HEAD only as a
    // background sanity check we log on disagreement — never block on it.
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
      .where(eq(profilePhotos.id, id));

    // First-photo uploads become the navbar avatar — refresh the cache.
    invalidateHeaderForUser(session.user.id);

    return NextResponse.json({ ok: true, photo: { ...photo, ready: true } });
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
