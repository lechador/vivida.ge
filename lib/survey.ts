import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { surveyResponses } from "@/db/schema";
import {
  ACTIVE_SURVEY_KEY,
  FEEDBACK_MAX,
  type SurveyAction,
  type SurveyChoice,
} from "./survey-config";

/**
 * One-shot in-app surveys — the server half.
 *
 * The rule the product wants is "every signed-in user sees this exactly once".
 * That is enforced by the row, not by a cookie: a `survey_response` row is
 * written the moment the modal renders, so closing the tab, switching devices,
 * or clearing storage never brings the popup back. Answering just updates that
 * same row.
 *
 * Copy lives in the component (bilingual and presentational); the key and
 * answer vocabulary live in survey-config (client-safe); this module owns the
 * reads and writes.
 */

export {
  ACTIVE_SURVEY_KEY,
  FEEDBACK_MAX,
  SURVEY_CHOICES,
  isSurveyChoice,
  type SurveyAction,
  type SurveyChoice,
} from "./survey-config";

/**
 * Has this user already met this survey? True for any existing row —
 * shown, dismissed, or submitted alike.
 */
export async function hasSeenSurvey(
  userId: string,
  surveyKey: string = ACTIVE_SURVEY_KEY
): Promise<boolean> {
  const [row] = await db
    .select({ id: surveyResponses.id })
    .from(surveyResponses)
    .where(
      and(
        eq(surveyResponses.userId, userId),
        eq(surveyResponses.surveyKey, surveyKey)
      )
    )
    .limit(1);
  return !!row;
}

/**
 * Record an interaction. Upserts on (user, survey) so the "shown" write and the
 * later answer collapse into one row, and concurrent tabs can't duplicate it.
 *
 * A late "shown" never overwrites a real answer (the DO UPDATE is guarded on
 * status), which matters because two tabs can render the modal at once.
 */
export async function recordSurveyResponse(opts: {
  userId: string;
  surveyKey?: string;
  action: SurveyAction;
  choice?: SurveyChoice | null;
  feedback?: string | null;
}): Promise<void> {
  const surveyKey = opts.surveyKey ?? ACTIVE_SURVEY_KEY;
  const answered = opts.action !== "shown";
  const feedback = opts.feedback?.trim().slice(0, FEEDBACK_MAX) || null;
  const choice = opts.choice ?? null;

  await db
    .insert(surveyResponses)
    .values({
      userId: opts.userId,
      surveyKey,
      status: opts.action,
      choice,
      feedback,
      respondedAt: answered ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [surveyResponses.userId, surveyResponses.surveyKey],
      set: {
        status: sql`excluded.status`,
        choice: sql`excluded.choice`,
        feedback: sql`excluded.feedback`,
        respondedAt: sql`excluded.responded_at`,
      },
      // Only the 'shown' placeholder is upgradable — once a user has dismissed
      // or submitted, that answer is final and a stray write can't clobber it.
      setWhere: sql`${surveyResponses.status} = 'shown'`,
    });
}
