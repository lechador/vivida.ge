/**
 * Monthly free-credit drop eligibility, pure so the economy rule is testable
 * without a database.
 *
 * The monthly +5 used to stack on top of the untouched welcome bonus, so a
 * user who never paid could accumulate free credits indefinitely without ever
 * facing a paywall. The drop now pauses for exactly that cohort, welcome
 * bonus received, no confirmed payment yet, and resumes the month after
 * their first paid action. Users who never received a welcome bonus (older
 * accounts, admin-created) and all payers stay eligible.
 */
export function monthlyBonusEligible(input: {
  receivedWelcomeBonus: boolean;
  hasEverPaid: boolean;
}): boolean {
  if (input.hasEverPaid) return true;
  return !input.receivedWelcomeBonus;
}
