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
