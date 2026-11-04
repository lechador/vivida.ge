import { after, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  featuredPremiumPlanForCountry,
  premiumPlanByKeyForCountry,
  premiumPlanForCountry,
  PRO_TRIAL_DAYS,
  trialPlanByKeyForCountry,
} from "@/lib/billing-config";
import {
  getBillingIdentity,
  hasPremiumSubscriptionHistory,
  isPremiumUser,
} from "@/lib/premium";
import { createPremiumCheckoutSession, isStripeConfigured } from "@/lib/stripe";
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
  // Stripe is the primary rail on BOTH hosts. The English host additionally
  // offers a one-time USDC PRO pass (see /api/crypto/checkout); it no longer
  // replaces the Stripe subscription there.
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  if (await isPremiumUser(userId)) {
    return NextResponse.json({ url: "/subscription", alreadyPremium: true });
  }

  // The promo is requested by name, never priced by the client. Eligibility is
  // resolved from the campaign here, so a user who was never addressed, or
  // whose offer has expired, cannot reach the ₾29 price by posting the flag.
  const body = (await req.json().catch(() => null)) as {
    offer?: unknown;
    planKey?: unknown;
    returnTo?: unknown;
    product?: unknown;
    trial?: unknown;
  } | null;
  const wantsOffer = body?.offer === "low_credits";
  // A trial never stacks on a discounted campaign offer: the offer price is
  // already the incentive, and trial eligibility is re-validated below
  // against subscription history, never trusted from the client flag alone.
  const wantsTrial = body?.trial === true && !wantsOffer;
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

  // A trial buyer explicitly chooses the plan the first charge will use, so
  // the trial resolver may return the monthly plan even in markets where
  // monthly is retired for direct purchase. The flag alone never widens the
  // catalogue for a non-trial checkout.
  const selectedPlan =
    body?.planKey == null
      ? null
      : wantsTrial
        ? trialPlanByKeyForCountry(identity?.countryCode, body.planKey)
        : premiumPlanByKeyForCountry(identity?.countryCode, body.planKey);
  if (body?.planKey != null && !selectedPlan) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const plan =
    offer?.plan ??
    selectedPlan ??
    (wantsTrial
      ? featuredPremiumPlanForCountry(identity?.countryCode)
      : premiumPlanForCountry(identity?.countryCode));

  if (wantsTrial && (await hasPremiumSubscriptionHistory(userId))) {
    return NextResponse.json({ error: "trial_unavailable" }, { status: 403 });
  }

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
      trialDays: wantsTrial ? PRO_TRIAL_DAYS : undefined,
    });
    await recordExperimentOutcomesBestEffort(
      userId,
      [
        EXPERIMENTS.pricingPresentation,
        EXPERIMENTS.contextualPaywall,
        EXPERIMENTS.firstPurchaseOffer,
      ],
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
      // Nothing is due today on a trial, so ad analytics must not book the
      // plan price as checkout value until the first real charge lands.
      value: wantsTrial ? 0 : plan.amountMinor / 100,
      currency: plan.currency.toUpperCase(),
      contentId: plan.key,
      trial: wantsTrial,
    });
  } catch (err) {
    console.error("[subscription/checkout] failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
