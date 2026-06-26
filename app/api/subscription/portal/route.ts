import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { createBillingPortal, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Open the Stripe billing portal — saved cards, cancel, invoices. */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return Response.json({ error: "payments_unavailable" }, { status: 503 });
  }

  const [sub] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub?.stripeCustomerId) {
    return Response.json({ error: "no_customer" }, { status: 400 });
  }

  const origin =
    process.env.APP_ORIGIN ?? process.env.AUTH_URL ?? new URL(req.url).origin;

  try {
    const portal = await createBillingPortal({
      customerId: sub.stripeCustomerId,
      returnUrl: `${origin}/subscription`,
    });
    return Response.json({ url: portal.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[subscription/portal] stripe error:", msg);
    return Response.json({ error: "portal_failed", detail: msg }, { status: 502 });
  }
}
