/**
 * Survey constants — the pure, client-safe half of the survey system.
 *
 * Split out from lib/survey.ts (which imports the DB) so the popup component
 * can read the key/answer vocabulary without dragging server-only code into
 * the browser bundle — the same split as credits-config vs credits. lib/survey
 * re-exports everything here, so server code keeps importing from one place.
 */

/** The live survey. Bump the key to run a new one — old rows stay for reporting. */
export const ACTIVE_SURVEY_KEY = "app_launch_2026_09";

/** "Will you install the app?" — the one quantifiable question. */
export const SURVEY_CHOICES = ["yes", "maybe", "web"] as const;
export type SurveyChoice = (typeof SURVEY_CHOICES)[number];

export function isSurveyChoice(v: unknown): v is SurveyChoice {
  return (
    typeof v === "string" && (SURVEY_CHOICES as readonly string[]).includes(v)
  );
}

/** Free text is optional; anything past this is the user pasting an essay. */
export const FEEDBACK_MAX = 2000;

/** 'shown' → seen but not acted on | 'dismissed' → closed | 'submitted'. */
export type SurveyAction = "shown" | "dismissed" | "submitted";
