import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { premiumPlanForCountry } from "@/lib/billing-config";
import { getBillingIdentity, isPremiumUser } from "@/lib/premium";
import {
  createPremiumCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  if (await isPremiumUser(userId)) {
    return NextResponse.json({ url: "/subscription", alreadyPremium: true });
  }

  const identity = await getBillingIdentity(userId);
  const plan = premiumPlanForCountry(identity?.countryCode);
  if (!plan) {
    return NextResponse.json({ error: "country_unavailable" }, { status: 403 });
  }

  try {
    const checkout = await createPremiumCheckoutSession({
      userId,
      email: identity?.email ?? session.user.email ?? null,
      stripeCustomerId: identity?.stripeCustomerId ?? null,
      origin: new URL(req.url).origin,
      plan,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[subscription/checkout] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
