import {
  pgTable,
  text,
  timestamp,
  integer,
  doublePrecision,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { MbtiScoresJson } from "./archive";
import { users } from "./users";

/**
 * "Chat with your chart" (ჰკითხე ვარსკვლავებს) — one ongoing thread per user.
 * Each row is a turn; `role` is 'user' | 'assistant'. The AI is grounded in
 * the user's natal chart at request time (not stored per message).
 */
export const chartChatMessages = pgTable(
  "chart_chat_message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 'user' | 'assistant' */
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("chart_chat_user_created_idx").on(t.userId, t.createdAt)],
);

export type ChartChatMessage = typeof chartChatMessages.$inferSelect;

/**
 * Long-term memory for \"chat with your chart\" — one row per user.
 * A rolling portrait the model refines over time (who the user is, what
 * they care about, how they like to be spoken to), so replies adapt beyond
 * the last-12-messages window. Refreshed by a cheap background LLM merge
 * every few exchanges; reads are free (single PK lookup per request).
 */
export const askUserMemories = pgTable("ask_user_memory", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  /**
   * Rolling portrait in the user's language (≤1500 chars): life context,
   * recurring topics, emotional patterns. Never medical/financial directives.
   */
  summary: text("summary").notNull().default(""),
  /**
   * Structured traits the prompt mirrors:
   * style: { verbosity: 'short'|'medium'|'detailed', tone: string } —
   * topics: string[] — recurring interests; notes: short-lived context.
   */
  traits: jsonb("traits").$type<AskUserMemoryTraits>().notNull().default({}),
  /** Total user turns seen when the memory was last refreshed. */
  turnsSeen: integer("turns_seen").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type AskUserMemoryTraits = {
  verbosity?: "short" | "medium" | "detailed";
  tone?: string;
  topics?: string[];
  notes?: string;
  /** ≤3 unresolved threads worth gently asking about later (upcoming events, ongoing situations). */
  openLoops?: string[];
};

export type AskUserMemory = typeof askUserMemories.$inferSelect;

/**
 * 7-day forecast for the dashboard, one row per user. The same row is
 * overwritten each new local-day — we never need a history of forecasts.
 * Each entry in `days` is a (computed scores + AI narrative) pair for one
 * calendar day.
 */
export const weeklyForecasts = pgTable("weekly_forecast", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Local date (YYYY-MM-DD) of `days[0]` — the user's "today" when generated. */
  weekStart: date("week_start", { mode: "string" }).notNull(),
  days: jsonb("days").$type<WeeklyForecastDay[]>().notNull(),
  promptVersion: integer("prompt_version").notNull().default(1),
  /** Cache invalidates if natal data changed since generation. */
  natalInputHash: text("natal_input_hash").notNull(),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type WeeklyForecastDay = {
  dateIso: string; // YYYY-MM-DD (user's local TZ)
  weekdayKa: string; // ე.ხ. "ორშაბათი"
  /** 0-100 — intensity-weighted sum of harmonic transit-to-natal aspects. */
  harmonyScore: number;
  /** 0-100 — intensity-weighted sum of tense transit-to-natal aspects. */
  challengeScore: number;
  moonSignKa: string;
  moonSignEn: string;
  headline: string; // 5-8 words, AI
  harmonicReason: string; // why it's supportive
  challengingReason: string; // why it's friction
  advice: string; // 1 short practical tip
  /** Top 3 driving aspects (for the "drivers" list under each day). */
  drivers: Array<{
    transit: string;
    natal: string;
    kind: string;
    family: "harmonic" | "tense" | "neutral";
    orb: number;
  }>;
};

export type WeeklyForecast = typeof weeklyForecasts.$inferSelect;

export type NewWeeklyForecast = typeof weeklyForecasts.$inferInsert;

/**
 * "Astro-MBTI" test results — one row per completed test (users can retake,
 * so history accumulates; the profile lists all of them newest-first).
 *
 * `mbtiType` is the 4-letter code (e.g. "ESTJ"); `archetypeNameGe` is the
 * short Georgian archetype the AI names (e.g. "აღმასრულებელი"); `scores` holds
 * the per-axis breakdown for the progress bars; `aiSynthesisText` is the
 * Gemini-generated Georgian psychological + astrological synthesis, personal
 * to this user's chart. `model` records which model produced the text (same
 * bookkeeping as every other AI-output table here).
 */
export const mbtiTestResults = pgTable(
  "mbti_test_results",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 4-letter MBTI code, e.g. "INFP". */
    mbtiType: text("mbti_type").notNull(),
    /** Short Georgian archetype name, e.g. "აღმასრულებელი". */
    archetypeNameGe: text("archetype_name_ge").notNull(),
    /** Per-axis E/I, S/N, T/F, J/P breakdown. */
    scores: jsonb("scores").$type<MbtiScoresJson>().notNull(),
    /** Full Georgian AI synthesis shown on the results page. */
    aiSynthesisText: text("ai_synthesis_text").notNull(),
    /** Model id that produced the synthesis. */
    model: text("model").notNull(),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Profile page lists a user's tests newest-first.
    index("mbti_results_user_created_idx").on(t.userId, t.createdAt),
  ],
);

export type MbtiTestResult = typeof mbtiTestResults.$inferSelect;

export type NewMbtiTestResult = typeof mbtiTestResults.$inferInsert;

export type IqDomainScoresJson = {
  numeric: number;
  logic: number;
  spatial: number;
  pattern: number;
};

/**
 * One row per completed IQ test. Kept for *both* signed-in users (history on
 * their profile) and anonymous takers (`user_id` null) — the anonymous rows are
 * what let us self-norm: recompute each item's p-value and the θ→IQ mapping from
 * the real score distribution instead of the provisional item-difficulty guess.
 * `attempt_id` (client-generated) dedupes result-page refreshes/re-POSTs.
 */
export const iqResults = pgTable(
  "iq_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    attemptId: text("attempt_id").notNull().unique(),
    iq: integer("iq").notNull(),
    theta: doublePrecision("theta").notNull(),
    percentile: integer("percentile").notNull(),
    correct: integer("correct").notNull(),
    total: integer("total").notNull(),
    /** Per-domain percent correct, for the breakdown + norming. */
    domainScores: jsonb("domain_scores").$type<IqDomainScoresJson>().notNull(),
    /** itemId → chosen option index, the raw data self-norming needs. */
    answers: jsonb("answers").$type<Record<string, number>>().notNull(),
    /** itemId → was it answered correctly. Stored server-side (the answer key
     *  never leaves the server) so the admin can compute observed per-item
     *  pass-rates in SQL and re-calibrate difficulty. */
    itemCorrect: jsonb("item_correct").$type<Record<string, boolean>>(),
    timeUsedSec: integer("time_used_sec"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("iq_results_user_created_idx").on(t.userId, t.createdAt),
    index("iq_results_created_idx").on(t.createdAt),
  ],
);

export type IqResultRow = typeof iqResults.$inferSelect;

export type NewIqResultRow = typeof iqResults.$inferInsert;

/** Per-domain EQ scores (0–100), one key per Goleman domain. */
export type EqDomainScoresJson = {
  "self-awareness": number;
  "self-regulation": number;
  motivation: number;
  empathy: number;
  "social-skills": number;
};

export const eqResults = pgTable(
  "eq_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    attemptId: text("attempt_id").notNull().unique(),
    /** 0–100 overall (mean of the five domain scores). */
    overall: integer("overall").notNull(),
    /** Band key: developing | moderate | strong | exceptional. */
    band: text("band").notNull(),
    /** Per-domain 0–100 breakdown. */
    domainScores: jsonb("domain_scores").$type<EqDomainScoresJson>().notNull(),
    /** questionId → chosen 1..5, the raw data self-norming needs. */
    answers: jsonb("answers").$type<Record<string, number>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("eq_results_user_created_idx").on(t.userId, t.createdAt),
    index("eq_results_created_idx").on(t.createdAt),
  ],
);

