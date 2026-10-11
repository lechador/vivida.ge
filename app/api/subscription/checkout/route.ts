import { after, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  premiumPlanByKeyForCountry,
  premiumPlanForCountry,
} from "@/lib/billing-config";
import { getBillingIdentity, isPremiumUser } from "@/lib/premium";
import { createPremiumCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { requestHostIsEnglish } from "@/lib/i18n/request-locale";
import { isCryptoPayConfigured } from "@/lib/crypto-pay";
import {
  checkoutTrackingFromRequest,
  checkoutTrackingMetadata,
  trackCheckoutStarted,
} from "@/lib/checkout-tracking";
import { getLowCreditOffer } from "@/lib/promo-offer";
import { normalizeReturnPath } from "@/lib/safe-return-path";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import { recordExperimentOutcomesBestEffort } from "@/lib/experiment-outcomes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // The English site pays in USDC on Solana (the crypto rail); Stripe
  // checkout exists only on the Georgian site — but only once the crypto
  // rail is actually configured, so a half-rolled-out deploy never leaves
  // the English site with no working payment path.
  if (requestHostIsEnglish(req) && isCryptoPayConfigured()) {
    return NextResponse.json({ error: "crypto_only" }, { status: 403 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  if (await isPremiumUser(userId)) {
    return NextResponse.json({ url: "/subscription", alreadyPremium: true });
  }

  // The promo is requested by name, never priced by the client. Eligibility is
  // resolved from the campaign here, so a user who was never addressed — or
  // whose offer has expired — cannot reach the ₾29 price by posting the flag.
  const body = (await req.json().catch(() => null)) as {
    offer?: unknown;
    planKey?: unknown;
    returnTo?: unknown;
    product?: unknown;
  } | null;
  const wantsOffer = body?.offer === "low_credits";
  const returnTo =
    typeof body?.returnTo === "string"
      ? normalizeReturnPath(body.returnTo)
      : null;
  const purchaseContext =
    typeof body?.product === "string" &&
    /^[a-z0-9_-]{1,60}$/i.test(body.product)
      ? body.product
      : "subscription";

  const identity = await getBillingIdentity(userId);
  const offer = wantsOffer ? await getLowCreditOffer(userId) : null;
  if (wantsOffer && !offer) {
    return NextResponse.json({ error: "offer_unavailable" }, { status: 403 });
  }

  const selectedPlan =
    body?.planKey == null
      ? null
      : premiumPlanByKeyForCountry(identity?.countryCode, body.planKey);
  if (body?.planKey != null && !selectedPlan) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const plan =
    offer?.plan ?? selectedPlan ?? premiumPlanForCountry(identity?.countryCode);

  try {
    const tracking = checkoutTrackingFromRequest(req);
    const checkout = await createPremiumCheckoutSession({
      userId,
      email: identity?.email ?? session.user.email ?? null,
      stripeCustomerId: identity?.stripeCustomerId ?? null,
      origin: new URL(req.url).origin,
      plan,
      trackingMetadata: {
        ...checkoutTrackingMetadata(tracking),
        purchase_context: purchaseContext,
      },
      returnTo,
    });
    await recordExperimentOutcomesBestEffort(
      userId,
      [EXPERIMENTS.pricingPresentation, EXPERIMENTS.contextualPaywall],
      "checkout_started",
      "subscription_checkout",
      checkout.id,
    );
    if (tracking.allowed)
      after(() =>
        trackCheckoutStarted({
          session: checkout,
          tracking,
          userId,
          email: identity?.email ?? session.user.email,
          countryCode: identity?.countryCode,
          value: plan.amountMinor / 100,
          currency: plan.currency,
          contentId: plan.key,
        }),
      );
    return NextResponse.json({
      url: checkout.url,
      eventId: `${checkout.id}:initiate_checkout`,
      value: plan.amountMinor / 100,
      currency: plan.currency.toUpperCase(),
      contentId: plan.key,
    });
  } catch (err) {
    console.error("[subscription/checkout] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
