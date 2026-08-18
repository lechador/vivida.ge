/**
 * Stripe integration for one-time purchases and Vivida PRO subscriptions.
 *
 * We use **hosted Checkout** (redirect) — no client-side Stripe.js, no PCI
 * surface. The flow is:
 *   1. create a hosted Checkout Session → redirect user to Stripe.
 *   2. Stripe redirects back to success_url; the `checkout.session.completed`
 *      webhook is the source of truth for purchases and entitlements.
 *
 * Country catalogues are server-owned; clients send only stable product keys.
 */
import Stripe from "stripe";
import { formatBillingAmount, type PremiumPlan } from "@/lib/billing-config";
import type { UserLocale } from "./i18n/user-locale";

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return _stripe;
}

/** Report price in the currency's minor unit (tetri / cents). Default ₾19.90. */
export function reportPriceCents(): number {
  const raw = Number(process.env.REPORT_PRICE_CENTS);
  return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 1990;
}

/** Lower-cased ISO currency Stripe charges in. Default "gel". */
export function reportCurrency(): string {
  return (process.env.REPORT_CURRENCY ?? "gel").toLowerCase();
}

const REPORT_LABEL: Record<string, string> = {
  natal: "ნატალური რუკის სრული ანგარიში (PDF)",
  synastry: "სინასტრიის ანგარიში (PDF)",
  forecast: "წლიური პროგნოზის ანგარიში (PDF)",
};

/**
 * Create a hosted Checkout Session for a report purchase. `reportId` is
 * threaded through metadata + client_reference_id so the webhook can match
 * the payment back to the pending report row.
 */
export async function createReportCheckoutSession(opts: {
  reportId: string;
  userId: string;
  type: string;
  email?: string | null;
  origin: string;
}): Promise<Stripe.Checkout.Session> {
  const { reportId, userId, type, email, origin } = opts;
  return stripe().checkout.sessions.create({
    mode: "payment",
    client_reference_id: reportId,
    customer_email: email ?? undefined,
    metadata: { reportId, userId, type },
    payment_intent_data: { metadata: { reportId, userId, type } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: reportCurrency(),
          unit_amount: reportPriceCents(),
          product_data: {
            name: REPORT_LABEL[type] ?? REPORT_LABEL.natal,
            description: "Vivida · შენი პერსონალური ასტროლოგიური ანგარიში",
          },
        },
      },
    ],
    success_url: `${origin}/reports/${reportId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/report?canceled=1`,
  });
}

/**
 * One-time Checkout for a credit top-up pack. The pack's credit count rides on
 * the session metadata so the webhook can award it (idempotently) on completion.
 */
export async function createCreditCheckoutSession(opts: {
  userId: string;
  email?: string | null;
  origin: string;
  credits: number;
  amountMinor: number;
  currency: string;
  locale?: UserLocale;
  trackingMetadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const {
    userId,
    email,
    origin,
    credits,
    amountMinor,
    currency,
    locale = "ka",
    trackingMetadata = {},
  } = opts;
  // Same formatter the top-up card uses, so the price on the button and the
  // price on the Stripe page are written identically.
  const formatted = formatBillingAmount(amountMinor, currency, locale);
  const creditWord = { ka: "კრედიტი", en: "credits", am: "կրեդիտ" }[locale];
  const productName =
    locale === "en" ? `${credits} Vivida credits` : `${credits} ${creditWord}`;
  return stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email ?? undefined,
    metadata: { userId, kind: "credits", credits: String(credits), ...trackingMetadata },
    payment_intent_data: {
      metadata: { userId, kind: "credits", credits: String(credits) },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountMinor,
          product_data: {
            name: productName,
            description: `Vivida · ${formatted} — ${credits} ${creditWord}`,
          },
        },
      },
    ],
    success_url: `${origin}/credits?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/credits?status=canceled`,
  });
}

async function priceForPlan(plan: PremiumPlan): Promise<Stripe.Price> {
  const prices = await stripe().prices.list({
    active: true,
    lookup_keys: [plan.stripeLookupKey],
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) {
    throw new Error(`Stripe price is missing for ${plan.stripeLookupKey}`);
  }
  // interval_count is checked too: without it the quarterly promo would accept
  // a monthly price under its lookup key and bill ₾29 every month.
  if (
    price.currency !== plan.currency ||
    price.unit_amount !== plan.amountMinor ||
    price.recurring?.interval !== plan.interval ||
    (price.recurring?.interval_count ?? 1) !== (plan.intervalCount ?? 1)
  ) {
    throw new Error(`Stripe price does not match catalogue for ${plan.key}`);
  }
  return price;
}

export async function createPremiumCheckoutSession(opts: {
  userId: string;
  email?: string | null;
  stripeCustomerId?: string | null;
  origin: string;
  plan: PremiumPlan;
  trackingMetadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const { userId, email, stripeCustomerId, origin, plan, trackingMetadata = {} } = opts;
  const price = await priceForPlan(plan);
  const metadata = {
    kind: "premium",
    userId,
    planKey: plan.key,
    countryCode: plan.countryCode,
    ...trackingMetadata,
  };

  return stripe().checkout.sessions.create({
    mode: "subscription",
    client_reference_id: userId,
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: email ?? undefined }),
    metadata,
    subscription_data: {
      metadata,
      description: "Vivida PRO · unlimited access",
    },
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${origin}/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscription?status=canceled`,
  });
}

export async function createBillingPortalSession(opts: {
  customerId: string;
  origin: string;
}): Promise<Stripe.BillingPortal.Session> {
  return stripe().billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: `${opts.origin}/subscription`,
  });
}

/** Verify + parse a Stripe webhook payload. Throws on bad signature. */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return stripe().webhooks.constructEvent(payload, signature, secret);
}
