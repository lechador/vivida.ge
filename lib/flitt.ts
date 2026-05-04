/**
 * Flitt (formerly Fondy) payment gateway client.
 *
 * Docs: https://docs.flitt.com/
 *
 * Flow:
 *  1. createCheckoutUrl() — POST signed JSON to /api/checkout/url, get back
 *     a hosted checkout URL. Redirect the user there.
 *  2. On success / fail, Flitt POSTs to our `server_callback_url` with the
 *     same signed param shape. verifyCallback() checks the signature.
 *  3. For recurring (subscription) charges, the first payment must include
 *     `subscription: 'Y'` + `subscription_callback_url`. Flitt then sends
 *     periodic webhooks for each renewal.
 *
 * Signature scheme (per Flitt docs):
 *   sha1( secret + "|" + values.filter(notEmpty).sort_by_key().join("|") )
 * where `values` are stringified param values, sorted alphabetically by
 * their key.
 */

import { createHash } from "node:crypto";

const FLITT_API_BASE = "https://pay.flitt.com/api";

export type FlittCurrency = "GEL" | "USD" | "EUR" | "UAH";

export type CreateCheckoutInput = {
  /** Unique per attempt. We use `payment.id` from our DB. */
  orderId: string;
  /** Amount in minor units (tetri for GEL). */
  amountMinor: number;
  currency: FlittCurrency;
  /** Public-facing description shown on the checkout page. */
  description: string;
  /** Customer's email — Flitt prefills the form. */
  email: string;
  /** Where Flitt POSTs the signed callback (your /api/flitt/webhook route). */
  serverCallbackUrl: string;
  /** Where the browser is redirected after success/fail. */
  responseUrl: string;
  /** ISO-639-1 — Flitt UI language. */
  language?: "ka" | "en" | "ru";
  /** Set to true for recurring (subscription) — the card is tokenized. */
  recurring?: boolean;
  /** Required when recurring=true — Flitt POSTs renewal callbacks here. */
  subscriptionCallbackUrl?: string;
};

export type FlittCheckoutResult = {
  checkoutUrl: string;
  paymentId: string;
};

interface FlittApiResponse<T> {
  response: T & {
    response_status: "success" | "failure";
    error_code?: number;
    error_message?: string;
  };
}

interface CheckoutResponse {
  checkout_url?: string;
  payment_id?: number;
}

/**
 * Per Flitt's signature spec — concatenate non-empty values (sorted by key)
 * with `|` separators, prefixed by the secret key, then SHA-1.
 */
export function signParams(
  params: Record<string, string | number | undefined | null>,
  secret: string
): string {
  const values: string[] = [secret];
  const sortedKeys = Object.keys(params).sort();
  for (const k of sortedKeys) {
    const v = params[k];
    if (v === undefined || v === null) continue;
    const str = String(v);
    if (str === "") continue;
    values.push(str);
  }
  return createHash("sha1").update(values.join("|")).digest("hex");
}

/**
 * Verify that a Flitt-sent webhook payload genuinely originates from Flitt.
 * Returns true if the embedded signature matches what we'd compute from the
 * other params.
 */
export function verifyCallback(
  payload: Record<string, string | number | undefined | null>,
  secret: string
): boolean {
  const provided = payload.signature;
  if (typeof provided !== "string" || !provided) return false;
  const { signature: _, response_signature_string: __, ...rest } = payload;
  const expected = signParams(rest, secret);
  return expected === provided;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `${name} is not configured. Add it to .env.local to enable Flitt payments.`
    );
  }
  return v;
}

export function isFlittConfigured(): boolean {
  return Boolean(process.env.FLITT_MERCHANT_ID && process.env.FLITT_SECRET_KEY);
}

export async function createCheckoutUrl(
  input: CreateCheckoutInput
): Promise<FlittCheckoutResult> {
  const merchantId = requireEnv("FLITT_MERCHANT_ID");
  const secret = requireEnv("FLITT_SECRET_KEY");

  if (input.recurring && !input.subscriptionCallbackUrl) {
    throw new Error(
      "createCheckoutUrl: subscriptionCallbackUrl is required when recurring=true"
    );
  }

  const params: Record<string, string | number | undefined> = {
    merchant_id: merchantId,
    order_id: input.orderId,
    order_desc: input.description,
    amount: input.amountMinor,
    currency: input.currency,
    sender_email: input.email,
    server_callback_url: input.serverCallbackUrl,
    response_url: input.responseUrl,
    lang: input.language ?? "ka",
  };
  if (input.recurring) {
    params.subscription = "Y";
    params.subscription_callback_url = input.subscriptionCallbackUrl;
    params.recurring_data = JSON.stringify({
      every: 1,
      period: "month",
      readonly: "y",
      state: "y",
    });
  }
  params.signature = signParams(params, secret);

  const res = await fetch(`${FLITT_API_BASE}/checkout/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request: params }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Flitt HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as FlittApiResponse<CheckoutResponse>;
  const r = json.response;
  if (r.response_status !== "success" || !r.checkout_url) {
    throw new Error(
      `Flitt error ${r.error_code ?? ""}: ${r.error_message ?? "unknown"}`
    );
  }

  return {
    checkoutUrl: r.checkout_url,
    paymentId: String(r.payment_id ?? ""),
  };
}

/**
 * Map Flitt's `order_status` → our internal subscription_status enum.
 * Reference: https://docs.flitt.com/en/checkout/api/responses
 */
export function mapFlittStatus(
  flittStatus: string | undefined
): "active" | "incomplete" | "past_due" | "canceled" {
  switch (flittStatus) {
    case "approved":
      return "active";
    case "processing":
    case "created":
      return "incomplete";
    case "declined":
    case "expired":
      return "past_due";
    case "reversed":
      return "canceled";
    default:
      return "incomplete";
  }
}
