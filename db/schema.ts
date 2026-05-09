import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  doublePrecision,
  date,
  time,
  jsonb,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Auth.js v5 standard tables.
 * Schema mirrors @auth/drizzle-adapter's expected shape so the adapter
 * can read/write users, accounts, sessions, and verification tokens.
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  /**
   * bcrypt hash of the user's password — only set when they registered with
   * email/password. NULL for OAuth-only accounts (Google), which gate login
   * via the OAuth provider instead of a stored hash.
   */
  passwordHash: text("password_hash"),
  // ── Email preferences ──────────────────────────────────────────────
  // Default ON: users registered specifically for an astrology service,
  // so daily horoscope + nudges are expected. Marketing also defaults ON
  // because we use admin-side audience filtering and provide a one-click
  // unsubscribe link in every send.
  emailDailyHoroscope: boolean("email_daily_horoscope")
    .notNull()
    .default(true),
  emailMarketing: boolean("email_marketing").notNull().default(true),
  emailNudges: boolean("email_nudges").notNull().default(true),
  /** Random opaque token used in unsubscribe links. Lazily populated on
   *  first send — see lib/unsubscribe.ts. Unique so a token resolves to
   *  at most one user. */
  unsubscribeToken: text("unsubscribe_token").unique(),
  /** Updated by Auth.js events.signIn whenever the user logs in. NULL
   *  for users who registered but never came back. */
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

/**
 * Single-use tokens for email-verification and password-reset flows.
 * Distinct from Auth.js's `verificationToken` (used by OAuth/magic-link
 * adapters) so we don't risk collisions or accidental cross-purpose reuse.
 */
export const authTokenPurposeEnum = pgEnum("auth_token_purpose", [
  "email_verify",
  "password_reset",
]);

export const authTokens = pgTable(
  "auth_token",
  {
    /** Random opaque hex string. Sent in the email link and looked up here. */
    token: text("token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: authTokenPurposeEnum("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("auth_token_user_purpose_idx").on(t.userId, t.purpose),
  ]
);

/**
 * Vivida-specific: birth profile, 1:1 with users.
 * Time stored separately so we can render exact birth time independent of TZ.
 */
export const profiles = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  timeOfBirth: time("time_of_birth"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  cityName: text("city_name"),
  timezone: text("timezone"),
  // ── Public profile fields ────────────────────────────────────────────
  /** Lowercase, slug-friendly handle used in profile URLs. Unique. */
  username: text("username").unique(),
  /** Public display name (defaults to user.name if not set). */
  displayName: text("display_name"),
  /** Short user-written bio (~280 char). */
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Cached natal chart per user. Recomputed only when birth data changes
 * (versioned via `inputHash`). Interpretations are stored separately so we
 * can regenerate AI text without re-running ephemeris calculations.
 */
export const charts = pgTable("chart", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  inputHash: text("input_hash").notNull(),
  source: text("source").notNull(),                  // 'api' | 'local'
  data: jsonb("data").$type<NatalChartJson>().notNull(),
  interpretation: jsonb("interpretation").$type<ChartInterpretationJson | null>(),
  interpretationModel: text("interpretation_model"), // e.g. 'anthropic/claude-sonnet-4-6' or 'static'
  language: text("language").notNull().default("ka"),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  interpretedAt: timestamp("interpreted_at", { withTimezone: true }),
});

/**
 * Subscription state, 1:1 with users. Free users either have no row or
 * a row with plan='free'. Pro users have plan='pro' + an active period.
 */
export const planEnum = pgEnum("plan", ["free", "pro"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "inactive",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
]);
export const billingIntervalEnum = pgEnum("billing_interval", [
  "month",
  "year",
]);

export const subscriptions = pgTable("subscription", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("inactive"),
  interval: billingIntervalEnum("interval"),
  priceCents: integer("price_cents"),
  currency: text("currency").default("GEL"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  // Flitt references — we keep these denormalized so we can sync state
  flittOrderId: text("flitt_order_id"),
  flittSubscriptionId: text("flitt_subscription_id"),
  flittCustomerId: text("flitt_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Audit log of every payment we observe (success, fail, pending). Used for
 * receipts, support, and reconciliation against Flitt's reporting.
 */
export const payments = pgTable("payment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  flittOrderId: text("flitt_order_id").notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  /** 'month' | 'year' — persisted at checkout so the webhook doesn't have to
   *  guess from amount. Nullable for legacy rows that pre-date this column. */
  interval: billingIntervalEnum("interval"),
  status: text("status").notNull(), // 'approved' | 'declined' | 'pending' | …
  description: text("description"),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Direct messages between two users. We don't model "conversations"
 * explicitly — a conversation is implicit (any pair of users sharing
 * messages). `readAt` is set on the row when the recipient opens the
 * conversation containing it.
 */
export const messages = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("message_sender_recipient_idx").on(
      t.senderId,
      t.recipientId,
      t.createdAt
    ),
    index("message_recipient_read_idx").on(t.recipientId, t.readAt),
  ]
);

/**
 * Ephemeral typing state. One row per (sender → recipient) pair. The sender
 * upserts a row with `expiresAt = now() + 5s` on each keystroke (debounced);
 * the recipient's SSE poll reads any rows still in the future. Stale rows
 * are ignored at read-time and overwritten on the next keystroke.
 */
export const typingIndicators = pgTable(
  "typing_indicator",
  {
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.senderId, t.recipientId] }),
    index("typing_recipient_expires_idx").on(t.recipientId, t.expiresAt),
  ]
);

