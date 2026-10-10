import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarBookings } from "@/db/schema";
import { getPublicService, listBookingsForUser } from "@/lib/bazaar";
import { limits } from "@/lib/bazaar-pure";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/bazaar/bookings — buyer's bookings + provider's incoming orders. */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await listBookingsForUser(userId));
}

/**
 * POST /api/bazaar/bookings { serviceId, buyerNote? } — reserve a reading.
 * The booking snapshots price + provider wallet, then waits for the buyer
 * to pay on-chain and submit the signature for verification.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "bazaar_booking_create",
      identifier: userId,
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    serviceId?: unknown;
    buyerNote?: unknown;
  } | null;
  if (!body || typeof body.serviceId !== "string" || !body.serviceId) {
    return NextResponse.json({ error: "missing_service" }, { status: 400 });
  }
  const service = await getPublicService(body.serviceId);
  if (!service) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 404 });
  }
  const buyerNote =
    typeof body.buyerNote === "string"
      ? body.buyerNote.trim().slice(0, limits.buyerNote)
      : "";

  const [booking] = await db
    .insert(bazaarBookings)
    .values({
      serviceId: service.id,
      providerId: service.provider.id,
      buyerUserId: userId,
      status: "pending_payment",
      priceUsdcCents: service.priceUsdcCents,
      providerWallet: service.providerWallet,
      buyerNote,
    })
    .returning({ id: bazaarBookings.id });
  return NextResponse.json(
    {
      ok: true,
      id: booking.id,
      priceUsdcCents: service.priceUsdcCents,
      providerWallet: service.providerWallet,
    },
    { status: 201 },
  );
}
