import { eq, or } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/db";
import { premiumSubscriptions, users } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { normalizeCountryCode } from "@/lib/billing-config";
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
    row?.isPremium && row.premiumUntil && row.premiumUntil.getTime() > Date.now(),
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
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

function idOf(value: string | { id: string } | null): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
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
  const planKey = subscription.metadata?.planKey || price.lookup_key || "premium";
  const amountMinor = price.unit_amount ?? 0;
  const periodStart = new Date(item.current_period_start * 1000);
  const periodEnd = new Date(item.current_period_end * 1000);
  const active = statusHasPremiumAccess(subscription.status);

  await db.transaction(async (tx) => {
    await tx
      .insert(premiumSubscriptions)
      .values({
        userId,
        planKey,
        countryCode,
        stripeSubscriptionId: subscription.id,
        stripePriceId: price.id,
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
      })
      .onConflictDoUpdate({
        target: premiumSubscriptions.userId,
        set: {
          planKey,
          countryCode,
          stripeSubscriptionId: subscription.id,
          stripePriceId: price.id,
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
        },
      });

    await tx
      .update(users)
      .set({
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        isPremium: active,
        premiumUntil: periodEnd,
      })
      .where(eq(users.id, userId));
  });

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

export async function updateSubscriptionCancellation(
  userId: string,
  cancelAtPeriodEnd: boolean,
) {
  const current = await getPremiumSubscription(userId);
  if (!current) return null;
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
    .leftJoin(
      premiumSubscriptions,
      eq(premiumSubscriptions.userId, users.id),
    )
    .where(
      or(
        eq(users.stripeCustomerId, customerId),
        eq(premiumSubscriptions.stripeSubscriptionId, subscription.id),
      ),
    )
    .limit(1);
  return row?.id ?? null;
}
