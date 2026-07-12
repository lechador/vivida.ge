import type { PlanId } from "./pricing";

/**
 * The subscription/Pro model has been retired in favour of the credit system.
 * Every former Pro feature is now free or credit-gated at its own call site
 * (see lib/features.ts, all flags `false`), so a user's "plan" is always
 * `'free'`.
 *
 * Kept as an async function returning PlanId so the many call sites that still
 * thread `plan` around (AppHeader, page props, etc.) don't have to change.
 * `_userId` is unused by design.
 */
export async function getCurrentPlan(_userId: string): Promise<PlanId> {
  return "free";
}