/**
 * Notification types we currently emit. Keep the enum lean — adding a new
 * kind is cheap (jsonb payload), but enum values are forever.
 */
export const notificationKindEnum = pgEnum("notification_kind", [
  "friend_request",
  "friend_accepted",
]);

/**
 * Notification feed for the bell-icon dropdown. One row per event delivered
 * to a user. `payload` carries kind-specific details (the actor's userId,
 * username, display name, image, etc.) so we don't need a join to render.
 */
export type NotificationPayload = {
  fromUserId?: string;
  fromUsername?: string | null;
  fromName?: string | null;
  fromImage?: string | null;
};

export const notifications = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  payload: jsonb("payload").$type<NotificationPayload>().notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Profile photos — Tinder-style carousel for public profiles. Stored in
 * Cloudflare R2 under `users/{userId}/{photoId}.{ext}`. `url` is the
 * cached public URL (precomputed so reads don't need extra resolution).
 * `ready=false` rows exist briefly between the presigned-URL handout and
 * the client confirming a successful upload.
 */
export const profilePhotos = pgTable("profile_photo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** R2 object key — used for delete + presigned URL generation. */
  key: text("key").notNull().unique(),
  /** Public URL — cached for fast reads on profile views. */
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  /** false until the client confirms the file was successfully uploaded. */
  ready: boolean("ready").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Directed friendship requests. status: 'pending' | 'accepted' | 'blocked'.
 * Composite PK on (requester, recipient) prevents dupes; the reverse pair
 * is stored separately so we can query "who requested me" cheaply.
 */
export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "blocked",
]);

export const friendships = pgTable(
  "friendship",
  {
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.requesterId, t.recipientId] })]
);

/**
 * One generated horoscope per (user, local date). Cached so the user sees
 * the same reading all day; regenerated automatically the next day.
 */
export const dailyHoroscopes = pgTable(
  "daily_horoscope",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Local date in YYYY-MM-DD computed in the user's timezone. */
    date: date("date", { mode: "string" }).notNull(),
    headline: text("headline").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    themes: jsonb("themes").$type<string[]>().notNull().default([]),
    transits: jsonb("transits").$type<DailyTransitsJson>(),
    model: text("model").notNull(),       // e.g. 'google/gemini-2.5-pro'
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })]
);

/** Transit + cache metadata stored alongside the daily reading. */
export type DailyTransitsJson = {
  topAspects: Array<{
    transit: string;     // body key (e.g. "moon")
    natal: string;       // body key
    kind: string;        // aspect kind
    orb: number;
    intensity: number;
  }>;
  /** Bumped whenever the daily prompt structure changes; see lib/openrouter.ts. */
  promptVersion?: number;
  /** Cache invalidates when the user's natal chart changes. */
  natalInputHash?: string;
  /** Today's transiting moon — kept for quick UI access. */
  moonHouse?: number | null;
  moonSignEn?: string;
};

