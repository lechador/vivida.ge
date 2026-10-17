import "server-only";

import { and, eq, gt, inArray, like, or } from "drizzle-orm";

import { db } from "@/db";
import {
  creditTransactions,
  premiumSubscriptions,
  userActivityDays,
} from "@/db/schema";

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

/** Single-user monthly-gate input for surfaces that explain the drop. */
export async function monthlyGateFor(
  userId: string,
): Promise<{ activeRecently: boolean }> {
  const active = await usersActiveSince([userId], activityCutoffKey());
  return { activeRecently: active.has(userId) };
}

/**
 * Users with at least one recorded activity day on/after `sinceDateKey`
 * (`YYYY-MM-DD`, matching `user_activity_day.date_local`, which is text).
 *
 * Why: the monthly free-credit drop used to reach every account regardless of
 * whether it had ever been opened — 281 of 1,944 recipients in the 28 days to
 * 2026-10-16 had never been active at all. Rewards tied to a live habit are both
 * fairer and worth ~1.2x on the free-issuance guardrail.
 */
export async function usersActiveSince(
  userIds: readonly string[],
  sinceDateKey: string,
): Promise<Set<string>> {
  const active = new Set<string>();
  if (userIds.length === 0) return active;
  const rows = await db
    .select({ userId: userActivityDays.userId })
    .from(userActivityDays)
    .where(
      and(
        inArray(userActivityDays.userId, [...userIds]),
        gt(userActivityDays.dateLocal, sinceDateKey),
      ),
    );
  for (const row of rows) active.add(row.userId);
  return active;
}

/** Days of continuous activity that keep a user eligible for the monthly drop. */
export const MONTHLY_BONUS_ACTIVITY_DAYS = 28;

/** ISO date key `days` ago, for `user_activity_day.date_local` comparisons. */
export function activityCutoffKey(
  days: number = MONTHLY_BONUS_ACTIVITY_DAYS,
  now: Date = new Date(),
): string {
  const d = new Date(now.getTime() - days * 86_400_000);
  return d.toISOString().slice(0, 10);
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
