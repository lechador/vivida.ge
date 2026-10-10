import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarReviews } from "@/db/schema";
import { getBookingForViewer, refreshProviderRating } from "@/lib/bazaar";
import { limits, validateRating } from "@/lib/bazaar-pure";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bazaar/reviews { bookingId, rating, comment? } — the buyer
 * reviews a DELIVERED booking exactly once. Public review rows carry no
 * buyer identity and no booking linkage beyond the private row.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "bazaar_review",
      identifier: userId,
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    bookingId?: unknown;
    rating?: unknown;
    comment?: unknown;
  } | null;
  if (!body || typeof body.bookingId !== "string" || !body.bookingId) {
    return NextResponse.json({ error: "missing_booking" }, { status: 400 });
  }
  const rating = validateRating(body.rating);
  if (rating === null) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
  }
  const comment =
    typeof body.comment === "string"
      ? body.comment.trim().slice(0, limits.comment)
      : "";

  const booking = await getBookingForViewer(body.bookingId, userId);
  if (!booking || booking.viewerRole !== "buyer") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (booking.status !== "delivered") {
    return NextResponse.json({ error: "not_delivered" }, { status: 409 });
  }

  try {
    const [review] = await db
      .insert(bazaarReviews)
      .values({
        bookingId: booking.id,
        serviceId: booking.serviceId,
        providerId: booking.providerId,
        buyerUserId: userId,
        rating,
        comment,
      })
      .returning({ id: bazaarReviews.id });
    await refreshProviderRating(booking.providerId);
    return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
  } catch (e) {
    // Unique booking_id (23505) — this booking was already reviewed.
    // Anything else must surface as a real error, not as "already reviewed".
    if (
      typeof e === "object" &&
      e !== null &&
      (e as { code?: unknown }).code === "23505"
    ) {
      return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
    }
    throw e;
  }
}
