import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

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
    // 202/503 keep the client retrying: a clean "not indexed yet" (buyer
    // just sent it) or a brief RPC outage — both resolve on retry. 409
    // means the signature funds another booking; 402 means the payment
    // itself is the problem (underpaid / failed / not sent by the claimed
    // wallet).
    const status =
      check.reason === "not_found"
        ? 202
        : check.reason === "unavailable"
          ? 503
          : check.reason === "already_used"
            ? 409
            : 402;
    return NextResponse.json({ ok: false, reason: check.reason }, { status });
  }

  try {
    const updated = await db
      .update(bazaarBookings)
      .set({
        status: "paid",
        txSignature: signature,
        payerWallet,
        txVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bazaarBookings.id, booking.id),
          // paid/delivered are terminal for this update; a `cancelled`
          // booking accepts the update because on-chain money is the
          // source of truth — a cancel that raced this verification must
          // not leave a paid booking untracked.
          inArray(bazaarBookings.status, ["pending_payment", "cancelled"]),
        ),
      )
      .returning({ id: bazaarBookings.id });
    if (updated.length === 0) {
      // The row moved on mid-verification (another tab / device verified,
      // or it was delivered). Answer idempotently from a fresh read.
      const current = await getBookingForViewer(id, userId);
      if (
        current &&
        (current.status === "paid" || current.status === "delivered")
      ) {
        await logAttempt("paid");
        return NextResponse.json({ ok: true, status: current.status });
      }
      await logAttempt("booking_closed");
      return NextResponse.json({ error: "booking_closed" }, { status: 409 });
    }
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
