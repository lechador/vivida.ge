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
/** Free credits granted to every user on the first day of each month. */
export const MONTHLY_BONUS = 5;

/**
 * Daily-visit streak rewards. Each tier is a one-time lifetime achievement:
 * the first time a user's consecutive-visit streak reaches `days`, they're
 * gifted `credits`. Ordered ascending — the streak UI reads them in order.
 */
export const STREAK_MILESTONES = [
  { days: 3, credits: 3 },
  { days: 7, credits: 10 },
  { days: 14, credits: 15 },
  { days: 30, credits: 30 },
  { days: 60, credits: 50 },
  { days: 90, credits: 80 },
  { days: 180, credits: 150 },
  { days: 365, credits: 365 },
] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

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
  eqTest: 5,
  audioHoroscope: 2,
  pdfReport: 5,
  weeklyForecast: 10,
  tarot: 10,
} as const;

/** Free before credits are needed. */
export const FREE_ALLOWANCE = {
  /** Lifetime free compatibility charts. */
  synastry: 1,
  /** Free AI-chat messages per day. */
  chatPerDay: 2,
  /** Lifetime free tarot readings before each costs credits. */
  tarot: 1,
} as const;

export type CreditReason =
  | "signup_bonus"
  | "referral"
  | "purchase"
  | "monthly_bonus"
  | "streak_bonus"
  | "birthday_gift"
  | "earn_feed_post"
  | "earn_profile_photo"
  | "spend_synastry"
  | "spend_chat"
  | "spend_mbti"
  | "spend_iq"
  | "spend_eq"
  | "spend_audio"
  | "spend_report"
  | "spend_weekly"
  | "spend_tarot"
  | "grandfather"
  | "admin_grant";

/**
 * Short Georgian label per reason — used in the credit notification row so the
 * user sees *why* their balance moved. Kept here (client-safe) so the
 * notifications dropdown can read it without pulling in server code.
 */
export const CREDIT_REASON_LABEL_KA: Record<CreditReason, string> = {
  signup_bonus: "მისალმების ბონუსი",
  referral: "მეგობრის მოწვევა",
  purchase: "ბალანსის შევსება",
  monthly_bonus: "თვის ბონუსი",
  streak_bonus: "ვიზიტების სერია",
  birthday_gift: "დაბადების დღის საჩუქარი",
  earn_feed_post: "პოსტი ფიდში",
  earn_profile_photo: "პროფილის ფოტო",
  spend_synastry: "თავსებადობა",
  spend_chat: "AI ჩატი",
  spend_mbti: "პიროვნების ტესტი",
  spend_iq: "IQ ტესტი",
  spend_eq: "EQ ტესტი",
  spend_audio: "აუდიო ჰოროსკოპი",
  spend_report: "PDF რუკა",
  spend_weekly: "7-დღიანი პროგნოზი",
  spend_tarot: "ტარო კითხვა",
  grandfather: "საჩუქარი",
  admin_grant: "საჩუქარი",
};
