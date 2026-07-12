import { eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { subscriptions, type Subscription } from "@/db/schema";
import { awardReputation, RepSubject } from "@/lib/reputation";
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
 * Returns the user's effective plan. The subscription/Pro model has been
 * retired in favour of the credit system, so this is now a constant `'free'`
 * for everyone — every former Pro feature is either free or credit-gated at
 * its own call site (see lib/features.ts, all flags `false`).
 *
 * Kept as an async function returning PlanId so the many call sites that
 * thread `plan` around don't have to change, and so plan-based gating can be
 * reintroduced by restoring the old subscription lookup if ever needed.
 * `_userId` is unused by design.
 */
export async function getCurrentPlan(_userId: string): Promise<PlanId> {
  return "free";
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

    // Credit the one-shot "joined" reputation in the background. The welcome
    // email is intentionally NOT sent here — it fires only once onboarding
    // completes (email verified + birth data filled), from the profile-save
    // hooks via sendWelcomeIfEligible. Sending it at trial-provision time
    // (i.e. at registration) meant a "your cosmic journey begins" landed
    // before the user had even confirmed their email.
    after(async () => {
      await awardReputation({
        userId,
        kind: "joined",
        subjectId: RepSubject.oneShot(userId),
      });
    });

    return inserted;
  } catch (err) {
    console.warn(
      "[plan] provisionTrialIfMissing failed:",
      (err as Error).message
    );
    return null;
  }
}
