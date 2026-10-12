import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  doublePrecision,
  date,
  time,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { NatalChartJson } from "./profiles";
import { users } from "./users";

/**
 * Partners, people the user has computed synastry against. One row per
 * partner saved, soft-deleted via `deletedAt` (we keep deleted rows so
 * the monthly creation cap stays non-gameable). The partner's natal
 * chart is cached on the row; AI interpretation also caches inline,
 * keyed off (viewerInputHash, partner.inputHash).
 */
export const partners = pgTable(
  "partner",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    /** NULL when birth time unknown, chart still computes against 12:00. */
    timeOfBirth: time("time_of_birth"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    cityName: text("city_name").notNull(),
    timezone: text("timezone").notNull(),
    /** Cached natal chart for this partner. */
    chart: jsonb("chart").$type<NatalChartJson>().notNull(),
    /** Hash of the partner's own birth inputs, busts AI interp cache when
     *  the partner's data changes (currently we don't allow edit, but
     *  reserved). */
    inputHash: text("input_hash").notNull(),
    /** Cached AI synastry interpretation (overall + strengths + growth). */
    aiInterpretation: jsonb(
      "ai_interpretation",
    ).$type<SynastryInterpretationJson | null>(),
    /** Hash of the *viewer's* natal chart at interp time, invalidate when
     *  the user's own chart changes (e.g. they fixed their birth time). */
    aiViewerHash: text("ai_viewer_hash"),
    aiModel: text("ai_model"),
    aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true }),
    /** Cached DEEP AI synastry report (multi-section, on-demand). Same viewer-
     *  hash invalidation as the short interp. */
    deepReport: jsonb("deep_report").$type<SynastryDeepReportJson | null>(),
    deepViewerHash: text("deep_viewer_hash"),
    deepModel: text("deep_model"),
    deepGeneratedAt: timestamp("deep_generated_at", { withTimezone: true }),
    /** Registered partner who accepted the private invite. */
    linkedUserId: text("linked_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** SHA-256 only; the raw invite token exists solely in the shared URL. */
    inviteTokenHash: text("invite_token_hash").unique(),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
    inviteAcceptedAt: timestamp("invite_accepted_at", { withTimezone: true }),
    /** Soft delete. NULL = active, set = hidden from UI but still counts
     *  toward the monthly creation cap. */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("partner_user_created_idx").on(t.userId, t.createdAt),
    index("partner_user_deleted_idx").on(t.userId, t.deletedAt),
    index("partner_linked_user_idx").on(t.linkedUserId, t.deletedAt),
  ],
);

export type RelationshipWeeklyJson = {
  weekStart: string;
  headline: string;
  summary: string;
  theme: "communication" | "closeness" | "emotions" | "boundaries" | "growth";
  harmonyScore: number;
  challengeScore: number;
  days: Array<{
    dateIso: string;
    score: number;
    tier: "great" | "good" | "calm" | "tough";
  }>;
  questions: Array<{ key: string; text: string }>;
  notable: Array<{
    key: string;
    dateIso: string;
    title: string;
    meaning: string;
    family: "harmonic" | "tense" | "neutral";
  }>;
};

/** One deterministic shared update per relationship, week and language. */
export const relationshipWeeklyUpdates = pgTable(
  "relationship_weekly_update",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    weekStart: text("week_start").notNull(),
    language: text("language").notNull().default("ka"),
    ownerChartHash: text("owner_chart_hash").notNull(),
    partnerChartHash: text("partner_chart_hash").notNull(),
    content: jsonb("content").$type<RelationshipWeeklyJson>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("relationship_weekly_partner_week_language_idx").on(
      t.partnerId,
      t.weekStart,
      t.language,
    ),
  ],
);

/** Per-participant opt-ins; accepting an invite never silently enables push. */
export const relationshipSubscriptions = pgTable(
  "relationship_subscription",
  {
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weeklyEnabled: boolean("weekly_enabled").notNull().default(false),
    transitEnabled: boolean("transit_enabled").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.partnerId, t.userId] }),
    index("relationship_subscription_user_idx").on(t.userId),
  ],
);

/** Participant-only shared answers; each participant owns one answer. */
export const relationshipCheckinAnswers = pgTable(
  "relationship_checkin_answer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    weekStart: text("week_start").notNull(),
    questionKey: text("question_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("relationship_answer_partner_week_question_user_idx").on(
      t.partnerId,
      t.weekStart,
      t.questionKey,
      t.userId,
    ),
    index("relationship_answer_partner_week_idx").on(t.partnerId, t.weekStart),
  ],
);

/** Idempotency ledger for weekly and transit notifications. */
export const relationshipNotificationDeliveries = pgTable(
  "relationship_notification_delivery",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deliveryKey: text("delivery_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("relationship_delivery_partner_user_key_idx").on(
      t.partnerId,
      t.userId,
      t.deliveryKey,
    ),
  ],
);

export type SynastryInterpretationJson = {
  /** 2-3 sentence overall portrait of the relationship. */
  summary: string;
  /** What's strong between you, 1-3 short bullets. */
  strengths: string[];
  /** Where the friction lives, 1-3 short bullets. */
  growth: string[];
};

/** Deep, long-form AI synastry report (the "Connect" pillar premium read). */
export type SynastryDeepReportJson = {
  /** Multi-paragraph overall portrait. */
  intro: string;
  /** Love & romance. */
  love: string;
  /** Communication & mental connection. */
  communication: string;
  /** Friendship, trust & emotional safety. */
  trust: string;
  /** Friction & growth, where it's hard and what it teaches. */
  friction: string;
  /** Long-term potential. */
  longTerm: string;
  /** 3-5 concrete pieces of advice. */
  advice: string[];
};

export type Partner = typeof partners.$inferSelect;

export type NewPartner = typeof partners.$inferInsert;
