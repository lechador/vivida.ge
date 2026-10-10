import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarBookings } from "@/db/schema";
import { getBookingForViewer } from "@/lib/bazaar";
import { limits } from "@/lib/bazaar-pure";
import { notifyReadingDelivered } from "@/lib/bazaar-notify";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/bazaar/bookings/[id]/deliver { deliveryText } — the provider
 * posts the finished reading. Only the paid booking's provider, only once.
 */
export async function POST(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await getBookingForViewer(id, userId);
  if (!booking || booking.viewerRole !== "provider") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (booking.status === "delivered") {
    return NextResponse.json({ ok: true, status: "delivered" });
  }
  if (booking.status !== "paid") {
    return NextResponse.json({ error: "not_paid" }, { status: 409 });
  }

  try {
    await enforceRateLimit({
      bucket: "bazaar_deliver",
      identifier: `${userId}:${id}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    deliveryText?: unknown;
  } | null;
  const deliveryText =
    typeof body?.deliveryText === "string" ? body.deliveryText.trim() : "";
  if (!deliveryText || deliveryText.length > limits.deliveryText) {
    return NextResponse.json({ error: "invalid_delivery" }, { status: 400 });
  }

  await db
    .update(bazaarBookings)
    .set({
      status: "delivered",
      deliveryText,
      deliveredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(bazaarBookings.id, booking.id));
  await notifyReadingDelivered(booking.id);
  return NextResponse.json({ ok: true, status: "delivered" });
}
