import { after, NextResponse } from "next/server";

import { auth } from "@/auth";
import { creditPackForCountry } from "@/lib/credits";
import { getBillingIdentity } from "@/lib/premium";
import { createCreditCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { localeForHost, requestHostIsEnglish } from "@/lib/i18n/request-locale";
import { isCryptoPayConfigured } from "@/lib/crypto-pay";
import {
  checkoutTrackingFromRequest,
  checkoutTrackingMetadata,
  trackCheckoutStarted,
} from "@/lib/checkout-tracking";
import { normalizeReturnPath } from "@/lib/safe-return-path";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import { recordExperimentOutcomesBestEffort } from "@/lib/experiment-outcomes";

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
  // The English site pays in USDC on Solana (the crypto rail); Stripe
  // checkout exists only on the Georgian site, but only once the crypto
  // rail is actually configured, so a half-rolled-out deploy never leaves
  // the English site with no working payment path.
  if (requestHostIsEnglish(req) && isCryptoPayConfigured()) {
    return NextResponse.json({ error: "crypto_only" }, { status: 403 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    packId?: unknown;
    returnTo?: unknown;
    product?: unknown;
  };
  const returnTo =
    typeof body.returnTo === "string"
      ? normalizeReturnPath(body.returnTo)
      : null;
  const purchaseContext =
    typeof body.product === "string" && /^[a-z0-9_-]{1,60}$/i.test(body.product)
      ? body.product
      : "credits_hub";
  const billingUser = await getBillingIdentity(userId);
  const pack = creditPackForCountry(billingUser?.countryCode, body.packId);
  if (!pack) return NextResponse.json({ error: "bad_pack" }, { status: 400 });

  const origin = new URL(req.url).origin;
  // Host alone cannot see Armenian, it is a path prefix, and this route is
  // POSTed from an authed surface that has none. The stored preference rides
  // on the billing row already fetched above, so Armenian reaches the Stripe
  // Checkout page without a second query.
  const locale = localeForHost(
    req.headers.get("x-forwarded-host") ?? new URL(req.url).host,
    billingUser?.interfaceLanguage,
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
      trackingMetadata: {
        ...checkoutTrackingMetadata(tracking),
        purchase_context: purchaseContext,
        selected_pack_id: pack.id,
      },
      returnTo,
    });
    await recordExperimentOutcomesBestEffort(
      userId,
      [EXPERIMENTS.pricingPresentation, EXPERIMENTS.contextualPaywall],
      "checkout_started",
      "credits_checkout",
      checkout.id,
    );
    if (tracking.allowed)
      after(() =>
        trackCheckoutStarted({
          session: checkout,
          tracking,
          userId,
          email: session.user?.email,
          countryCode: billingUser?.countryCode,
          value: pack.amountMinor / 100,
          currency: pack.currency,
          contentId: `credits_${pack.credits}`,
        }),
      );
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
