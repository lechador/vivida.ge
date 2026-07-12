/**
 * Stripe integration for one-time paid PDF reports.
 *
 * We use **hosted Checkout** (redirect) — no client-side Stripe.js, no PCI
 * surface. The flow is:
 *   1. createReportCheckoutSession() → redirect user to Stripe.
 *   2. Stripe redirects back to success_url; the `checkout.session.completed`
 *      webhook is the source of truth that marks the report paid.
 *
 * Note on currency: Stripe does not onboard Georgian entities and may reject
 * GEL. Price + currency are env-configurable (REPORT_PRICE_CENTS /
 * REPORT_CURRENCY) so you can switch to usd/eur without code changes.
 */
import Stripe from "stripe";

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
  tetri: number;
  gel: number;
}): Promise<Stripe.Checkout.Session> {
  const { userId, email, origin, credits, tetri, gel } = opts;
  return stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email ?? undefined,
    metadata: { userId, kind: "credits", credits: String(credits) },
    payment_intent_data: {
      metadata: { userId, kind: "credits", credits: String(credits) },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: reportCurrency(),
          unit_amount: tetri,
          product_data: {
            name: `${credits} კრედიტი`,
            description: `Vivida · ₾${gel} — ${credits} კრედიტი`,
          },
        },
      },
    ],
    success_url: `${origin}/credits?status=success`,
    cancel_url: `${origin}/credits?status=canceled`,
  });
}

// ── Recurring subscription (Vivida Pro) ────────────────────────────────────

/** Monthly Pro price in minor units. Default ₾19.90. */
export function subPriceCents(): number {
  const raw = Number(process.env.SUB_PRICE_CENTS);
  return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 1990;
}

/** Currency Stripe charges the subscription in. Default "gel". */
export function subCurrency(): string {
  return (process.env.SUB_CURRENCY ?? "gel").toLowerCase();
}

/**
 * Hosted Checkout for the monthly Pro subscription. `userId` rides on both the
 * session and the subscription metadata so every later subscription webhook
 * can resolve the owner. Reuses an existing Stripe customer when we have one.
 */
export async function createSubscriptionCheckout(opts: {
  userId: string;
  email?: string | null;
  customerId?: string | null;
  origin: string;
}): Promise<Stripe.Checkout.Session> {
  const { userId, email, customerId, origin } = opts;
  return stripe().checkout.sessions.create({
    mode: "subscription",
    ...(customerId
      ? { customer: customerId }
      : { customer_email: email ?? undefined }),
    metadata: { userId, kind: "subscription" },
    subscription_data: { metadata: { userId } },
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: subCurrency(),
          unit_amount: subPriceCents(),
          recurring: { interval: "month" },
          product_data: {
            name: "Vivida Pro",
            description: "Vivida Pro — ყოველთვიური გამოწერა",
          },
        },
      },
    ],
    success_url: `${origin}/subscription?status=success`,
    cancel_url: `${origin}/subscription?status=canceled`,
  });
}

/** Billing portal session — saved cards, cancel, invoices (Stripe-hosted). */
export async function createBillingPortal(opts: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return stripe().billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: opts.returnUrl,
  });
}

/** Verify + parse a Stripe webhook payload. Throws on bad signature. */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return stripe().webhooks.constructEvent(payload, signature, secret);
}
