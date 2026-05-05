import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { payments, subscriptions } from "@/db/schema";
import { mapFlittStatus, verifyCallback } from "@/lib/flitt";
import { PLANS, type IntervalId } from "@/lib/pricing";

/**
 * Resolve the billing interval. Newer payments persist it on the row at
 * checkout time; legacy rows (pre-interval column) fall back to amount
 * matching the *current* yearly price. The legacy fallback is now only
 * for payments that pre-date the migration — once those drain through,
 * the inference branch is dead code.
 */
function resolveInterval(payment: typeof payments.$inferSelect): IntervalId {
  if (payment.interval === "month" || payment.interval === "year") {
    return payment.interval;
  }
  return payment.amountCents === PLANS.pro.price.year ? "year" : "month";
}

/**
 * Flitt webhook handler.
 *
 * Flitt POSTs JSON with the same signed-param shape as the checkout request.
 * We verify the signature, find the matching payment, and reconcile the
 * subscription. Idempotent — safe to receive duplicate callbacks.
 */
export async function POST(req: Request) {
  const secret = process.env.FLITT_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "not_configured" },
      { status: 503 }
    );
  }

  const payload = (await req.json().catch(() => null)) as
    | Record<string, string | number>
    | null;
  if (!payload) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!verifyCallback(payload, secret)) {
    console.warn("[flitt webhook] invalid signature", {
      orderId: payload.order_id,
    });
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const orderId = String(payload.order_id ?? "");
  if (!orderId) {
    return NextResponse.json({ error: "missing_order_id" }, { status: 400 });
  }

  // Find the payment row we created during /checkout
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.flittOrderId, orderId))
    .limit(1);

  if (!payment) {
    // Could be a recurring renewal that we've never seen — log and 200
    // so Flitt doesn't keep retrying. We do best-effort matching by amount
    // + currency in a real system; for MVP we just acknowledge.
    console.warn("[flitt webhook] unknown order_id", orderId);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const flittStatus = String(payload.order_status ?? "");
  await db
    .update(payments)
    .set({
      status: flittStatus || "unknown",
      rawPayload: payload,
    })
    .where(eq(payments.id, payment.id));

  if (flittStatus !== "approved") {
    return NextResponse.json({ ok: true });
  }

  // Approved — activate Pro for this user. Read interval from the row
  // (persisted at checkout) with a legacy fallback to amount inference.
  const interval = resolveInterval(payment);

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  if (interval === "year") {
    periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1);
  } else {
    periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
  }

  const customerId = payload.sender_email
    ? String(payload.sender_email)
    : null;
  const subscriptionId = payload.rectoken
    ? String(payload.rectoken)
    : null;

  await db
    .insert(subscriptions)
    .values({
      userId: payment.userId,
      plan: "pro",
      status: mapFlittStatus(flittStatus),
      interval,
      priceCents: payment.amountCents,
      currency: payment.currency,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      flittOrderId: orderId,
      flittSubscriptionId: subscriptionId,
      flittCustomerId: customerId,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        plan: "pro",
        status: mapFlittStatus(flittStatus),
        interval,
        priceCents: payment.amountCents,
        currency: payment.currency,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        flittOrderId: orderId,
        flittSubscriptionId: subscriptionId,
        flittCustomerId: customerId,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}

// Flitt will call us with no auth header — the matcher in proxy.ts allows it
// through because /api/flitt/webhook isn't a protected path. Defensive POST-only.
export async function GET() {
  return NextResponse.json({ ok: true });
}
