import type Stripe from "stripe";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";

type OurStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

const STATUS_MAP: Record<string, OurStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  paused: "inactive",
};

// Period fields moved from the subscription to its items in newer API versions;
// read from either so we stay correct across Stripe versions.
function ts(value: unknown): Date | null {
  return typeof value === "number" ? new Date(value * 1000) : null;
}
function periodEnd(sub: Stripe.Subscription): Date | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  return ts(top ?? item?.current_period_end);
}
function periodStart(sub: Stripe.Subscription): Date | null {
  const top = (sub as unknown as { current_period_start?: number }).current_period_start;
  const item = sub.items?.data?.[0] as unknown as { current_period_start?: number } | undefined;
  return ts(top ?? item?.current_period_start);
}

/**
 * Upsert our `subscriptions` row from a Stripe Subscription object. Resolves
 * the owner via subscription metadata (set at checkout), falling back to the
 * stored stripeSubscriptionId. Plan is pro while active/trialing, else free.
 */
export async function syncStripeSubscription(sub: Stripe.Subscription): Promise<void> {
  let userId = sub.metadata?.userId ?? null;
  if (!userId) {
    const [row] = await db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, sub.id))
      .limit(1);
    userId = row?.userId ?? null;
  }
  if (!userId) {
    console.warn(`[sub-sync] could not resolve userId for subscription ${sub.id}`);
    return;
  }

  const status = STATUS_MAP[sub.status] ?? "inactive";
  const isPro = status === "active" || status === "trialing";
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  const price = sub.items?.data?.[0]?.price;
  const now = new Date();

  const values = {
    userId,
    plan: (isPro ? "pro" : "free") as "pro" | "free",
    status,
    interval: "month" as const,
    priceCents: price?.unit_amount ?? null,
    currency: (price?.currency ?? "gel").toUpperCase(),
    currentPeriodStart: periodStart(sub),
    currentPeriodEnd: periodEnd(sub),
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    updatedAt: now,
  };

  await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({ target: subscriptions.userId, set: values });
}
