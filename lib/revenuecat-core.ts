import { eq } from "drizzle-orm";

import { db } from "@/db";
import { premiumSubscriptions, users } from "@/db/schema";
import { grantCreditsOnce } from "@/lib/credits";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import {
  IAP_PREMIUM_PLAN_KEY,
  creditsForProduct,
  isPremiumProduct,
} from "@/lib/iap-config";
import { statusHasPremiumAccess } from "@/lib/premium";
import { normalizeCountryCode } from "@/lib/billing-config";

/**
 * RevenueCat webhook handling — the store-side twin of lib/premium's Stripe
 * sync. Framework-agnostic so it can be tested without a Request; the route is
 * a thin shell around `handleRevenueCatEvent`.
 *
 * Vivida sells two different things through the stores and they behave nothing
 * alike:
 *
 *  - **PRO** is an auto-renewable subscription. It writes the same entitlement
 *    the Stripe path writes (`users.isPremium` + `premiumUntil`), tagged with
 *    `source: "revenuecat"` so the two processors can never cancel each other.
 *  - **Credit packs** are consumables. They are one-off grants into the ledger,
 *    NOT entitlements, and their whole risk is arithmetic: award twice and it's
 *    free money, award zero times and a paid top-up vanished.
 */

/** The subset of RevenueCat's event payload we act on. */
export type RcEvent = {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  transaction_id?: string;
  original_transaction_id?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  store?: string;
  currency?: string;
  price_in_purchased_currency?: number;
  country_code?: string;
  period_type?: string;
};

export type RcOutcome =
  | "ignored"
  | "credits_granted"
  | "credits_duplicate"
  | "premium_activated"
  | "premium_deactivated"
  | "source_conflict";

/** Events that grant or keep an entitlement alive. */
const ACTIVATING = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "NON_RENEWING_PURCHASE",
]);

/** Events that revoke one immediately. */
const DEACTIVATING = new Set(["EXPIRATION", "REFUND", "SUBSCRIPTION_PAUSED"]);

/**
 * CANCELLATION and BILLING_ISSUE are deliberately absent from both sets.
 *
 * Cancelling means "do not renew", not "cut off now" — the user has paid
 * through the end of the period and `premiumUntil` plus the read-time expiry
 * check in isPremiumUser() already retire them on time. Revoking here is the
 * single most common way to cut a paying customer off early, so it is called
 * out rather than merely omitted.
 */

/** Our user ids are UUIDs; anything else is an anonymous RevenueCat id. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function log(outcome: string, detail: string) {
  console.log(`[revenuecat] ${outcome}: ${detail}`);
}

/**
 * Apply one RevenueCat event.
 *
 * Throws on a write failure so the route can answer 500 and RevenueCat
 * redelivers. That is safe precisely because every write below is idempotent:
 * the credit grant is keyed on the transaction id, and the entitlement write is
 * an upsert. A paid purchase can therefore only be lost by answering 200 to a
 * failure — never by retrying one.
 */
export async function handleRevenueCatEvent(
  event: RcEvent | undefined | null
): Promise<RcOutcome> {
  const type = event?.type;
  const appUserId = event?.app_user_id ?? event?.original_app_user_id;
  if (!type || !appUserId || !event) return "ignored";

  // `app_user_id` is our users.id, set client-side by Purchases.logIn(userId).
  // A purchase made before sign-in carries RevenueCat's anonymous id instead;
  // it is re-attributed by a later TRANSFER event once the user logs in, so
  // ignoring it here loses nothing.
  if (!UUID_RE.test(appUserId)) {
    log("ignored", `${type} with a non-UUID app_user_id`);
    return "ignored";
  }

  const [user] = await db
    .select({ id: users.id, countryCode: users.residenceCountryCode })
    .from(users)
    .where(eq(users.id, appUserId))
    .limit(1);
  if (!user) {
    log("ignored", `${type} for unknown user ${appUserId}`);
    return "ignored";
  }

  const productId = event.product_id ?? null;

  // Dispatch on WHAT was bought before HOW the event is classified: a
  // consumable and a subscription need entirely different treatment, and the
  // product id is the only reliable discriminator.
  const credits = creditsForProduct(productId);
  if (credits !== null) {
    return handleCreditPack(user.id, event, type, credits);
  }
  if (isPremiumProduct(productId)) {
    return handlePremium(user.id, user.countryCode, event, type);
  }

  log("ignored", `${type} for unmapped product ${productId ?? "(none)"}`);
  return "ignored";
}

/** A credit pack: grant once, keyed on the store transaction. */
async function handleCreditPack(
  userId: string,
  event: RcEvent,
  type: string,
  credits: number
): Promise<RcOutcome> {
  if (DEACTIVATING.has(type)) {
    // A refunded pack is deliberately NOT clawed back. The credits may already
    // be spent, and a negative balance would break every gate that assumes a
    // non-negative one. Logged at warn so support sees it and can act by hand;
    // revisit if refund abuse ever shows up in the ledger.
    console.warn(
      `[revenuecat] ${type} on credit pack ${event.product_id} for ${userId} — ` +
        `balance left untouched, review manually`
    );
    return "ignored";
  }
  if (!ACTIVATING.has(type)) {
    log("ignored", `${type} on a credit pack needs no action`);
    return "ignored";
  }

  const transactionId = event.transaction_id ?? event.original_transaction_id;
  if (!transactionId) {
    // Without a transaction id there is no idempotency key, and granting
    // unkeyed credits on a redeliverable webhook mints currency. Refuse.
    throw new Error(
      `RevenueCat ${type} for ${userId} carried no transaction_id`
    );
  }

  const granted = await grantCreditsOnce(
    userId,
    credits,
    "purchase",
    `rc:${transactionId}`
  );

  if (!granted) {
    log("duplicate", `transaction ${transactionId} already granted`);
    return "credits_duplicate";
  }
  log("credits", `+${credits} to ${userId} (${event.product_id})`);
  return "credits_granted";
}

