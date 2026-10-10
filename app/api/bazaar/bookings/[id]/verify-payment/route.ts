import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarBookings } from "@/db/schema";
import {
  getBookingForViewer,
  isSignatureUnused,
  verifyBookingPayment,
} from "@/lib/bazaar";
import { isValidSolanaAddress, normalizeSignature } from "@/lib/bazaar-pure";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/bazaar/bookings/[id]/verify-payment { txSignature, payerWallet? }
 * Buyer confirms their on-chain USDC transfer. The server checks the
 * signature against Solana mainnet (confirmed USDC credit to the booking's
 * snapshotted provider wallet for at least the snapshotted price) and flips
 * pending_payment → paid exactly once.
 */
export async function POST(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await getBookingForViewer(id, userId);
  if (!booking || booking.viewerRole !== "buyer") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (booking.status === "paid" || booking.status === "delivered") {
    return NextResponse.json({ ok: true, status: booking.status });
  }
  if (booking.status !== "pending_payment") {
    return NextResponse.json({ error: "booking_closed" }, { status: 409 });
  }

  try {
    await enforceRateLimit({
      bucket: "bazaar_verify_payment",
      identifier: `${userId}:${id}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    txSignature?: unknown;
    payerWallet?: unknown;
  } | null;
  const signature = normalizeSignature(body?.txSignature);
  if (!signature) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }
  const payerWallet =
    typeof body?.payerWallet === "string" &&
    isValidSolanaAddress(body.payerWallet.trim())
      ? body.payerWallet.trim()
      : null;

  const unused = await isSignatureUnused(signature, booking.id);
  const check = await verifyBookingPayment({
    signature,
    expectedProviderWallet: booking.providerWallet,
    expectedPriceCents: booking.priceUsdcCents,
    alreadyUsed: !unused,
  });
  if (!check.ok) {
    // 202 keeps the client polling: not_found usually means the RPC hasn't
    // indexed the transaction yet (buyer just sent it).
    const status = check.reason === "not_found" ? 202 : 402;
    return NextResponse.json({ ok: false, reason: check.reason }, { status });
  }

  await db
    .update(bazaarBookings)
    .set({
      status: "paid",
      txSignature: signature,
      payerWallet,
      txVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(bazaarBookings.id, booking.id));
  return NextResponse.json({ ok: true, status: "paid" });
}
