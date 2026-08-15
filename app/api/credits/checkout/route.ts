import { after, NextResponse } from "next/server";

import { auth } from "@/auth";
import { creditPackForCountry } from "@/lib/credits";
import { getBillingIdentity } from "@/lib/premium";
import { createCreditCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { localeForHost } from "@/lib/i18n/request-locale";
import { checkoutTrackingFromRequest, checkoutTrackingMetadata, trackCheckoutStarted } from "@/lib/checkout-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/credits/checkout { packId } → Stripe Checkout URL for a credit
 * top-up. The webhook awards the credits on completion.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { packId?: unknown };
  const billingUser = await getBillingIdentity(userId);
  const pack = creditPackForCountry(billingUser?.countryCode, body.packId);
  if (!pack) return NextResponse.json({ error: "bad_pack" }, { status: 400 });

  const origin = new URL(req.url).origin;
  const locale = localeForHost(
    req.headers.get("x-forwarded-host") ?? new URL(req.url).host,
  );
  try {
    const tracking = checkoutTrackingFromRequest(req);
    const checkout = await createCreditCheckoutSession({
      userId,
      email: session.user?.email ?? null,
      origin,
      credits: pack.credits,
      amountMinor: pack.amountMinor,
      currency: pack.currency,
      locale,
      trackingMetadata: checkoutTrackingMetadata(tracking),
    });
    if (tracking.allowed) after(() => trackCheckoutStarted({
      session: checkout,
      tracking,
      userId,
      email: session.user?.email,
      countryCode: billingUser?.countryCode,
      value: pack.amountMinor / 100,
      currency: pack.currency,
      contentId: `credits_${pack.credits}`,
    }));
    return NextResponse.json({
      url: checkout.url,
      eventId: `${checkout.id}:initiate_checkout`,
      value: pack.amountMinor / 100,
      currency: pack.currency.toUpperCase(),
      contentId: `credits_${pack.credits}`,
    });
  } catch (err) {
    console.error("[credits/checkout] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
