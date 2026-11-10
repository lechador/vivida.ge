/**
 * Pure rules for the abandoned-checkout recovery email, kept free of
 * database and transport imports so they can be unit-tested without an
 * environment.
 */

export const CHECKOUT_RECOVERY_KIND = "checkout_recovery";

/** Too fresh to call abandoned: the buyer may still be on the Stripe page. */
export const CHECKOUT_RECOVERY_MIN_AGE_MS = 1 * 3_600_000;
/** Too old to be a recovery: after 48 hours it is a winback, not a rescue. */
export const CHECKOUT_RECOVERY_MAX_AGE_MS = 48 * 3_600_000;
/** One recovery email per user per week, however many checkouts they start. */
export const CHECKOUT_RECOVERY_COOLDOWN_MS = 7 * 24 * 3_600_000;

export function isAbandonedCheckout(startedAt: Date, now: Date): boolean {
  const age = now.getTime() - startedAt.getTime();
  return (
    age >= CHECKOUT_RECOVERY_MIN_AGE_MS && age <= CHECKOUT_RECOVERY_MAX_AGE_MS
  );
}

/** The slice of a Stripe Checkout Session the recovery rules read. */
export type RecoverySessionLike = {
  created: number;
  status?: string | null;
  payment_status?: string | null;
  metadata?: Record<string, string> | null;
};

/**
 * Collapse a window of Stripe Checkout Sessions into the abandoned starts to
 * rescue: userId → start time of that user's most recent abandoned checkout.
 *
 * Stripe is the source of truth for every checkout, whether or not the buyer
 * was in a paywall experiment. A session counts when it is ours (premium or
 * credits metadata with a userId), is not complete, and is old enough to be
 * called abandoned. A user with ANY completed (or paid) session started at or
 * after the abandoned one has already bought and is dropped.
 */
export function abandonedStartsFromSessions(
  sessions: readonly RecoverySessionLike[],
  now: Date,
): Map<string, Date> {
  const abandoned = new Map<string, Date>();
  const lastPurchase = new Map<string, number>();
  for (const s of sessions) {
    const userId = s.metadata?.userId;
    const kind = s.metadata?.kind;
    if (!userId || (kind !== "premium" && kind !== "credits")) continue;
    if (s.status === "complete") {
      lastPurchase.set(
        userId,
        Math.max(lastPurchase.get(userId) ?? 0, s.created),
      );
      continue;
    }
    const startedAt = new Date(s.created * 1000);
    if (!isAbandonedCheckout(startedAt, now)) continue;
    const prev = abandoned.get(userId);
    if (!prev || prev.getTime() < startedAt.getTime()) {
      abandoned.set(userId, startedAt);
    }
  }
  for (const [userId, startedAt] of abandoned) {
    const bought = lastPurchase.get(userId);
    if (
      bought !== undefined &&
      bought >= Math.floor(startedAt.getTime() / 1000)
    ) {
      abandoned.delete(userId);
    }
  }
  return abandoned;
}
