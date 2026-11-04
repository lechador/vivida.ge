/**
 * Birth-date activation experiment, pure config shared by client and server.
 *
 * Question: users who add a birth date retain far better than those who
 * never do (segment analysis, Nov 2026: D1 33.3% with a birth date vs 2.1%
 * without), but is that causal? The control (`banner_link`) is the shipped
 * slim banner that links to onboarding; the treatment (`inline_preview`)
 * shows a blurred preview of the personal chart with the date field inline
 * on the dashboard, removing the extra navigation step.
 *
 * Eligibility is "signed in and no birth date on file" and is enforced
 * server-side at assignment time (the experiments API checks the profile
 * before creating an assignment), so a user who saves a date mid-experiment
 * keeps their assignment for analysis but is never newly enrolled after the
 * fact. The primary outcome, `birth_date_saved`, is recorded server-side by
 * the birth-date API on the first save, never from the browser.
 */
import { EXPERIMENTS } from "@/lib/experiment-catalog";

export const BIRTH_DATE_ACTIVATION_EXPERIMENT = EXPERIMENTS.birthDateActivation;

export const BIRTH_DATE_ACTIVATION_SURFACE = "dashboard_no_chart";

export const BIRTH_DATE_ACTIVATION_VARIANTS = [
  "banner_link",
  "inline_preview",
] as const;
export type BirthDateActivationVariant =
  (typeof BIRTH_DATE_ACTIVATION_VARIANTS)[number];

export function isBirthDateActivationVariant(
  value: string | null | undefined,
): value is BirthDateActivationVariant {
  return value === "banner_link" || value === "inline_preview";
}

/** Enrollment gate, evaluated before any assignment row is created. */
export function birthDateActivationEligible(input: {
  authenticated: boolean;
  hasBirthDate: boolean;
}): boolean {
  return input.authenticated && !input.hasBirthDate;
}

/**
 * Render rule for the no-chart dashboard: only an explicit treatment
 * assignment gets the inline preview. Control, still-loading, and
 * ineligible users all keep the shipped banner.
 */
export function showInlineBirthPreview(
  variant: string | null | undefined,
): boolean {
  return variant === "inline_preview";
}
