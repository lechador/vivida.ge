import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Sean Ellis PMF survey responses, one per user per survey wave.
 *
 * Answers arrive from signed email links (unsubscribe token identifies the
 * user), so no session is involved. The wave column lets the same question
 * be re-asked quarterly without overwriting the baseline.
 */
export const pmfSurveyResponses = pgTable(
  "pmf_survey_response",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wave: text("wave").notNull(),
    /** very_disappointed | somewhat_disappointed | not_disappointed */
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("pmf_survey_response_user_wave_idx").on(t.userId, t.wave),
  ],
);

export type PmfSurveyResponse = typeof pmfSurveyResponses.$inferSelect;
