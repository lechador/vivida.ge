import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBillingIdentity } from "@/lib/premium";
import { createBillingPortalSession, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const identity = await getBillingIdentity(userId);
  if (!identity?.stripeCustomerId) {
    return NextResponse.json({ error: "no_customer" }, { status: 404 });
  }

  try {
    const portal = await createBillingPortalSession({
      customerId: identity.stripeCustomerId,
      origin: new URL(req.url).origin,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("[subscription/portal] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
