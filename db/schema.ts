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
  uniqueIndex,
  pgEnum,
  type AnyPgColumn,
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
  /** Preferred voice slug for audio horoscopes (see lib/elevenlabs HOROSCOPE_VOICES).
   *  NULL → the default voice. Set on first listen / in account settings. */
  horoscopeVoice: text("horoscope_voice"),
  /** Random opaque token used in unsubscribe links. Lazily populated on
   *  first send — see lib/unsubscribe.ts. Unique so a token resolves to
   *  at most one user. */
  unsubscribeToken: text("unsubscribe_token").unique(),
  /** Updated by Auth.js events.signIn whenever the user logs in. NULL
   *  for users who registered but never came back. */
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  /**
   * Manual restriction override for trust & safety. The *effective*
   * restriction (see lib/restriction.ts) is `restricted OR under-min-age`,
   * so under-age accounts are restricted by their birth date automatically
   * and auto-lift at adulthood — this flag is for non-age cases (e.g. a bad
   * actor) and is NOT set for the underage accounts (that would defeat the
   * auto-reverse).
   */
  restricted: boolean("restricted").notNull().default(false),
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
 * Refresh tokens for the mobile (Flutter) API.
 *
 * The website uses Auth.js cookie sessions; native apps can't, so the
 * mobile flow issues a short-lived JWT access token plus a long-lived
 * refresh token. We never store the raw refresh token — only its SHA-256
 * hash — so a DB leak can't be replayed. Rotation: each /auth/refresh
 * call revokes the presented token and issues a new one. Logout (and
 * "log out everywhere") revokes by setting revokedAt.
 */
export const mobileRefreshTokens = pgTable(
  "mobile_refresh_token",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 hex of the opaque refresh token. Never the raw value. */
    tokenHash: text("token_hash").notNull().unique(),
    /** Best-effort device label from the User-Agent, for the sessions list. */
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Set when the token is rotated out or explicitly logged out. */
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("mobile_refresh_token_user_idx").on(t.userId)]
);

/**
 * Fixed-window rate-limit counters, used to cap abuse on the mobile API's
 * unauthenticated endpoints (login, register, password reset). One row per
 * (bucket, identifier, window). The identifier is a SHA-256 hash — never a
 * raw IP or email — so this table holds no PII. Old windows are dead weight
 * and pruned by the daily cron (see lib/rate-limit.pruneRateLimits).
 */
export const rateLimitHits = pgTable(
  "rate_limit_hit",
  {
    /** Logical limiter, e.g. "login_ip" or "register_email". */
    bucket: text("bucket").notNull(),
    /** SHA-256 hex of the IP/email this counter tracks. */
    identifier: text("identifier").notNull(),
    /** Start of the fixed window this counter belongs to. */
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    primaryKey({
      columns: [t.bucket, t.identifier, t.windowStart],
    }),
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
 * One-time, paid, downloadable PDF reports (natal / synastry / forecast).
 * Lifecycle: pending → paid → generating → ready (or failed). Pro users
 * skip payment and land directly on 'paid'. The PDF lives privately in R2;
 * `pdfKey` is the object key and we serve it via short-lived signed URLs.
 */
export const pdfReportStatusEnum = pgEnum("pdf_report_status", [
  "pending", // checkout started, awaiting Stripe payment
  "paid", // payment confirmed (or Pro-comped) — generation queued
  "generating", // worker is producing the PDF
  "ready", // PDF stored in R2, downloadable
  "failed", // generation errored — retryable
]);

export const pdfReports = pgTable(
  "pdf_report",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 'natal' | 'synastry' | 'forecast' — natal is the only one shipped today. */
    type: text("type").notNull().default("natal"),
    status: pdfReportStatusEnum("status").notNull().default("pending"),
    /** chart input hash captured at purchase, so we can flag a stale report
     *  if the user later changes their birth data. */
    inputHash: text("input_hash"),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("GEL"),
    /** true when comped to a Pro subscriber (no Stripe charge). */
    comped: boolean("comped").notNull().default(false),
    stripeSessionId: text("stripe_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    /** R2 object key once generated. */
    pdfKey: text("pdf_key"),
    /** last generation error, for support/retry. */
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    readyAt: timestamp("ready_at", { withTimezone: true }),
  },
  (t) => [
    index("pdf_report_user_created_idx").on(t.userId, t.createdAt),
    index("pdf_report_status_idx").on(t.status),
  ]
);

export type PdfReport = typeof pdfReports.$inferSelect;
export type NewPdfReport = typeof pdfReports.$inferInsert;
export type PdfReportStatus = (typeof pdfReportStatusEnum.enumValues)[number];

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
  "post_comment",
  "post_reaction",
  "mention",
  // Mutual like in the match deck — emitted to both users at once.
  "new_match",
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
  /** Set on `post_comment` / `post_reaction` so the bell-icon row can
   *  deep-link to /feed#post-<id>. */
  postId?: string;
  /** Optional preview of the comment body for the dropdown. */
  preview?: string;
  /** Reaction kind for `post_reaction` notifications — drives the icon. */
  reaction?: "like" | "dislike" | "funny" | "sad";
  /** "post" | "comment" — only set on `mention` kind so the row can show
   *  "მოგიხსენიეს კომენტარში" vs. "მოგიხსენიეს პოსტში". */
  mentionContext?: "post" | "comment";
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
 * Romantic-intent swipes, the foundation of the match deck. Distinct from
 * `friendships`: a like is one-directional and silent until reciprocated.
 * One row per (liker → target); `kind` records the swipe direction so a
 * pass excludes the target from the deck without ever notifying them, and a
 * later like can overwrite a pass (upsert on the PK).
 */
export const likeKindEnum = pgEnum("like_kind", ["like", "pass"]);

export const likes = pgTable(
  "like",
  {
    likerId: text("liker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: likeKindEnum("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.likerId, t.targetId] }),
    // "Who liked me" + reciprocal-like lookup on a fresh like.
    index("like_target_kind_idx").on(t.targetId, t.kind),
  ]
);

