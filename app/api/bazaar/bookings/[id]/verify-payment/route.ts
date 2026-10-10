import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarBookings, bazaarPaymentAttempts } from "@/db/schema";
import {
  getBookingForViewer,
  isSignatureUnused,
  verifyBookingPayment,
} from "@/lib/bazaar";
import { isValidSolanaAddress, normalizeSignature } from "@/lib/bazaar-pure";
import { notifyBookingPaid } from "@/lib/bazaar-notify";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/bazaar/bookings/[id]/verify-payment { txSignature, payerWallet }
 * Buyer confirms their on-chain USDC transfer. The server checks the
 * signature against Solana mainnet: finalized USDC credit to the booking's
 * snapshotted provider wallet for at least the snapshotted price, sent by
 * the claimed payer wallet (signer proof — otherwise anyone could claim a
 * stranger's payment as their own). Flips pending_payment → paid exactly
 * once. Every attempt is logged for the admin Payments tab.
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

  if (!payerWallet) {
    return NextResponse.json(
      { error: "invalid_payer_wallet" },
      { status: 400 },
    );
  }

  const bookingId = booking.id;

  async function logAttempt(reason: string) {
    try {
      await db.insert(bazaarPaymentAttempts).values({
        bookingId,
        reason,
        sigPrefix: signature!.slice(0, 8),
      });
    } catch {
      // Monitoring must never break verification.
    }
  }

  const unused = await isSignatureUnused(signature, booking.id);
  const check = await verifyBookingPayment({
    signature,
    expectedProviderWallet: booking.providerWallet,
    expectedPriceCents: booking.priceUsdcCents,
    alreadyUsed: !unused,
    expectedSigner: payerWallet,
  });
  if (!check.ok) {
    await logAttempt(check.reason);
    // 202 keeps the client polling: not_found usually means the RPC hasn't
    // indexed the transaction yet (buyer just sent it). 409 means the
    // payment belongs to another booking — polling won't help.
    const status =
      check.reason === "not_found"
        ? 202
        : check.reason === "already_used"
          ? 409
          : 402;
    return NextResponse.json({ ok: false, reason: check.reason }, { status });
  }

  try {
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
  } catch (e) {
    // Lost a simultaneous claim race for this signature (unique
    // tx_signature): re-read to answer idempotently instead of 500ing.
    if (
      typeof e === "object" &&
      e !== null &&
      (e as { code?: unknown }).code === "23505"
    ) {
      const current = await getBookingForViewer(id, userId);
      if (current?.txSignature === signature) {
        await logAttempt("paid");
        return NextResponse.json({ ok: true, status: current.status });
      }
      await logAttempt("already_used");
      return NextResponse.json(
        { ok: false, reason: "already_used" },
        { status: 409 },
      );
    }
    throw e;
  }
  await logAttempt("paid");
  await notifyBookingPaid(booking.id);
  return NextResponse.json({ ok: true, status: "paid" });
}