/** The PRO subscription: same entitlement Stripe writes, different owner. */
async function handlePremium(
  userId: string,
  residenceCountry: string | null,
  event: RcEvent,
  type: string
): Promise<RcOutcome> {
  const existing = await db
    .select()
    .from(premiumSubscriptions)
    .where(eq(premiumSubscriptions.userId, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (DEACTIVATING.has(type)) {
    if (!existing || existing.source !== "revenuecat") {
      // Never let a store event retire a Stripe subscription. The two are
      // separate contracts, and the user may well have moved to the website.
      log("ignored", `${type} but PRO is owned by ${existing?.source ?? "nobody"}`);
      return "ignored";
    }

    await db
      .update(premiumSubscriptions)
      .set({ status: statusForDeactivation(type), updatedAt: new Date() })
      .where(eq(premiumSubscriptions.userId, userId));

    // `premiumUntil` stays as written — it records what was paid for, and
    // isPremiumUser() requires isPremium AND an unexpired date, so clearing the
    // flag alone is decisive.
    await db
      .update(users)
      .set({ isPremium: false })
      .where(eq(users.id, userId));

    invalidateHeaderForUser(userId);
    log("premium off", `${userId} (${type})`);
    return "premium_deactivated";
  }

  if (!ACTIVATING.has(type)) {
    log("ignored", `${type} leaves the entitlement unchanged`);
    return "ignored";
  }

  // Double-payment guard. The app hides PRO when a Stripe subscription is
  // live, so reaching here means that guard was bypassed or raced. Do not
  // overwrite: the Stripe row owns the cancellation path, and clobbering it
  // would strand a subscription nobody can cancel. The user keeps the
  // entitlement they already have; support refunds the duplicate.
  if (
    existing &&
    existing.source === "stripe" &&
    statusHasPremiumAccess(existing.status) &&
    existing.currentPeriodEnd.getTime() > Date.now()
  ) {
    console.error(
      `[revenuecat] ${type} for ${userId} but an active Stripe PRO exists ` +
        `(${existing.stripeSubscriptionId}) — refusing to overwrite; refund the duplicate`
    );
    return "source_conflict";
  }

  const periodEnd = event.expiration_at_ms
    ? new Date(event.expiration_at_ms)
    : null;
  if (!periodEnd) {
    throw new Error(
      `RevenueCat ${type} for ${userId} carried no expiration_at_ms`
    );
  }
  const periodStart = event.purchased_at_ms
    ? new Date(event.purchased_at_ms)
    : new Date();

  const record = {
    planKey: IAP_PREMIUM_PLAN_KEY,
    countryCode:
      normalizeCountryCode(event.country_code) ??
      normalizeCountryCode(residenceCountry) ??
      "GE",
    source: "revenuecat" as const,
    // A store subscription has no Stripe identity. Nulling these on takeover
    // matters: leaving a dead subscription id behind would let the website's
    // cancel button call Stripe for a subscription the user no longer has.
    stripeSubscriptionId: null,
    stripePriceId: null,
    rcOriginalTransactionId:
      event.original_transaction_id ?? event.transaction_id ?? null,
    rcProductId: event.product_id ?? null,
    rcStore: event.store ?? null,
    status: event.period_type === "TRIAL" ? "trialing" : "active",
    currency: (event.currency ?? existing?.currency ?? "usd").toLowerCase(),
    amountMinor: minorUnits(event.price_in_purchased_currency),
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    updatedAt: new Date(),
  };

  // Two sequential writes, not a transaction: production runs the neon-http
  // driver, which throws the moment db.transaction() is called while CI's
  // node-postgres passes. Both statements are idempotent and a throw here
  // reaches the route, which answers 500 so RevenueCat redelivers.
  await db
    .insert(premiumSubscriptions)
    .values({ userId, ...record })
    .onConflictDoUpdate({
      target: premiumSubscriptions.userId,
      set: record,
    });

  await db
    .update(users)
    .set({ isPremium: true, premiumUntil: periodEnd })
    .where(eq(users.id, userId));

  invalidateHeaderForUser(userId);
  log("premium on", `${userId} until ${periodEnd.toISOString()} (${type})`);
  return "premium_activated";
}

function statusForDeactivation(type: string): string {
  if (type === "REFUND") return "refunded";
  if (type === "SUBSCRIPTION_PAUSED") return "paused";
  return "expired";
}

/**
 * RevenueCat reports price in MAJOR units as a float
 * (`price_in_purchased_currency: 19.9`); the ledger stores minor units.
 *
 * Every currency Vivida sells in is two-decimal — including AMD, which Stripe
 * also treats as two-decimal (see billing-config). If a zero-decimal storefront
 * is ever added, this needs the same per-currency table Stripe requires.
 */
function minorUnits(price: number | undefined): number {
  if (typeof price !== "number" || !Number.isFinite(price)) return 0;
  return Math.round(price * 100);
}
