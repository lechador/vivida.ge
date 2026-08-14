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
  /** Preferred interface language for authenticated pages. Public SEO routes
   * keep their explicit URL language; this setting controls the signed-in UI. */
  interfaceLanguage: text("interface_language").notNull().default("ka"),
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
  /** This user's own referral code (short, unique) — lazily generated the
   *  first time they open the invite screen. Others sign up via /?ref=code. */
  referralCode: text("referral_code").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Credit wallet — one row per user, atomically updated. Balance is authoritative
 * and always kept in sync with the ledger (credit_transaction). We spend with a
 * single conditional UPDATE (`balance >= cost`) so two concurrent requests can
 * never overspend.
 */
export const creditAccounts = pgTable("credit_account", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Append-only credit ledger — every grant (+) and spend (−) with a reason, for
 * audit + the account history. `ref` links to the source (referral's invited
 * user id, stripe session id, the synastry/partner id spent on, …).
 */
export const creditTransactions = pgTable(
  "credit_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Signed: positive = earned/bought, negative = spent. */
    amount: integer("amount").notNull(),
    /** e.g. 'signup_bonus' | 'referral' | 'purchase' | 'spend_synastry' |
     *  'spend_chat' | 'grandfather' | 'admin_grant'. */
    reason: text("reason").notNull(),
    ref: text("ref"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("credit_tx_user_created_idx").on(t.userId, t.createdAt),
    index("credit_tx_user_reason_ref_idx").on(t.userId, t.reason, t.ref),
  ]
);

/**
 * Referrals — one row per invited user (unique), so a person can be referred by
 * at most one referrer. `status` goes pending → qualified when the invited user
 * verifies email AND completes birth data (the anti-fraud gate: a dead/duplicate
 * signup never qualifies, and only a qualified referral pays out, once).
 */
export const referrals = pgTable(
  "referral",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    referrerId: text("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Unique: the invited user can only ever be attributed to one referrer. */
    invitedUserId: text("invited_user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // 'pending' | 'qualified'
    creditedAt: timestamp("credited_at", { withTimezone: true }),
    qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("referral_referrer_idx").on(t.referrerId)]
);

export type CreditAccount = typeof creditAccounts.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type Referral = typeof referrals.$inferSelect;

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
    /** Short numeric OTP (email_verify only) shown in the email alongside the
     *  link, so users can type a code instead of clicking. Same row as the
     *  link token, so verifying by either path invalidates both. Null for
     *  password_reset (link-only). */
    code: text("code"),
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
  /** Self-reported or AI-inferred sex — 'male' | 'female' (null = unknown /
   *  chose to skip). Used only for aggregate audience analytics, never shown
   *  publicly. */
  gender: text("gender"),
  /** How `gender` was set: 'self' (user picked it) or 'ai' (name-inferred
   *  backfill). Self-reported always wins; the backfill only touches null/ai. */
  genderSource: text("gender_source"),
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
  /**
   * Whether this user appears on stranger-discovery surfaces: the /people
   * directory, people search, and "suggested people" rails. Default true
   * (opt-out, toggle in Account). Their /u/[username] page stays reachable
   * by direct link either way — this only controls being *browsable*.
   */
  discoverable: boolean("discoverable").notNull().default(true),
  /** Opt-in: show the user's latest test results on their public /u/[username]
   *  page. Off by default — results are private until the taker chooses to
   *  display them (toggle on the result page). Per test kind. */
  showMbtiResult: boolean("show_mbti_result").notNull().default(false),
  showIqResult: boolean("show_iq_result").notNull().default(false),
  showEqResult: boolean("show_eq_result").notNull().default(false),
  showBigFiveResult: boolean("show_big_five_result").notNull().default(false),
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

// Retained for the historical Flitt payment audit log below. New purchases use
// Stripe Checkout and the credit ledger.
export const billingIntervalEnum = pgEnum("billing_interval", [
  "month",
  "year",
]);

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
 * Lifecycle: pending → paid → generating → ready (or failed). The PDF lives privately in R2;
 * `pdfKey` is the object key and we serve it via short-lived signed URLs.
 */
export const pdfReportStatusEnum = pgEnum("pdf_report_status", [
  "pending", // checkout started, awaiting Stripe payment
  "paid", // credit spend confirmed — generation queued
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
    /** Language captured at purchase so retries always reproduce the same PDF. */
    language: text("language").notNull().default("ka"),
    status: pdfReportStatusEnum("status").notNull().default("pending"),
    /** chart input hash captured at purchase, so we can flag a stale report
     *  if the user later changes their birth data. */
    inputHash: text("input_hash"),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("GEL"),
    /** Legacy compatibility field; new credit-funded reports are always false. */
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
  // Credit balance moved (earned or spent) — deep-links to /credits.
  "credit",
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
  /** Signed credit delta for `credit` kind (positive = earned, negative
   *  = spent). */
  creditAmount?: number;
  /** CreditReason slug for `credit` kind — mapped to a Georgian label + icon. */
  creditReason?: string;
  /** Resulting balance after the change, for `credit` kind. */
  creditBalance?: number;
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
  /** "library" = composed from transit_interpretation_library (no AI call),
   *  "ai" (or absent, for older rows) = full per-user model generation. */
  source?: "library" | "ai";
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
 *   - skipped : dispatch returned false (no chart, opted out, etc.) — terminal
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
    /** 'welcome' | 'friend_request' | 'message' | 'birthday' | 'marketing'
     *  | 'verification' | 'password_reset' | 'profile_incomplete' … */
    kind: text("kind").notNull(),
    /** Recipient address at send time (users can change email later). */
    email: text("email"),
    /** Subject line as sent — makes the admin log self-explanatory. */
    subject: text("subject"),
    /** 'sent' | 'failed'. Historical rows predate the column → null = sent. */
    status: text("status").default("sent"),
    /** Error message when status='failed'. */
    error: text("error"),
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

/** Admin-created lifecycle/marketing sends whose conversion can be measured. */
export const emailCampaigns = pgTable("email_campaign", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  template: text("template").notNull(),
  subject: text("subject").notNull(),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  rewardCredits: integer("reward_credits").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  launchedAt: timestamp("launched_at", { withTimezone: true }),
});

/** One row per addressed user; completed_at is the campaign conversion event. */
export const emailCampaignRecipients = pgTable(
  "email_campaign_recipient",
  {
    campaignId: text("campaign_id")
      .notNull()
      .references(() => emailCampaigns.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    isTest: boolean("is_test").notNull().default(false),
    status: text("status").notNull().default("pending"),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    rewardedAt: timestamp("rewarded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.campaignId, t.userId] }),
    index("email_campaign_recipient_user_idx").on(t.userId, t.completedAt),
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
 * Reusable per-placement interpretation library — shared across all users.
 * One row per (subject, sign): subject ∈ sun/moon/mercury…/pluto/ascendant,
 * sign ∈ aries…pisces. `key` is `${subject}:${sign}` (e.g. "sun:scorpio").
 *
 * These are the sign-level texts that read identically for everyone with the
 * same placement, so we generate them once and reuse them — the report's
 * Big Three + planet sections pull from here at render time instead of a
 * per-user AI call. `edited=true` marks a human-curated row so regeneration
 * leaves it alone. Editable from the admin panel (same DB).
 */
export const interpretationLibrary = pgTable("interpretation_library", {
  /** `${subject}:${sign}`, e.g. "venus:leo". */
  key: text("key").primaryKey(),
  /** Placement subject: sun/moon/mercury/…/pluto/ascendant. */
  subject: text("subject").notNull(),
  /** Sign key: aries…pisces. */
  sign: text("sign").notNull(),
  /** Georgian interpretation text shown in the report. */
  body: text("body").notNull(),
  /** Model id that produced it, "curated", or "manual" after an admin edit. */
  model: text("model").notNull(),
  /** True once a human edits it — regeneration skips edited rows. */
  edited: boolean("edited").notNull().default(false),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type InterpretationLibraryRow = typeof interpretationLibrary.$inferSelect;

/**
 * Reusable per-aspect interpretation library — the aspect counterpart of
 * `interpretation_library`. One row per (planetA, planetB, kind), e.g.
 * "Sun conjunction Moon" reads identically for every user who has it, so we
 * generate each once and reuse it. `key` is `aspectKey(a, b, kind)` — the
 * SAME alphabetically-sorted "<a>-<b>-<kind>" id already used as the map key
 * in ChartInterpretationJson.aspects, so no translation layer is needed at
 * the call site. `edited=true` marks a human-curated row so regeneration
 * leaves it alone. Editable from the admin panel (same DB).
 */
export const aspectInterpretationLibrary = pgTable("aspect_interpretation_library", {
  /** `aspectKey(a, b, kind)`, e.g. "moon-sun-square". */
  key: text("key").primaryKey(),
  /** Body keys, alphabetically sorted (a < b) — matches aspectKey's order. */
  planetA: text("planet_a").notNull(),
  planetB: text("planet_b").notNull(),
  /** conjunction | sextile | square | trine | opposition */
  kind: text("kind").notNull(),
  /** Georgian interpretation text shown in the report. */
  body: text("body").notNull(),
  /** Model id that produced it, "curated", or "manual" after an admin edit. */
  model: text("model").notNull(),
  /** True once a human edits it — regeneration skips edited rows. */
  edited: boolean("edited").notNull().default(false),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type AspectInterpretationLibraryRow =
  typeof aspectInterpretationLibrary.$inferSelect;

/**
 * Reusable synastry (compatibility) interpretation library — the two-chart
 * counterpart of the natal aspect/house libraries. "One person's Sun square
 * the other's Moon" reads identically for every pair that has it, so each
 * finite combination is generated once (rich Georgian, direction-neutral
 * wording — never "your"/"their", since either partner may be A or B) and
 * reused on every profile compatibility view. Two kinds:
 *
 *   - `kind='aspect'`  — (planetA, planetB, aspectKind): a cross-chart aspect
 *                        between the two people's planets. Pair is unordered
 *                        (A's Sun △ B's Moon ≡ A's Moon △ B's Sun), keys use
 *                        sorted body names: 91 pairs × 5 kinds = 455 rows.
 *   - `kind='overlay'` — (planetA, house): one person's planet falling in the
 *                        other's house. 13 bodies × 12 houses = 156 rows.
 *
 * `key` is `aspect:${a}-${b}-${kind}` or `overlay:${body}-${house}`.
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const synastryInterpretationLibrary = pgTable(
  "synastry_interpretation_library",
  {
    key: text("key").primaryKey(),
    /** 'aspect' | 'overlay' */
    kind: text("kind").notNull(),
    /** Body key; for aspects the alphabetically-first of the pair. */
    planetA: text("planet_a").notNull(),
    /** Aspects only: the alphabetically-second body. */
    planetB: text("planet_b"),
    /** Aspects only: conjunction | sextile | square | trine | opposition. */
    aspectKind: text("aspect_kind"),
    /** Overlays only: 1–12 — whose-ever house the planet lands in. */
    house: integer("house"),
    /** Georgian interpretation shown on the compatibility view. */
    body: text("body").notNull(),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("synastry_library_kind_idx").on(t.kind)]
);

export type SynastryInterpretationLibraryRow =
  typeof synastryInterpretationLibrary.$inferSelect;

/**
 * Reusable per-house interpretation library — the house counterpart of the
 * sign/aspect libraries. Unlike a planet-in-sign or a two-planet aspect, a
 * house's full meaning depends on BOTH its cusp sign AND which (variable,
 * unbounded) set of planets occupy it, so it isn't a single finite lookup.
 * We decompose it into two reusable, finite pieces instead:
 *
 *   - `kind='cusp'`     — (house, sign): "what this life area looks like
 *                          under this sign" — 12 houses × 12 signs = 144.
 *   - `kind='occupant'` — (house, planet): "what it means for this planet's
 *                          energy to be active in this life area" —
 *                          12 houses × 11 planets = 132.
 *
 * At render time the cusp text + each occupant's text are composed into the
 * single string the report shows for that house (see actions/chart.ts).
 * `key` is `${kind}:${house}:${subject}` (subject = sign key or planet key).
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const houseInterpretationLibrary = pgTable("house_interpretation_library", {
  /** `${kind}:${house}:${subject}`, e.g. "cusp:4:cancer", "occupant:4:moon". */
  key: text("key").primaryKey(),
  /** 'cusp' | 'occupant' */
  kind: text("kind").notNull(),
  /** House number 1-12. */
  house: integer("house").notNull(),
  /** Sign key (cusp) or planet key (occupant). */
  subject: text("subject").notNull(),
  /** Georgian interpretation text shown in the report. */
  body: text("body").notNull(),
  /** Model id that produced it, "curated", or "manual" after an admin edit. */
  model: text("model").notNull(),
  /** True once a human edits it — regeneration skips edited rows. */
  edited: boolean("edited").notNull().default(false),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type HouseInterpretationLibraryRow =
  typeof houseInterpretationLibrary.$inferSelect;

/**
 * Reusable per-transit interpretation library — the daily-horoscope
 * counterpart of the natal libraries above. A transit means the same thing
 * for every user who has it ("transiting Moon square natal Venus" reads
 * identically for everyone), so each finite combination is generated once
 * and the daily reading is COMPOSED from these rows at generation time —
 * zero per-user AI calls (see actions/daily.ts). Three kinds:
 *
 *   - `kind='aspect'` — (transiting body, aspect kind, natal point):
 *                        10 × 5 × 13 = 650. Direction matters — transiting
 *                        Moon → natal Venus ≠ transiting Venus → natal Moon.
 *   - `kind='house'`  — (transiting body, natal house): 10 × 12 = 120,
 *                        "this energy is moving through this life area".
 *   - `kind='sign'`   — (fast body sun…mars, zodiac sign): 5 × 12 = 60,
 *                        the collective daily/weekly mood (same for everyone).
 *
 * `key` is `${kind}:${transit}:${subject}` where subject is
 * `${aspectKind}:${natalBody}`, a house number, or a sign key.
 * `title` is a short headline used both as the daily reading's headline
 * (strongest transit wins) and as the label in the transit-breakdown UI.
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const transitInterpretationLibrary = pgTable("transit_interpretation_library", {
  /** e.g. "aspect:moon:square:venus", "house:mars:7", "sign:moon:leo". */
  key: text("key").primaryKey(),
  /** 'aspect' | 'house' | 'sign' */
  kind: text("kind").notNull(),
  /** Transiting body key (sun…pluto). */
  transit: text("transit").notNull(),
  /** Aspect kind for kind='aspect', else null. */
  aspectKind: text("aspect_kind"),
  /** Natal point key (aspect), house number as text (house), or sign key (sign). */
  subject: text("subject").notNull(),
  /** Short Georgian headline (3-7 words). */
  title: text("title").notNull(),
  /** Georgian interpretation text (2-4 sentences). */
  body: text("body").notNull(),
  /** Model id that produced it, "curated", or "manual" after an admin edit. */
  model: text("model").notNull(),
  /** True once a human edits it — regeneration skips edited rows. */
  edited: boolean("edited").notNull().default(false),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type TransitInterpretationLibraryRow =
  typeof transitInterpretationLibrary.$inferSelect;

/**
 * Reusable moon-phase reading library. A moon-phase reading is collective
 * (same for everyone) and fully determined by (phase, moon sign) — the
 * illumination % and cycle age are numeric garnish, not interpretation
 * inputs. 8 phases × 12 signs = 96 combos, each holding the COMPLETE
 * reading shape the daily moon_phase row uses (headline/summary/body/
 * themes), so ensureMoonPhase copies a library row instead of calling the
 * model. `key` is `${phaseKey}:${signKey}`, e.g. "full_moon:leo".
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const moonPhaseInterpretationLibrary = pgTable(
  "moon_phase_interpretation_library",
  {
    /** `${phaseKey}:${signKey}`, e.g. "full_moon:leo". */
    key: text("key").primaryKey(),
    /** "new_moon", "waxing_crescent", … 8 canonical phases. */
    phase: text("phase").notNull(),
    /** Sign key ("aries"…"pisces"). */
    sign: text("sign").notNull(),
    headline: text("headline").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    themes: jsonb("themes").$type<string[]>().notNull().default([]),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    /** True once a human edits it — regeneration skips edited rows. */
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

export type MoonPhaseInterpretationLibraryRow =
  typeof moonPhaseInterpretationLibrary.$inferSelect;

/**
 * Web Push subscriptions — one row per browser/device a user opted into
 * notifications from. `endpoint` is unique (the push service URL); `p256dh`
 * and `auth` are the client's encryption keys. Presence of a row = the user
 * receives the daily push. Expired endpoints (HTTP 410) are pruned on send.
 */
export const pushSubscriptions = pgTable("push_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  /** Optional UA string for debugging which device this is. */
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;

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
  (t) => [index("chart_chat_user_created_idx").on(t.userId, t.createdAt)]
);

export type ChartChatMessage = typeof chartChatMessages.$inferSelect;

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
    /** Cached DEEP AI synastry report (multi-section, on-demand). Same viewer-
     *  hash invalidation as the short interp. */
    deepReport: jsonb("deep_report").$type<SynastryDeepReportJson | null>(),
    deepViewerHash: text("deep_viewer_hash"),
    deepModel: text("deep_model"),
    deepGeneratedAt: timestamp("deep_generated_at", { withTimezone: true }),
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
  /** Friction & growth — where it's hard and what it teaches. */
  friction: string;
  /** Long-term potential. */
  longTerm: string;
  /** 3-5 concrete pieces of advice. */
  advice: string[];
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
    /** Set only after the user completes the Today ritual. Historical visit
     *  rows are grandfathered by the rollout migration to preserve streaks. */
    ritualCompletedAt: timestamp("ritual_completed_at", { withTimezone: true }),
    /** 0 = grandfathered visit, 1+ = actual ritual product version. */
    ritualVersion: integer("ritual_version"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.dateLocal] }),
    index("user_activity_ritual_completed_idx").on(
      t.userId,
      t.ritualCompletedAt
    ),
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
 *  - daily_visit         — legacy enum name; now awarded for completing the daily ritual
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
     *   - daily_visit        → `${userId}:YYYY-MM-DD` after ritual completion
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

/**
 * Per-axis MBTI score. `letter` is the winning pole of the axis; `pct` is how
 * strongly the user leaned toward it (50–100 — 50 is a dead tie, 100 is the
 * extreme). Drives the four progress bars on the results page.
 */
export type MbtiAxisScore = {
  letter: string; // one of E/I, S/N, T/F, J/P, A/T depending on the axis
  pct: number; // 50–100
};

/**
 * The five MBTI axes, keyed by the axis pair. `AT` (Identity, Assertive/
 * Turbulent) is optional so rows written before the Identity axis existed still
 * type-check when read back.
 */
export type MbtiScoresJson = {
  EI: MbtiAxisScore;
  SN: MbtiAxisScore;
  TF: MbtiAxisScore;
  JP: MbtiAxisScore;
  AT?: MbtiAxisScore;
};

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
  ]
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
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
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
  ]
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

/**
 * One row per completed EQ (emotional intelligence) test. Like `iq_result`,
 * kept for both signed-in users (history) and anonymous takers (`user_id`
 * null) so the score distribution can be self-normed later. Self-report
 * Likert, scored server-side; `overall` is 0–100 and `band` its label.
 * `attempt_id` dedupes result-page refreshes/re-POSTs.
 */
/**
 * Anonymous "daily horoscope by email" subscribers captured from the public
 * natal-chart calculator — a lower-friction alternative to full signup that
 * still puts them on the daily email loop (the return hook). No account, no
 * password: just an email + the sun sign from the chart they just computed.
 * Converting a lead into a real account happens when they click through and
 * register.
 */
export const horoscopeLeads = pgTable(
  "horoscope_lead",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    /** Sun-sign index 0–11 (from the chart they just computed). */
    sunSign: integer("sun_sign").notNull(),
    /** "<sun>.<moon>.<asc>" index triple for deep-linking back to their chart. */
    big: text("big"),
    /** Where the lead was captured (default: the free natal calculator). */
    source: text("source").notNull().default("natal_calculator"),
    /** Opaque one-click unsubscribe token. */
    unsubscribeToken: text("unsubscribe_token")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    /** YYYY-MM-DD of the last daily send — idempotency guard for the cron. */
    lastSentDate: text("last_sent_date"),
    /** Set when they opt out; NULL = active subscriber. */
    unsubscribedAt: timestamp("unsubscribed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("horoscope_lead_active_idx").on(t.unsubscribedAt)]
);

export type HoroscopeLead = typeof horoscopeLeads.$inferSelect;
export type NewHoroscopeLead = typeof horoscopeLeads.$inferInsert;

export const eqResults = pgTable(
  "eq_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
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
  ]
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
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
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
  ]
);

export type BigFiveResultRow = typeof bigFiveResults.$inferSelect;
export type NewBigFiveResultRow = typeof bigFiveResults.$inferInsert;

/**
 * Reusable Astro-MBTI interpretation library — the pro-written, pre-generated
 * bulk that a fast live `flash` call composes over at test time (same pattern
 * as the transit/house libraries). Two kinds:
 *
 *   - `kind='type'`     — (mbtiType): the deep psychological portrait of the
 *                         type. `title` holds its Georgian archetype name.
 *                         16 rows.
 *   - `kind='type_sun'` — (mbtiType, sun sign): "how this type expresses
 *                         through this Sun sign" — the reducible astro fusion.
 *                         16 × 12 = 192 rows.
 *
 * `key` is `${kind}:${mbtiType}[:${sign}]`, e.g. "type:INFJ", "type_sun:INFJ:leo".
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const mbtiInterpretationLibrary = pgTable("mbti_interpretation_library", {
  /** e.g. "type:INFJ", "type_sun:INFJ:leo". */
  key: text("key").primaryKey(),
  /** 'type' | 'type_sun' */
  kind: text("kind").notNull(),
  /** 4-letter MBTI code. */
  mbtiType: text("mbti_type").notNull(),
  /** Sun sign key for kind='type_sun', else null. */
  sign: text("sign"),
  /** Georgian archetype name (kind='type' only), else null. */
  title: text("title"),
  /** Georgian interpretation text. */
  body: text("body").notNull(),
  /** Model id that produced it, or "manual" after an admin edit. */
  model: text("model").notNull(),
  /** True once a human edits it — regeneration skips edited rows. */
  edited: boolean("edited").notNull().default(false),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type MbtiInterpretationLibraryRow =
  typeof mbtiInterpretationLibrary.$inferSelect;

/**
 * The Astro-MBTI quiz questions — the editable surface of the test. Seeded from
 * the canonical list in lib/mbti-questions.ts (`MBTI_QUESTIONS`), which stays
 * the source of truth for the *structure* (id → axis → pole, 12-per-axis
 * balance). Admins edit only `textKa` here (wording/grammar fixes), so scoring
 * can never be broken from the panel. The quiz reads active rows live, so edits
 * go out immediately; the app falls back to the static list if the table is
 * empty or unreachable.
 */
export const mbtiQuestions = pgTable("mbti_question", {
  /** Stable 1..60 — matches the id answers are keyed by. */
  id: integer("id").primaryKey(),
  /** 'EI' | 'SN' | 'TF' | 'JP' | 'AT' — fixed structural metadata. */
  axis: text("axis").notNull(),
  /** The pole agreeing pushes toward (E/I/…/A/T) — fixed structural metadata. */
  pole: text("pole").notNull(),
  /** Georgian statement shown to the taker (the editable field). */
  textKa: text("text_ka").notNull(),
  /** Presentation order in the quiz. */
  orderIndex: integer("order_index").notNull(),
  /** Included in the live test when true. */
  active: boolean("active").notNull().default(true),
  /** True once an admin edits the wording (re-seed skips edited rows). */
  edited: boolean("edited").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type MbtiQuestionRow = typeof mbtiQuestions.$inferSelect;

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
  ]
);

export type SurveyResponseRow = typeof surveyResponses.$inferSelect;
