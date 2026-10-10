import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarBookings } from "@/db/schema";
import { getBookingForViewer } from "@/lib/bazaar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/bazaar/bookings/[id]/cancel — buyer or provider cancels a
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

  await db
    .update(bazaarBookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(bazaarBookings.id, booking.id));
  return NextResponse.json({ ok: true, status: "cancelled" });
}
