import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function reportCurrency(locale?: string): "gel" | "usd" {
  return locale === "en" ? "usd" : "gel";
}

export async function createCreditCheckoutSession(input: {
  userId: string;
  email: string | null;
  origin: string;
  credits: number;
  amountMinor: number;
  currency: string;
  locale?: string;
  trackingMetadata?: Record<string, string>;
  returnTo?: string | null;
}) {
  if (!isStripeConfigured()) {
    return { id: "cs_mock_credits", url: "/credits" };
  }
  const returnPath = input.returnTo || "/credits";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountMinor,
          product_data: {
            name: `Vivida · ${input.credits} Credits`,
          },
        },
      },
    ],
    metadata: {
      kind: "credits",
      userId: input.userId,
      credits: String(input.credits),
      ...(input.trackingMetadata ?? {}),
    },
    success_url: `${input.origin}${returnPath}${returnPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/credits`,
  });
  return session;
}

export async function createPremiumCheckoutSession(input: {
  userId: string;
  email: string | null;
  stripeCustomerId: string | null;
  origin: string;
  plan: {
    key: string;
    amountMinor: number;
    currency: string;
    interval?: "month" | "year";
    intervalCount?: number;
    countryCode?: string;
  };
  trackingMetadata?: Record<string, string>;
  returnTo?: string | null;
}) {
  if (!isStripeConfigured()) {
    return { id: "cs_mock_premium", url: "/subscription" };
  }
  const returnPath = input.returnTo || "/subscription";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(input.stripeCustomerId
      ? { customer: input.stripeCustomerId }
      : input.email
        ? { customer_email: input.email }
        : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.plan.currency.toLowerCase(),
          unit_amount: input.plan.amountMinor,
          recurring: {
            interval: input.plan.interval ?? "month",
            interval_count: input.plan.intervalCount ?? 1,
          },
          product_data: {
            name: "Vivida PRO",
          },
        },
      },
    ],
    subscription_data: {
      metadata: {
        userId: input.userId,
        planKey: input.plan.key,
        countryCode: input.plan.countryCode ?? "GE",
      },
    },
    metadata: {
      kind: "subscription",
      userId: input.userId,
      planKey: input.plan.key,
      ...(input.trackingMetadata ?? {}),
    },
    success_url: `${input.origin}${returnPath}${returnPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/subscription`,
  });
  return session;
}

export async function createBillingPortalSession(input: {
  customerId: string;
  origin: string;
}) {
  if (!isStripeConfigured()) {
    return { url: "/subscription" };
  }
  return stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url: `${input.origin}/subscription`,
  });
}

export function constructWebhookEvent(rawBody: string, sig: string) {
  return stripe.webhooks.constructEvent(
    rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET ?? "",
  );
}
