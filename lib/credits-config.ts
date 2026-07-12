/**
 * Credit-economy constants — the pure, client-safe half of the credit system.
 *
 * Split out from lib/credits.ts (which imports the DB) so client components
 * (top-up card, invite card, etc.) can read prices/rewards without pulling
 * server-only code into the browser bundle. lib/credits re-exports everything
 * here, so server code can keep importing from a single place.
 *
 * Tuning the economy is a one-line change in this file.
 */

export const SIGNUP_BONUS = 20;
export const REFERRAL_REWARD = 10;

/** Stripe top-up packs. Minimum ₾10 (we only have Stripe for now). `tetri` is
 *  the charge amount in minor units (1 GEL = 100 tetri). */
export const CREDIT_PACKS = [
  { id: "s", gel: 10, tetri: 1000, credits: 20 },
  { id: "m", gel: 20, tetri: 2000, credits: 45 },
  { id: "l", gel: 50, tetri: 5000, credits: 130 },
] as const;
export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"];

/** Credits EARNED by activity (beyond signup/referral/purchase). Capped to
 *  prevent farming — see the caps below. */
export const CREDIT_REWARD = {
  feedPost: 5,
  profilePhoto: 3,
} as const;

/** Anti-farming caps for earned credits. */
export const REWARD_CAP = {
  /** Only the first N feed posts each day earn credits. */
  feedPostPerDay: 1,
  /** Profile-photo reward is one-time (guarded by ledger presence). */
} as const;

/** What each gated action costs (beyond its free allowance). */
export const CREDIT_COST = {
  synastry: 5,
  chat: 1,
  mbtiTest: 5,
  iqTest: 5,
  audioHoroscope: 2,
  pdfReport: 5,
  weeklyForecast: 10,
} as const;

/** Free before credits are needed. */
export const FREE_ALLOWANCE = {
  /** Lifetime free compatibility charts. */
  synastry: 1,
  /** Free AI-chat messages per day. */
  chatPerDay: 2,
} as const;

export type CreditReason =
  | "signup_bonus"
  | "referral"
  | "purchase"
  | "earn_feed_post"
  | "earn_profile_photo"
  | "spend_synastry"
  | "spend_chat"
  | "spend_mbti"
  | "spend_iq"
  | "spend_audio"
  | "spend_report"
  | "spend_weekly"
  | "grandfather"
  | "admin_grant";