/**
 * Per-user, per-day delivery log for the daily-horoscope email blast.
 * The cron at 05:00 / 05:30 UTC enqueues one row per eligible user with
 * status='pending', then drains them by calling Resend. Re-runs of the
 * cron pick up rows whose status is still 'pending' or 'failed', so a
 * crashed/timed-out send is recoverable. Resend's Idempotency-Key uses
 * (userId, sendDate) so even an at-least-once retry never double-sends.
 *
 * Status meaning:
 *   - pending : freshly enqueued, never attempted
 *   - sent    : Resend accepted the request
 *   - failed  : Resend or pre-flight threw — eligible for retry
 *   - skipped : dispatch returned false (free plan, no chart, etc.) — terminal
 */
export const dailyEmailLog = pgTable(
  "daily_email_log",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Send date in UTC (YYYY-MM-DD). PK with userId. */
    sendDate: date("send_date", { mode: "string" }).notNull(),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.sendDate] }),
    index("daily_email_log_send_date_status_idx").on(t.sendDate, t.status),
  ]
);

/**
 * Append-only log of every transactional email we send. Two purposes:
 *   1. Idempotency for one-shot emails (e.g. welcome) — we check for an
 *      existing row before sending.
 *   2. Per-kind throttling for notification emails (friend-request,
 *      message) — we suppress a second send within a sliding 1h window
 *      so a chatty conversation doesn't spam the inbox.
 *
 * Resend's Idempotency-Key is the second line of defence; this table is
 * the application-level guard.
 */
export const emailSendLog = pgTable(
  "email_send_log",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 'welcome' | 'friend_request' | 'message' (and future kinds). */
    kind: text("kind").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("email_send_log_user_kind_sent_idx").on(
      t.userId,
      t.kind,
      t.sentAt
    ),
  ]
);

/**
 * Globally-cached moon phase + Gemini interpretation, one row per UTC date.
 * Universal (not per-user) — the moon's phase + sign is the same for everyone
 * on a given day, so a single row is served to all users.
 *
 * Cache invalidates by bumping `promptVersion` after a prompt change.
 */
export const moonPhases = pgTable("moon_phase", {
  /** UTC date (YYYY-MM-DD). Single PK, no userId. */
  date: date("date", { mode: "string" }).primaryKey(),
  /** "new_moon", "waxing_crescent", ... 8 canonical phases. */
  phaseKey: text("phase_key").notNull(),
  phaseLabelKa: text("phase_label_ka").notNull(),
  /** Sign the moon currently transits. */
  signEn: text("sign_en").notNull(),
  signKa: text("sign_ka").notNull(),
  signIndex: integer("sign_index").notNull(),
  /** Sun-Moon angular separation in degrees, 0..360. */
  phaseAngle: doublePrecision("phase_angle").notNull(),
  /** 0..1, fraction of disk illuminated. */
  illumination: doublePrecision("illumination").notNull(),
  /** 0..29.53, days since previous new moon. */
  ageDays: doublePrecision("age_days").notNull(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  themes: jsonb("themes").$type<string[]>().notNull().default([]),
  promptVersion: integer("prompt_version").notNull().default(1),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

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
  dateIso: string;             // YYYY-MM-DD (user's local TZ)
  weekdayKa: string;           // ე.ხ. "ორშაბათი"
  /** 0-100 — intensity-weighted sum of harmonic transit-to-natal aspects. */
  harmonyScore: number;
  /** 0-100 — intensity-weighted sum of tense transit-to-natal aspects. */
  challengeScore: number;
  moonSignKa: string;
  moonSignEn: string;
  headline: string;            // 5-8 words, AI
  harmonicReason: string;      // why it's supportive
  challengingReason: string;   // why it's friction
  advice: string;              // 1 short practical tip
  /** Top 3 driving aspects (for the "drivers" list under each day). */
  drivers: Array<{
    transit: string;
    natal: string;
    kind: string;
    family: "harmonic" | "tense" | "neutral";
    orb: number;
  }>;
};

/**
 * Partners — people the user has computed synastry against. One row per
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
    /** NULL when birth time unknown — chart still computes against 12:00. */
    timeOfBirth: time("time_of_birth"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    cityName: text("city_name").notNull(),
    timezone: text("timezone").notNull(),
    /** Cached natal chart for this partner. */
    chart: jsonb("chart").$type<NatalChartJson>().notNull(),
    /** Hash of the partner's own birth inputs — busts AI interp cache when
     *  the partner's data changes (currently we don't allow edit, but
     *  reserved). */
    inputHash: text("input_hash").notNull(),
    /** Cached AI synastry interpretation (overall + strengths + growth). */
    aiInterpretation: jsonb("ai_interpretation").$type<SynastryInterpretationJson | null>(),
    /** Hash of the *viewer's* natal chart at interp time — invalidate when
     *  the user's own chart changes (e.g. they fixed their birth time). */
    aiViewerHash: text("ai_viewer_hash"),
    aiModel: text("ai_model"),
    aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true }),
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
  ]
);