export type EqResultRow = typeof eqResults.$inferSelect;

export type NewEqResultRow = typeof eqResults.$inferInsert;

/** Per-trait Big Five (OCEAN) scores (0–100). */
export type BigFiveTraitScoresJson = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

/**
 * One row per completed Big Five test. Like the other tests, kept for both
 * signed-in users (history) and anonymous takers (`user_id` null) so the score
 * distribution can be self-normed later. Big Five is a bipolar profile — no
 * overall score, just the five trait scores. `attempt_id` dedupes re-POSTs.
 */
export const bigFiveResults = pgTable(
  "big_five_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    attemptId: text("attempt_id").notNull().unique(),
    /** Per-trait 0–100 scores. */
    traitScores: jsonb("trait_scores")
      .$type<BigFiveTraitScoresJson>()
      .notNull(),
    /** questionId → chosen 1..5, the raw data self-norming needs. */
    answers: jsonb("answers").$type<Record<string, number>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("big_five_results_user_created_idx").on(t.userId, t.createdAt),
    index("big_five_results_created_idx").on(t.createdAt),
  ],
);

export type BigFiveResultRow = typeof bigFiveResults.$inferSelect;

export type NewBigFiveResultRow = typeof bigFiveResults.$inferInsert;

/**
 * One-shot in-app surveys — one row per (user, survey).
 *
 * The row's *existence* is what keeps the popup from coming back, so it is
 * written the moment the modal is shown and then updated in place when the
 * user answers or closes it. That way a user who never interacts still only
 * ever sees the survey once. `surveyKey` scopes it, so the next campaign is a
 * new key rather than a new table.
 */
export const surveyResponses = pgTable(
  "survey_response",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Which survey this answers, e.g. 'app_launch_2026_09'. */
    surveyKey: text("survey_key").notNull(),
    /** 'shown' → seen but not acted on | 'dismissed' → closed | 'submitted'. */
    status: text("status").notNull().default("shown"),
    /** Structured single-choice answer (survey-specific), null if skipped. */
    choice: text("choice"),
    /** Free-text answer, null if skipped. */
    feedback: text("feedback"),
    shownAt: timestamp("shown_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    /** When the user closed or submitted — null while status='shown'. */
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [
    // One row per user per survey — the upsert target, and the guarantee that
    // a double-render can never produce two rows.
    uniqueIndex("survey_response_user_survey_uq").on(t.userId, t.surveyKey),
    index("survey_response_survey_status_idx").on(t.surveyKey, t.status),
  ],
);

export type SurveyResponseRow = typeof surveyResponses.$inferSelect;
