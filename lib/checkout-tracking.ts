import type Stripe from "stripe";

import { requestClientIp, sendMetaConversion } from "@/lib/meta-conversions";
import { TRACKING_CONSENT_COOKIE } from "@/lib/tracking-consent";

export type CheckoutTracking = {
  allowed: boolean;
  fbp: string | null;
  fbc: string | null;
  sourceUrl: string;
  clientIpAddress: string | null;
  clientUserAgent: string | null;
};

function cookieMap(raw: string): Map<string, string> {
  return new Map(raw.split(";").flatMap((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return [];
    try { return [[key, decodeURIComponent(rest.join("="))]] as const; }
    catch { return [[key, rest.join("=")]] as const; }
  }));
}

export function checkoutTrackingFromRequest(req: Request): CheckoutTracking {
  const cookies = cookieMap(req.headers.get("cookie") ?? "");
  const allowed = cookies.get(TRACKING_CONSENT_COOKIE) === "granted";
  return {
    allowed,
    fbp: allowed ? cookies.get("_fbp") ?? null : null,
    fbc: allowed ? cookies.get("_fbc") ?? null : null,
    sourceUrl: (req.headers.get("referer") ?? new URL(req.url).origin).slice(0, 500),
    clientIpAddress: allowed ? requestClientIp(req.headers) : null,
    clientUserAgent: allowed ? req.headers.get("user-agent") : null,
  };
}

export function checkoutTrackingMetadata(tracking: CheckoutTracking): Record<string, string> {
  if (!tracking.allowed) return { tracking_consent: "denied" };
  return {
    tracking_consent: "granted",
    ...(tracking.fbp ? { track_fbp: tracking.fbp.slice(0, 500) } : {}),
    ...(tracking.fbc ? { track_fbc: tracking.fbc.slice(0, 500) } : {}),
    track_source_url: tracking.sourceUrl,
  };
}

export async function trackCheckoutStarted(input: {
  session: Stripe.Checkout.Session;
  tracking: CheckoutTracking;
  userId: string;
  email?: string | null;
  countryCode?: string | null;
  value: number;
  currency: string;
  contentId: string;
}) {
  if (!input.tracking.allowed) return;
  await sendMetaConversion({
    eventName: "InitiateCheckout",
    eventId: `${input.session.id}:initiate_checkout`,
    eventSourceUrl: input.tracking.sourceUrl,
    email: input.email,
    externalId: input.userId,
    countryCode: input.countryCode,
    clientIpAddress: input.tracking.clientIpAddress,
    clientUserAgent: input.tracking.clientUserAgent,
    fbp: input.tracking.fbp,
    fbc: input.tracking.fbc,
    value: input.value,
    currency: input.currency,
    contentId: input.contentId,
  });
}

export async function trackCheckoutCompleted(input: {
  session: Stripe.Checkout.Session;
  email?: string | null;
  countryCode?: string | null;
}) {
  const metadata = input.session.metadata;
  if (metadata?.tracking_consent !== "granted") return;
  const kind = metadata.kind;
  if (kind !== "credits" && kind !== "premium") return;
  const value = (input.session.amount_total ?? 0) / 100;
  const currency = input.session.currency ?? (kind === "premium" ? "gbp" : "gel");
  const contentId = kind === "premium" ? metadata.planKey ?? "vivida_pro" : `credits_${metadata.credits ?? "pack"}`;
  const base = {
    eventSourceUrl: metadata.track_source_url ?? "https://www.vividaastro.com",
    email: input.email ?? input.session.customer_details?.email,
    externalId: metadata.userId,
    countryCode: input.countryCode,
    fbp: metadata.track_fbp,
    fbc: metadata.track_fbc,
    value,
    currency,
    contentId,
  };
  await sendMetaConversion({ ...base, eventName: "Purchase", eventId: `${input.session.id}:purchase` });
  if (kind === "premium") {
    await sendMetaConversion({ ...base, eventName: "Subscribe", eventId: `${input.session.id}:subscribe` });
  }
}
