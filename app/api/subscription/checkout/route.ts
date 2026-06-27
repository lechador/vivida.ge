import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import {
  createSubscriptionCheckout,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a monthly Pro subscription via Stripe Checkout. */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return Response.json({ error: "payments_unavailable" }, { status: 503 });
  }

  const [sub] = await db
    .select({
      stripeCustomerId: subscriptions.stripeCustomerId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  // Already a paying Stripe subscriber → they should manage via the portal.
  if (
    sub?.stripeSubscriptionId &&
    (sub.status === "active" || sub.status === "past_due")
  ) {
    return Response.json({ error: "already_subscribed" }, { status: 409 });
  }

  const origin =
    process.env.APP_ORIGIN ?? process.env.AUTH_URL ?? new URL(req.url).origin;

  try {
    const checkout = await createSubscriptionCheckout({
      userId,
      email: session.user.email,
      customerId: sub?.stripeCustomerId ?? null,
      origin,
    });
    return Response.json({ url: checkout.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[subscription/checkout] stripe error:", msg);
    return Response.json({ error: "checkout_failed", detail: msg }, { status: 502 });
  }
}
