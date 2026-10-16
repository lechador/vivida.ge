import "server-only";

import { and, eq, inArray, like, or } from "drizzle-orm";

import { db } from "@/db";
import { creditTransactions, premiumSubscriptions } from "@/db/schema";

/**
 * Server truth for "has this user ever paid money", shared by the monthly
 * bonus gate, the first-purchase experiment, and the win-back audience.
 *
 * A payer is anyone with a Stripe-confirmed credit purchase (a `purchase`
 * ledger row keyed by a `cs_` checkout session, the same definition the
 * first-purchase growth metrics use) or a Stripe premium subscription row.
 * Free grants, credit spends, gifts, and store/crypto entitlements do not
 * count, so an experiment or bonus rule built on this can never mistake a
 * free-credit user for a buyer.
 */
export async function hasEverPaid(userId: string): Promise<boolean> {
  const [purchase, subscription] = await Promise.all([
    db
      .select({ id: creditTransactions.id })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          eq(creditTransactions.reason, "purchase"),
          like(creditTransactions.ref, "cs_%"),
        ),
      )
      .limit(1),
    db
      .select({ userId: premiumSubscriptions.userId })
      .from(premiumSubscriptions)
      .where(
        and(
          eq(premiumSubscriptions.userId, userId),
          eq(premiumSubscriptions.source, "stripe"),
        ),
      )
      .limit(1),
  ]);
  return purchase.length > 0 || subscription.length > 0;
}

/** Batch variant for cron audiences: the subset of `userIds` who have paid. */
export async function usersWhoHavePaid(
  userIds: readonly string[],
): Promise<Set<string>> {
  const paid = new Set<string>();
  if (userIds.length === 0) return paid;
  const [purchases, subscriptions] = await Promise.all([
    db
      .select({ userId: creditTransactions.userId })
      .from(creditTransactions)
      .where(
        and(
          inArray(creditTransactions.userId, [...userIds]),
          eq(creditTransactions.reason, "purchase"),
          like(creditTransactions.ref, "cs_%"),
        ),
      ),
    db
      .select({ userId: premiumSubscriptions.userId })
      .from(premiumSubscriptions)
      .where(
        and(
          inArray(premiumSubscriptions.userId, [...userIds]),
          eq(premiumSubscriptions.source, "stripe"),
        ),
      ),
  ]);
  for (const row of purchases) paid.add(row.userId);
  for (const row of subscriptions) paid.add(row.userId);
  return paid;
}

/** Single-user monthly-gate inputs for account surfaces that explain the drop. */
export async function monthlyGateFor(
  userId: string,
): Promise<{ receivedWelcomeBonus: boolean; hasEverPaid: boolean }> {
  const [paid, welcome] = await Promise.all([
    hasEverPaid(userId),
    db
      .select({ id: creditTransactions.id })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          or(
            eq(creditTransactions.reason, "signup_bonus"),
            eq(creditTransactions.reason, "first_return_bonus"),
          ),
        ),
      )
      .limit(1),
  ]);
  return { receivedWelcomeBonus: welcome.length > 0, hasEverPaid: paid };
}

/** Users who received the welcome (signup) bonus, for free-economy gates. */
export async function usersWithWelcomeBonus(
  userIds: readonly string[],
): Promise<Set<string>> {
  const found = new Set<string>();
  if (userIds.length === 0) return found;
  const rows = await db
    .select({ userId: creditTransactions.userId })
    .from(creditTransactions)
    .where(
      and(
        inArray(creditTransactions.userId, [...userIds]),
        or(
          eq(creditTransactions.reason, "signup_bonus"),
          eq(creditTransactions.reason, "first_return_bonus"),
        ),
      ),
    );
  for (const row of rows) found.add(row.userId);
  return found;
}
