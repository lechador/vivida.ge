import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Auth.js v5 standard tables.
 * Schema mirrors @auth/drizzle-adapter's expected shape so the adapter
 * can read/write users, accounts, sessions, and verification tokens.
 */

export const users = pgTable(
  "user",
  {
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
    /**
     * E.164 mobile number (+995XXXXXXXXX). Only ever set after an SMS code
     * proves control of the number; unique so a number maps to at most one
     * account (phone login resolves the account through this column).
     */
    phone: text("phone").unique(),
    /** Timestamp of the SMS OTP verification that proved control of `phone`. */
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
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
    /** Separate, explicit opt-in for promotional SMS to the verified phone. */
    smsMarketing: boolean("sms_marketing").notNull().default(false),
    smsMarketingConsentedAt: timestamp("sms_marketing_consented_at", {
      withTimezone: true,
    }),
    // ── Native mobile push preferences ───────────────────────────────────
    // The master switch starts OFF until the user grants the OS notification
    // permission. Category choices default ON so the first opt-in enables the
    // useful product notifications without additional setup.
    pushEnabled: boolean("push_enabled").notNull().default(false),
    pushMessages: boolean("push_messages").notNull().default(true),
    pushHoroscope: boolean("push_horoscope").notNull().default(true),
    pushComments: boolean("push_comments").notNull().default(true),
    pushReactions: boolean("push_reactions").notNull().default(true),
    /** Preferred interface language for authenticated pages. Public SEO routes
     * keep their explicit URL language; this setting controls the signed-in UI. */
    interfaceLanguage: text("interface_language").notNull().default("ka"),
    /** ISO 3166-1 alpha-2 residence country captured from the registration IP. */
    residenceCountryCode: text("residence_country_code"),
    /** HMAC of the registration IP, used only for short-window abuse checks. */
    signupIpHash: text("signup_ip_hash"),
    /** User-entered residence city; intentionally blank at registration. */
    residenceCity: text("residence_city"),
    /** Stripe customer is kept on the user so canceled subscribers can return. */
    stripeCustomerId: text("stripe_customer_id").unique(),
    /** Denormalized entitlement flag maintained only by verified Stripe events. */
    isPremium: boolean("is_premium").notNull().default(false),
    /** Last paid entitlement boundary, shown in account/subscription UI. */
    premiumUntil: timestamp("premium_until", { withTimezone: true }),
    /** Manual identity badge gift, independent from paid Premium access. */
    verifiedBadgeGrantedAt: timestamp("verified_badge_granted_at", {
      withTimezone: true,
    }),
    /** Admin email captured for the audit trail at grant time. */
    verifiedBadgeGrantedBy: text("verified_badge_granted_by"),
    /** Set only after the transactional gift email is accepted by Resend. */
    verifiedBadgeEmailSentAt: timestamp("verified_badge_email_sent_at", {
      withTimezone: true,
    }),
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
  },
  (t) => [
    index("user_name_trgm_idx").using("gin", t.name.asc().op("gin_trgm_ops")),
    index("user_signup_ip_created_idx").on(t.signupIpHash, t.createdAt),
  ],
);

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
  ],
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
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
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
  (t) => [index("auth_token_user_purpose_idx").on(t.userId, t.purpose)],
);

/**
 * Short-lived SMS OTP challenges for the phone flows: optional verification
 * during signup, phone-number login, and adding/changing the number in the
 * account. The 6-digit code is single-use, expires fast, and is stored only
 * as a hash. A challenge becomes claimable once the code was entered
 * correctly (`verifiedAt`); signup passes `claimToken` back to bind the
 * verified number, so a browser can never attach a number it didn't prove
 * control of.
 */
export const phoneVerificationPurposeEnum = pgEnum(
  "phone_verification_purpose",
  ["signup", "login", "account"],
);

export const phoneVerifications = pgTable(
  "phone_verification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** E.164 (+995XXXXXXXXX) — see lib/phone.ts normalization. */
    phone: text("phone").notNull(),
    purpose: phoneVerificationPurposeEnum("purpose").notNull(),
    /** SHA-256 of `${phone}:${code}` — the raw code never touches the DB. */
    codeHash: text("code_hash").notNull(),
    /** Random token handed to the client only after a correct code entry;
     *  signup submits it to bind the verified number to the new account. */
    claimToken: text("claim_token").notNull().unique(),
    /** Owner for the account purpose; NULL for signup/login challenges,
     *  which run before (or without) a session. */
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    /** Wrong-code guesses consumed so far; the row dies at the cap. */
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Set when the correct code was entered. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    /** Set when the verification was used up (session established, claim
     *  bound to an account, number saved). */
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("phone_verification_phone_purpose_idx").on(t.phone, t.purpose)],
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
  (t) => [index("mobile_refresh_token_user_idx").on(t.userId)],
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
  ],
);

export type User = typeof users.$inferSelect;

export type AuthToken = typeof authTokens.$inferSelect;

export type NewAuthToken = typeof authTokens.$inferInsert;

export type MobileRefreshToken = typeof mobileRefreshTokens.$inferSelect;

export type NewMobileRefreshToken = typeof mobileRefreshTokens.$inferInsert;

export type RateLimitHit = typeof rateLimitHits.$inferSelect;

export type NewRateLimitHit = typeof rateLimitHits.$inferInsert;

export type AuthTokenPurpose = (typeof authTokenPurposeEnum.enumValues)[number];

export type PhoneVerification = typeof phoneVerifications.$inferSelect;

export type NewPhoneVerification = typeof phoneVerifications.$inferInsert;

export type PhoneVerificationPurpose =
  (typeof phoneVerificationPurposeEnum.enumValues)[number];
