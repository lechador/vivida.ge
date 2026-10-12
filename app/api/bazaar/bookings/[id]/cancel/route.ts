import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarBookings } from "@/db/schema";
import { getBookingForViewer } from "@/lib/bazaar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/bazaar/bookings/[id]/cancel, buyer or provider cancels a
 * booking that is still awaiting payment. Paid money already sits in the
 * provider's wallet (no escrow in the MVP), so paid/delivered bookings can
 * only be resolved between the parties, not cancelled here.
 */
export async function POST(_req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await getBookingForViewer(id, userId);
  if (!booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, status: "cancelled" });
  }
  if (booking.status !== "pending_payment") {
    return NextResponse.json({ error: "cancel_closed" }, { status: 409 });
  }

  // Conditional so a concurrent payment verification wins: once a booking
  // is paid (money already in the reader's wallet), cancel must not flip it
  // back. Zero rows updated = the row moved on after our read.
  const updated = await db
    .update(bazaarBookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(bazaarBookings.id, booking.id),
        eq(bazaarBookings.status, "pending_payment"),
      ),
    )
    .returning({ id: bazaarBookings.id });
  if (updated.length === 0) {
    const current = await getBookingForViewer(id, userId);
    if (current?.status === "cancelled") {
      return NextResponse.json({ ok: true, status: "cancelled" });
    }
    return NextResponse.json({ error: "cancel_closed" }, { status: 409 });
  }
  return NextResponse.json({ ok: true, status: "cancelled" });
}
