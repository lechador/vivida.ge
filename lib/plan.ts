import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions, type Subscription } from "@/db/schema";
import type { PlanId } from "./pricing";

/**
 * Length of the auto-issued free trial that every new user gets the
 * moment they sign in. No card required — Flitt isn't even wired up yet
 * for live billing. After this window the user falls back to the free
 * tier and the upgrade CTAs become primary.
 */
export const TRIAL_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the user's effective plan right now. Pro requires:
 *  - a subscription row with plan='pro'
 *  - status='active' OR 'trialing'
 *  - currentPeriodEnd in the future (or null for trialing)
 *
 * Anything else → 'free'. Designed to be safe-by-default — if anything
 * looks off, the user gets free access (we never accidentally upsell).
 *
 * Side effect: if the user has no subscription row at all, we lazily
 * provision a trial. This handles users who existed before the trial
 * system shipped — they each get TRIAL_DAYS from their next visit.
 * Auth.js's events.createUser hook handles the happy-path (new sign-ups
 * get a trial at account-creation time).
 */
export async function getCurrentPlan(userId: string): Promise<PlanId> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) {
    // Backfill: existing pre-trial users get one starting now.
    const provisioned = await provisionTrialIfMissing(userId);
    return isProActive(provisioned) ? "pro" : "free";
  }
  return isProActive(sub) ? "pro" : "free";
}

export function isProActive(sub: Subscription | null | undefined): boolean {
  if (!sub) return false;
  if (sub.plan !== "pro") return false;
  if (sub.status !== "active" && sub.status !== "trialing") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) {
    return false;
  }
  return true;
}

/**
 * Whether the subscription represents an active free trial (Pro access
 * granted via the trial mechanism, not a paid subscription).
 */
export function isOnTrial(sub: Subscription | null | undefined): boolean {
  if (!sub) return false;
  if (sub.status !== "trialing") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) {
    return false;
  }
  return true;
}

/**
 * Whole days remaining in the trial. Returns 0 when expired or not on a
 * trial — never negative. Rounded up so "ends in 12 hours" → 1 day, which
 * matches user expectations ("you have 1 day left").
 */
export function trialDaysLeft(sub: Subscription | null | undefined): number {
  if (!isOnTrial(sub) || !sub?.currentPeriodEnd) return 0;
  const ms = sub.currentPeriodEnd.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / MS_PER_DAY));
}

/**
 * Fetch the subscription row directly. Returns null when the user has
 * never had one (= effectively free).
 *
 * NOTE: Doesn't provision a missing trial. If you're rendering trial
 * state to the user (TrialBanner, /pricing, /account, etc.) use
 * `getOrProvisionSubscription` instead — otherwise users who haven't
 * yet visited /dashboard see "no subscription" even though policy
 * says trial-on-signup.
 */
export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return sub ?? null;
}

/**
 * Returns the user's subscription row, lazily provisioning a trial if
 * none exists. Use this whenever the caller is going to *show* the
 * subscription state to the user — the lazy provision matches the
 * promise we make on signup ("you start on a trial").
 */
export async function getOrProvisionSubscription(
  userId: string
): Promise<Subscription | null> {
  const existing = await getSubscription(userId);
  if (existing) return existing;
  return await provisionTrialIfMissing(userId);
}

/**
 * Insert a trialing-Pro subscription for a user that doesn't have one yet.
 * No-op (returns the existing row) if the user already has any
 * subscription record — we never overwrite a paid plan or extend an
 * already-issued trial.
 *
 * Returns the resulting (or existing) subscription so callers can branch
 * on it. Idempotent: safe to call repeatedly. Errors are swallowed and
 * logged — provisioning failure must never break sign-in or page renders.
 */
export async function provisionTrialIfMissing(
  userId: string
): Promise<Subscription | null> {
  try {
    const existing = await getSubscription(userId);
    if (existing) return existing;

    const now = new Date();
    const periodEnd = new Date(now.getTime() + TRIAL_DAYS * MS_PER_DAY);

    const [inserted] = await db
      .insert(subscriptions)
      .values({
        userId,
        plan: "pro",
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      })
      .onConflictDoNothing()
      .returning();

    // If onConflictDoNothing skipped the insert, fetch the existing row.
    if (!inserted) return await getSubscription(userId);
    return inserted;
  } catch (err) {
    console.warn(
      "[plan] provisionTrialIfMissing failed:",
      (err as Error).message
    );
    return null;
  }
}