export type SynastryInterpretationJson = {
  /** 2-3 sentence overall portrait of the relationship. */
  summary: string;
  /** What's strong between you, 1-3 short bullets. */
  strengths: string[];
  /** Where the friction lives, 1-3 short bullets. */
  growth: string[];
};

/**
 * Per-user-day visit log. One row per (userId, dateLocal) — the date is
 * stored as the user's local YYYY-MM-DD so an admin reading the
 * heatmap sees the same days the user lived. Deliberately schema-light
 * for the easy version: no per-page time, no session count. Bump later
 * if we need more granular analytics.
 */
export const userActivityDays = pgTable(
  "user_activity_day",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** YYYY-MM-DD in the user's profile timezone (or UTC fallback). */
    dateLocal: text("date_local").notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.dateLocal] }),
  ]
);

export type UserActivityDay = typeof userActivityDays.$inferSelect;

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  chart: one(charts, {
    fields: [users.id],
    references: [charts.userId],
  }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  payments: many(payments),
  dailyHoroscopes: many(dailyHoroscopes),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const chartsRelations = relations(charts, ({ one }) => ({
  user: one(users, {
    fields: [charts.userId],
    references: [users.id],
  }),
}));

/**
 * Shape of the natal chart JSON we persist. Stable across `source`
 * (whether computed locally or fetched from freeastrologyapi.com).
 */
export type NatalChartJson = {
  ascendant: PointJson;
  midheaven: PointJson;
  bodies: Record<string, PointJson>;       // sun, moon, mercury, venus, ...
  houses: HouseJson[];                     // 12 cusps
  aspects?: NatalAspectJson[];             // major chart-internal aspects
};

export type NatalAspectJson = {
  /** Body keys; alphabetically sorted for stable IDs. */
  a: string;
  b: string;
  kind: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  family: "harmonic" | "tense" | "neutral";
  orb: number;
  intensity: number;
};

export type PointJson = {
  longitude: number;        // 0-360 ecliptic
  signIndex: number;        // 0-11 (Aries = 0)
  signDegree: number;       // 0-30 within sign
  house?: number | null;    // 1-12
  retrograde?: boolean;
};

export type HouseJson = {
  number: number;           // 1-12
  cuspLongitude: number;    // 0-360
  signIndex: number;
};

export type ChartInterpretationJson = {
  bigThree?: {
    sun?: string;
    moon?: string;
    ascendant?: string;
  };
  summary?: string;
  highlights?: Array<{ title: string; body: string }>;
  /** Per-planet narrative interpretation (Mercury–Pluto). Keys: planet keys. */
  planets?: Record<string, string>;
  /** Per-house narrative interpretation. Keys: "1".."12". */
  houses?: Record<string, string>;
  /** Per-aspect interpretation. Keys: "<a>-<b>-<kind>" (a < b alphabetically). */
  aspects?: Record<string, string>;
};

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Chart = typeof charts.$inferSelect;
export type NewChart = typeof charts.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type DailyHoroscope = typeof dailyHoroscopes.$inferSelect;
export type NewDailyHoroscope = typeof dailyHoroscopes.$inferInsert;
export type MoonPhase = typeof moonPhases.$inferSelect;
export type NewMoonPhase = typeof moonPhases.$inferInsert;
export type WeeklyForecast = typeof weeklyForecasts.$inferSelect;
export type NewWeeklyForecast = typeof weeklyForecasts.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type ProfilePhoto = typeof profilePhotos.$inferSelect;
export type NewProfilePhoto = typeof profilePhotos.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationKind = (typeof notificationKindEnum.enumValues)[number];
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
export type AuthTokenPurpose = (typeof authTokenPurposeEnum.enumValues)[number];
export type TypingIndicator = typeof typingIndicators.$inferSelect;
export type NewTypingIndicator = typeof typingIndicators.$inferInsert;
export type Plan = (typeof planEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
export type BillingInterval = (typeof billingIntervalEnum.enumValues)[number];
