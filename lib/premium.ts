import { and, eq, isNull, or } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/db";
import { cryptoPurchases, premiumSubscriptions, users } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { normalizeCountryCode } from "@/lib/billing-config";
import { USDC_PREMIUM_PASS } from "@/lib/crypto-config";
import { stripe } from "@/lib/stripe";

const ENTITLED_STATUSES = new Set(["active", "trialing"]);

export function statusHasPremiumAccess(status: string): boolean {
  return ENTITLED_STATUSES.has(status);
}

/** Fast entitlement check used by every credit gate. */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ isPremium: users.isPremium, premiumUntil: users.premiumUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return Boolean(
    row?.isPremium &&
    row.premiumUntil &&
    row.premiumUntil.getTime() > Date.now(),
  );
}

export async function getPremiumSubscription(userId: string) {
  const [row] = await db
    .select()
    .from(premiumSubscriptions)
    .where(eq(premiumSubscriptions.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getBillingIdentity(userId: string) {
  const [row] = await db
    .select({
      email: users.email,
      countryCode: users.residenceCountryCode,
      stripeCustomerId: users.stripeCustomerId,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
      // Checkout reads this to write the Stripe line item in the buyer's
      // language. Carried on the row the billing routes already fetch, so
      // they don't have to import the db-backed getUserLocale.
      interfaceLanguage: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

function idOf(value: string | { id: string } | null): string | null {
  return typeof value === "string" ? value : (value?.id ?? null);
}

/**
 * Mirror one Stripe Subscription into the entitlement row. The Subscription's
 * metadata is set by our Checkout Session and survives later webhook events.
 */
export async function syncPremiumSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
): Promise<string | null> {
  const customerId = idOf(subscription.customer);
  const metadataUserId = subscription.metadata?.userId || null;

  let userId = metadataUserId || fallbackUserId || null;
  if (!userId && customerId) {
    const [owner] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);
    userId = owner?.id ?? null;
  }
  if (!userId) return null;

  const item = subscription.items.data[0];
  if (!item) return null;
  const price = item.price;
  const countryCode =
    normalizeCountryCode(subscription.metadata?.countryCode) ?? "GB";
  const planKey =
    subscription.metadata?.planKey || price.lookup_key || "premium";
  const amountMinor = price.unit_amount ?? 0;
  const periodStart = new Date(item.current_period_start * 1000);
  const periodEnd = new Date(item.current_period_end * 1000);
  const active = statusHasPremiumAccess(subscription.status);

  // Two sequential writes rather than a transaction: production runs the
  // neon-http driver, which throws "No transactions support in neon-http
  // driver" the moment db.transaction() is called — so every PRO checkout
  // failed to entitle its buyer in prod while CI (node-postgres) stayed green.
  // Both statements are idempotent, and any throw here propagates to the
  // webhook route, which answers 500 so Stripe redelivers until both land.
  const record = {
    planKey,
    countryCode,
    // Stamp the owner explicitly. A Stripe write that left `source` at its
    // default would be indistinguishable from a store purchase the moment the
    // default ever changes — and the RevenueCat path refuses to deactivate a
    // row it does not own, so this field decides who can cancel what.
    source: "stripe" as const,
    stripeSubscriptionId: subscription.id,
    stripePriceId: price.id,
    // Clear any store identity: if Stripe is taking the subscription over, a
    // stale RevenueCat transaction id would collide on its unique index the
    // next time that user bought in the app.
    rcOriginalTransactionId: null,
    rcProductId: null,
    rcStore: null,
    status: subscription.status,
    currency: price.currency,
    amountMinor,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    updatedAt: new Date(),
  };

  await db
    .insert(premiumSubscriptions)
    .values({ userId, ...record })
    .onConflictDoUpdate({
      target: premiumSubscriptions.userId,
      set: record,
    });

  await db
    .update(users)
    .set({
      ...(customerId ? { stripeCustomerId: customerId } : {}),
      isPremium: active,
      premiumUntil: periodEnd,
    })
    .where(eq(users.id, userId));

  invalidateHeaderForUser(userId);
  return userId;
}

/** Checkout completion gives us the durable Customer↔User link immediately. */
export async function activatePremiumFromCheckout(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  const customerId = idOf(session.customer);
  if (!userId) return;

  if (customerId) {
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }

  const subscriptionId = idOf(session.subscription);
  if (!subscriptionId) return;
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  await syncPremiumSubscription(subscription, userId);
}

/**
 * Turn auto-renew off (or back on) for a Stripe subscription.
 *
 * Returns null when there is nothing we can cancel — no subscription, or one
 * bought through the App Store / Play Store. A store subscription can only be
 * cancelled by its owner in the store's own account settings; there is no API
 * for us to do it, and the UI must send them there instead of showing a button
 * that cannot work.
 */
export async function updateSubscriptionCancellation(
  userId: string,
  cancelAtPeriodEnd: boolean,
) {
  const current = await getPremiumSubscription(userId);
  if (!current) return null;
  if (current.source !== "stripe" || !current.stripeSubscriptionId) return null;
  const updated = await stripe().subscriptions.update(
    current.stripeSubscriptionId,
    { cancel_at_period_end: cancelAtPeriodEnd },
  );
  await syncPremiumSubscription(updated, userId);
  return updated;
}

export async function findUserIdForStripeSubscription(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const metadataUserId = subscription.metadata?.userId;
  if (metadataUserId) return metadataUserId;
  const customerId = idOf(subscription.customer);
  if (!customerId) return null;
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .leftJoin(premiumSubscriptions, eq(premiumSubscriptions.userId, users.id))
    .where(
      or(
        eq(users.stripeCustomerId, customerId),
        eq(premiumSubscriptions.stripeSubscriptionId, subscription.id),
      ),
    )
    .limit(1);
  return row?.id ?? null;
}

/**
 * Grant a one-time PRO pass bought with crypto (English site).
 *
 * Crypto transfers cannot auto-renew, so the pass simply extends
 * `premiumUntil` by `days` — stacking on whatever time the user already
 * has. Exactly-once is enforced by electing a single runner through the
 * purchase row's `grantedAt` (a conditional NULL → now() update): a poll
 * that races the original confirmation can re-call this safely, and a
 * confirmed row that never got its grant self-heals on the next read.
 *
 * The subscription row keeps the one-row-per-user model: it is written with
 * source "crypto" and no processor IDs. A row owned by a still-entitled
 * Stripe/RevenueCat subscription is left untouched (the crypto purchase
 * route refuses that case up front; this is belt-and-braces for a race).
 */
export async function grantPremiumPassFromCrypto(input: {
  purchaseId: string;
  userId: string;
  days: number;
  amountMinor: number;
  txSignature: string;
}): Promise<void> {
  // Elect exactly one grant runner for this purchase.
  const elected = await db
    .update(cryptoPurchases)
    .set({ grantedAt: new Date() })
    .where(
      and(
        eq(cryptoPurchases.id, input.purchaseId),
        isNull(cryptoPurchases.grantedAt),
      ),
    )
    .returning({ id: cryptoPurchases.id });
  if (elected.length === 0) return; // already granted

  const [row] = await db
    .select({
      premiumUntil: users.premiumUntil,
      countryCode: users.residenceCountryCode,
    })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);
  const now = new Date();
  const base =
    row?.premiumUntil && row.premiumUntil.getTime() > now.getTime()
      ? row.premiumUntil
      : now;
  const until = new Date(base.getTime() + input.days * 86_400_000);

  await db
    .update(users)
    .set({ isPremium: true, premiumUntil: until })
    .where(eq(users.id, input.userId));

  const [existing] = await db
    .select({
      source: premiumSubscriptions.source,
      status: premiumSubscriptions.status,
    })
    .from(premiumSubscriptions)
    .where(eq(premiumSubscriptions.userId, input.userId))
    .limit(1);

  const keepProcessorRow =
    existing &&
    existing.source !== "crypto" &&
    statusHasPremiumAccess(existing.status);

  if (!keepProcessorRow) {
    const record = {
      planKey: USDC_PREMIUM_PASS.key,
      countryCode: normalizeCountryCode(row?.countryCode) ?? "US",
      source: "crypto" as const,
      stripeSubscriptionId: null,
      stripePriceId: null,
      rcOriginalTransactionId: null,
      rcProductId: null,
      rcStore: null,
      status: "active",
      currency: "usdc",
      amountMinor: input.amountMinor,
      currentPeriodStart: now,
      currentPeriodEnd: until,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      updatedAt: now,
    };
    await db
      .insert(premiumSubscriptions)
      .values({ userId: input.userId, ...record })
      .onConflictDoUpdate({
        target: premiumSubscriptions.userId,
        set: record,
      });
  }

  invalidateHeaderForUser(input.userId);
}
