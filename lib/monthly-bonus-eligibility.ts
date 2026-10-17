/**
 * Monthly free-credit drop eligibility, pure so the economy rule is testable
 * without a database.
 *
 * **One gate: recent activity (owner decision, 2026-10-17).**
 *
 * The drop used to be paid to every account regardless of whether it had ever
 * been opened. Measured over the 28 days to 2026-10-16: **1,944 recipients, of
 * whom 281 had never been active at all**, and only 472 were active in the last
 * 28 days. That made it the least-targeted grant in the economy — 43.4% of all
 * free issuance — and the main driver of a 3.62x free-credit ratio against a
 * 2.5x stop threshold.
 *
 * It is now a **habit reward for active accounts**: 3 credits to users with any
 * recorded activity in the last MONTHLY_BONUS_ACTIVITY_DAYS days. Projected
 * effect: 830 recipients, ratio **2.45x**, while still rewarding the people
 * actually using the product.
 *
 * A previous rule also paused the drop for users who received a welcome bonus and
 * never paid. That gate was removed in the same decision: it was never deployed
 * (it only shipped in d9d537a), it reduced the drop to 233 recipients, and
 * compounding it with the activity gate left **33**. Paying for engagement is the
 * point of a habit reward, so being an active never-payer no longer disqualifies
 * anyone.
 */
export function monthlyBonusEligible(input: {
  /** Any recorded activity in the last MONTHLY_BONUS_ACTIVITY_DAYS days. */
  activeRecently: boolean;
}): boolean {
  return input.activeRecently;
}
