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
  /** When true the user has a public profile at /u/{username}. Default false. */
  isPublic: boolean("is_public").notNull().default(false),
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
