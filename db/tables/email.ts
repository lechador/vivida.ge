import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  date,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

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
    model: text("model").notNull(), // e.g. 'google/gemini-3.8-flash'
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);

/** Transit + cache metadata stored alongside the daily reading. */
export type DailyTransitsJson = {
  topAspects: Array<{
    transit: string; // body key (e.g. "moon")
    natal: string; // body key
    kind: string; // aspect kind
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
  /** The exact Moon aspect that drove the product headline, if any. */
  headlineAspect?: {
    transit: string;
    natal: string;
    kind: string;
  } | null;
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
  ],
);

/**
 * Append-only log of every transactional email we send. Two purposes:
 *   1. Idempotency for one-shot emails (e.g. welcome) — we check for an
 *      existing row before sending.
 *   2. Per-kind throttling for notification emails (friend-request,
 *      message, post_comment, post_reaction) — we suppress a second send
 *      within a sliding 1h window so a chatty conversation doesn't spam
 *      the inbox.
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
    /** 'welcome' | 'friend_request' | 'message' | 'post_comment' |
     *  'post_reaction' | 'birthday' | 'marketing' | 'verification' |
     *  'password_reset' | 'profile_incomplete' | 'verified_badge_gift' … */
    kind: text("kind").notNull(),
    /** Recipient address at send time (users can change email later). */
    email: text("email"),
    /** Subject line as sent — makes the admin log self-explanatory. */
    subject: text("subject"),
    /** 'sent' | 'failed'. Historical rows predate the column → null = sent. */
    status: text("status").default("sent"),
    /** Error message when status='failed'. */
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("email_send_log_user_kind_sent_idx").on(t.userId, t.kind, t.sentAt),
  ],
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.campaignId, t.userId] }),
    index("email_campaign_recipient_user_idx").on(t.userId, t.completedAt),
  ],
);

export type DailyHoroscope = typeof dailyHoroscopes.$inferSelect;

export type NewDailyHoroscope = typeof dailyHoroscopes.$inferInsert;

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
  (t) => [index("horoscope_lead_active_idx").on(t.unsubscribedAt)],
);

export type HoroscopeLead = typeof horoscopeLeads.$inferSelect;

export type NewHoroscopeLead = typeof horoscopeLeads.$inferInsert;