/**
 * A mutual like. Created when a like is reciprocated; either user can
 * unmatch (soft delete via `unmatchedAt` so the pair isn't re-surfaced in
 * the deck and the like rows stay as a record). The pair is stored sorted
 * (userAId < userBId) so a match is unique regardless of who liked first.
 */
export const matches = pgTable(
  "match",
  {
    userAId: text("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    /** NULL = active match; set when either side unmatches. */
    unmatchedAt: timestamp("unmatched_at", { withTimezone: true }),
    /** Who pressed unmatch (for analytics / re-match rules later). */
    unmatchedBy: text("unmatched_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    primaryKey({ columns: [t.userAId, t.userBId] }),
    // List a user's matches: matches where they're either side, active first.
    index("match_user_a_idx").on(t.userAId, t.unmatchedAt),
    index("match_user_b_idx").on(t.userBId, t.unmatchedAt),
  ]
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
 * Per-sun-sign horoscope readings for SEO landing pages. Unlike
 * dailyHoroscopes (per user, requires natal chart), these are universal
 * for everyone with that sun sign — generated once per (sign, period,
 * periodKey) and served to anonymous visitors at /zodiac/[sign]/dghes,
 * /kviris-horoskopi, /tvis-horoskopi.
 *
 * `period` is one of "day" | "week" | "month".
 * `periodKey` shape per period:
 *   - day   → "YYYY-MM-DD"            (today in Asia/Tbilisi)
 *   - week  → "YYYY-Www"              (ISO week, Monday-anchored)
 *   - month → "YYYY-MM"
 *
 * Composite PK on (sign, period, periodKey) makes upsert idempotent;
 * `promptVersion` lets us invalidate after a prompt-quality change.
 */
export const signHoroscopes = pgTable(
  "sign_horoscope",
  {
    /** zodiac slug — see ALL_SLUGS in lib/seo/zodiac-dates */
    sign: text("sign").notNull(),
    /** "day" | "week" | "month" */
    period: text("period").notNull(),
    /** date / ISO-week / YYYY-MM, see comment above */
    periodKey: text("period_key").notNull(),
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
  },
  (t) => [primaryKey({ columns: [t.sign, t.period, t.periodKey] })]
);

/**
 * Evergreen "ranking" listicles ("ყველაზე ჭკვიანი / ეჭვიანი … ნიშნები").
 * One row per topic — all 12 signs ranked by a trait. Generated on-demand
 * by the SEO page and cached; `promptVersion` invalidates after a prompt
 * change. `items` is the ordered ranking.
 */
export type SignRankingItem = {
  /** zodiac slug — see ALL_SLUGS */
  slug: string;
  /** 1 = most, 12 = least */
  rank: number;
  blurb: string;
};

export const signRankings = pgTable("sign_ranking", {
  /** topic slug — see RANKING_TOPICS in lib/seo/rankings */
  topic: text("topic").primaryKey(),
  headline: text("headline").notNull(),
  intro: text("intro").notNull(),
  items: jsonb("items").$type<SignRankingItem[]>().notNull(),
  faq: jsonb("faq").$type<{ q: string; a: string }[]>().notNull().default([]),
  promptVersion: integer("prompt_version").notNull().default(1),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type SignRanking = typeof signRankings.$inferSelect;

/**
 * Chinese-zodiac page content (ჩინური ჰოროსკოპი). One row per animal slug
 * (plus a reserved "_hub" row for the hub intro/FAQ). Creative Georgian prose
 * is generated by Gemini on demand and cached here; `promptVersion` invalidates
 * after a prompt change. Factual data (names, years, elements) lives in
 * lib/seo/chinese-zodiac, not here.
 */
export type ChineseCompatItem = {
  /** animal slug — see ALL_CHINESE_SLUGS */
  slug: string;
  /** "ძლიერი" | "ჰარმონიული" | "გამომწვევი" */
  level: string;
  note: string;
};

export const chineseZodiac = pgTable("chinese_zodiac", {
  /** animal slug, or "_hub" for the hub page */
  animal: text("animal").primaryKey(),
  pageTitle: text("page_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  headline: text("headline").notNull().default(""),
  intro: text("intro").notNull(),
  personality: text("personality").notNull().default(""),
  strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
  weaknesses: jsonb("weaknesses").$type<string[]>().notNull().default([]),
  love: text("love").notNull().default(""),
  career: text("career").notNull().default(""),
  compatibility: jsonb("compatibility")
    .$type<ChineseCompatItem[]>()
    .notNull()
    .default([]),
  faq: jsonb("faq").$type<{ q: string; a: string }[]>().notNull().default([]),
  promptVersion: integer("prompt_version").notNull().default(1),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ChineseZodiac = typeof chineseZodiac.$inferSelect;

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

/**
 * Community feed — short text posts visible to every signed-in user.
 * Hard delete on user removal (cascade) and on post author/admin
 * action; comments and reactions cascade with the parent post.
 *
 * No image uploads, no link parsing — body is plain text only by
 * product spec. Length cap enforced in `createPost`.
 */
export const posts = pgTable(
  "post",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    /** True once the author has edited the post at least once. The 5-minute
     *  edit window is enforced in the action; this flag exists so the UI
     *  can append "(რედაქტირებული)" without a separate timestamp column. */
    edited: boolean("edited").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Feed reads are always "newest first"; the explicit index lets
    // Postgres do an index-only descending scan rather than sorting in
    // memory once the table grows past a few thousand rows.
    index("post_created_at_idx").on(t.createdAt),
    index("post_user_idx").on(t.userId),
  ]
);

/**
 * Comments on a community post. Text only (same product spec). Cascades
 * with the parent post: when a post is deleted, all comments go too.
 */
export const postComments = pgTable(
  "post_comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Self-FK for one-level reply threading. Null = top-level comment;
     *  non-null = reply to that comment. Replies of replies are
     *  rejected at the action layer (keeps UI nesting bounded). Cascade
     *  on delete so removing a parent cleans up its reply subtree. */
    parentId: text("parent_id").references((): AnyPgColumn => postComments.id, {
      onDelete: "cascade",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Loading comments for a single post — always sorted oldest first.
    index("post_comment_post_idx").on(t.postId, t.createdAt),
    // Fetching all replies under one parent (used when expanding a
    // long thread or counting reply depth in the future).
    index("post_comment_parent_idx").on(t.parentId),
  ]
);

/**
 * Reaction taxonomy. Kept short on purpose — adding a kind means
 * designing a new icon and updating every render site. Enum values are
 * forever; "haha"/"wow" can be aliased to existing kinds at the UI
 * level if the product splits later.
 */
export const postReactionKindEnum = pgEnum("post_reaction_kind", [
  "like",
  "dislike",
  "funny",
  "sad",
]);

/**
 * Per-user reaction to a post. Composite PK (post, user) enforces
 * "one reaction per user per post" at the DB level — switching from
 * `like` to `sad` is a single `INSERT … ON CONFLICT DO UPDATE`, no
 * race window where a user can stack reactions.
 */
export const postReactions = pgTable(
  "post_reaction",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: postReactionKindEnum("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.userId] }),
    // Per-post aggregate count: GROUP BY post_id, kind → uses this idx.
    index("post_reaction_post_kind_idx").on(t.postId, t.kind),
  ]
);

/**
 * Reputation — gamification layer. `user_reputation` is the running
 * total, `reputation_event` is the audit log + dedup source. We never
 * compute the total by SUM'ing events; that would punish frequently-
 * visited profiles. The trigger-style "increment on insert" lives in
 * application code (`awardReputation`), kept in sync via the unique
 * dedupe index.
 *
 * Event kinds:
 *  - post_created        — you posted (cap 9/day)
 *  - comment_created     — you commented (cap 5/day)
 *  - reaction_received   — someone reacted to your post (cap 30/day)
 *  - comment_received    — someone commented on your post (cap 30/day)
 *  - friend_added        — you accepted a friend request (cap 20/day)
 *  - daily_visit         — you visited the site today (cap 1/day)
 *  - profile_completed   — one-shot, on first profile save
 *  - first_post          — one-shot, on the first post you ever publish
 *  - joined              — one-shot, on signup
 */
export const reputationEventKindEnum = pgEnum("reputation_event_kind", [
  "post_created",
  "comment_created",
  "reaction_received",
  "comment_received",
  "friend_added",
  "daily_visit",
  "profile_completed",
  "first_post",
  "joined",
]);

export const userReputation = pgTable("user_reputation", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  total: integer("total").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reputationEvents = pgTable(
  "reputation_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: reputationEventKindEnum("kind").notNull(),
    /** Stable identifier for the source of the event so the same one
     *  can't credit twice. Examples by kind:
     *   - post_created       → postId
     *   - comment_created    → commentId
     *   - reaction_received  → `${postId}:${reactorUserId}`
     *   - comment_received   → commentId
     *   - friend_added       → sorted pair `min(a,b):max(a,b)`
     *   - daily_visit        → `${userId}:YYYY-MM-DD`
     *   - profile_completed  → `${userId}`
     *   - first_post         → `${userId}`
     *   - joined             → `${userId}`
     *
     * Always populated — the unique index relies on a non-null value to
     * enforce dedup. */
    subjectId: text("subject_id").notNull(),
    points: integer("points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Daily-cap query: SUM(points) WHERE user_id, kind, created_at > today.
    index("rep_event_user_kind_created_idx").on(
      t.userId,
      t.kind,
      t.createdAt
    ),
    // Dedup: same (kind, subjectId) can never insert twice.
    uniqueIndex("rep_event_dedupe_idx").on(t.kind, t.subjectId),
  ]
);

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
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type LikeKind = (typeof likeKindEnum.enumValues)[number];
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
export type MobileRefreshToken = typeof mobileRefreshTokens.$inferSelect;
export type NewMobileRefreshToken = typeof mobileRefreshTokens.$inferInsert;
export type RateLimitHit = typeof rateLimitHits.$inferSelect;
export type NewRateLimitHit = typeof rateLimitHits.$inferInsert;
export type AuthTokenPurpose = (typeof authTokenPurposeEnum.enumValues)[number];
export type TypingIndicator = typeof typingIndicators.$inferSelect;
export type NewTypingIndicator = typeof typingIndicators.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostComment = typeof postComments.$inferSelect;
export type NewPostComment = typeof postComments.$inferInsert;
export type PostReaction = typeof postReactions.$inferSelect;
export type NewPostReaction = typeof postReactions.$inferInsert;
export type PostReactionKind = (typeof postReactionKindEnum.enumValues)[number];
export type UserReputation = typeof userReputation.$inferSelect;
export type ReputationEvent = typeof reputationEvents.$inferSelect;
export type NewReputationEvent = typeof reputationEvents.$inferInsert;
export type SignHoroscope = typeof signHoroscopes.$inferSelect;
export type NewSignHoroscope = typeof signHoroscopes.$inferInsert;
export type SignHoroscopePeriod = "day" | "week" | "month";
export type ReputationEventKind =
  (typeof reputationEventKindEnum.enumValues)[number];
export type Plan = (typeof planEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
export type BillingInterval = (typeof billingIntervalEnum.enumValues)[number];

// ─── Trust & safety ─────────────────────────────────────────────────────

/**
 * Directional user blocks. A row (blocker → blocked) means `blockerId` has
 * blocked `blockedId`. Enforced *both ways* at read time (neither party can
 * message, friend, or see the other in feed/profile). Kept independent of
 * `friendships` so a block works with no prior relationship and survives
 * unfriending.
 */
export const blocks = pgTable(
  "block",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.blockerId, t.blockedId] }),
    // Reverse lookup: "who has blocked me".
    index("block_blocked_idx").on(t.blockedId),
  ]
);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "user",
  "post",
  "comment",
  "message_thread",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewed",
  "actioned",
  "dismissed",
]);

/**
 * User-submitted abuse reports. Deliberately schema-light — capture enough
 * to review by hand (who reported what, plus an optional free-text reason)
 * without a dedicated admin UI yet. `targetId` is the reported user / post /
 * comment id, or the other participant's user id for a message_thread report.
 */
export const reports = pgTable(
  "report",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason"),
    status: reportStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("report_status_created_idx").on(t.status, t.createdAt),
    index("report_reporter_target_idx").on(
      t.reporterId,
      t.targetType,
      t.targetId
    ),
  ]
);

export type Block = typeof blocks.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportTargetType = (typeof reportTargetTypeEnum.enumValues)[number];
