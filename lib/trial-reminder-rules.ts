/**
 * Pure rules for the last-day-of-trial reminder, kept free of database and
 * transport imports so they can be unit-tested without an environment.
 */

export const TRIAL_REMINDER_KIND = "trial_ending";

/** Reminder window: the trial ends within the next 24 hours. */
export const TRIAL_REMINDER_WINDOW_MS = 24 * 3_600_000;

/** Due only while the trial is still running and inside its last 24 hours. */
export function isTrialEndingDue(end: Date, now: Date): boolean {
  const ms = end.getTime() - now.getTime();
  return ms > 0 && ms <= TRIAL_REMINDER_WINDOW_MS;
}

/** Billing months of the plan a trial converts into, from its plan key. */
export function trialCadenceMonths(planKey: string): number {
  return planKey.includes("quarterly") ? 3 : 1;
}
