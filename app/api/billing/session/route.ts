import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { grantPurchaseCredits } from "@/lib/credits";
import { activatePremiumFromCheckout } from "@/lib/premium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authSession = await auth();
  const userId = authSession?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_"))
    return NextResponse.json({ error: "bad_session" }, { status: 400 });
  try {
    const checkout = await stripe().checkout.sessions.retrieve(sessionId);
    if (
      checkout.metadata?.userId !== userId ||
      checkout.status !== "complete"
    ) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const kind = checkout.metadata.kind;
    if (kind !== "credits" && kind !== "premium")
      return NextResponse.json({ error: "bad_kind" }, { status: 400 });
    // Webhook delivery may lag behind Stripe's redirect. Reconcile credit
    // purchases here too; the session-keyed database function is idempotent.
    // Delayed-payment methods complete the session before the money clears.
    // Grant nothing until Stripe says paid; the webhook's
    // async_payment_succeeded event delivers it later (same idempotency key).
    // A trial checkout is "no_payment_required" and is entitled immediately.
    const settled =
      checkout.payment_status === "paid" ||
      (kind === "premium" && checkout.payment_status === "no_payment_required");
    if (!settled) {
      return NextResponse.json({ error: "payment_pending" }, { status: 409 });
    }
    if (kind === "credits") {
      await grantPurchaseCredits(
        userId,
        Number(checkout.metadata.credits ?? 0),
        checkout.id,
      );
    } else {
      await activatePremiumFromCheckout(checkout);
    }
    const contentId =
      kind === "premium"
        ? (checkout.metadata.planKey ?? "vivida_pro")
        : `credits_${checkout.metadata.credits ?? "pack"}`;
    return NextResponse.json({
      kind,
      purchaseContext: checkout.metadata.purchase_context ?? null,
      value: (checkout.amount_total ?? 0) / 100,
      currency: (checkout.currency ?? "gbp").toUpperCase(),
      contentId,
      purchaseEventId: `${checkout.id}:purchase`,
      subscribeEventId: `${checkout.id}:subscribe`,
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
