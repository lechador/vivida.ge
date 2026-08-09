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

/** Repeatable reward for each seven consecutive completed daily rituals. */
export const RITUAL_STREAK_REWARD = { days: 7, credits: 10 } as const;

export function ritualCycleProgress(currentStreak: number, todayComplete: boolean) {
  const current = Math.max(0, Math.floor(currentStreak));
  const rewardEarnedToday =
    todayComplete && current > 0 && current % RITUAL_STREAK_REWARD.days === 0;
  const remainder = current % RITUAL_STREAK_REWARD.days;
  const completedDays = rewardEarnedToday
    ? RITUAL_STREAK_REWARD.days
    : remainder;
  const daysLeft = rewardEarnedToday
    ? RITUAL_STREAK_REWARD.days
    : RITUAL_STREAK_REWARD.days - remainder;

  return {
    completedDays,
    daysLeft,
    targetDays: current + daysLeft,
    rewardEarnedToday,
  };
}

/** Stripe top-up packs. Minimum ₾10 (we only have Stripe for now). `tetri` is
 *  the charge amount in minor units (1 GEL = 100 tetri). */
export const CREDIT_PACKS = [
  { id: "s", gel: 10, tetri: 1000, credits: 30 },
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
  bigFiveTest: 5,
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
  | "campaign_reward"
  | "earn_feed_post"
  | "earn_profile_photo"
  | "spend_synastry"
  | "spend_chat"
  | "spend_mbti"
  | "spend_iq"
  | "spend_eq"
  | "spend_bigfive"
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
  streak_bonus: "რიტუალის 7-დღიანი სერია",
  birthday_gift: "დაბადების დღის საჩუქარი",
  campaign_reward: "დაბადების დეტალების შევსების ბონუსი",
  earn_feed_post: "პოსტი ფიდში",
  earn_profile_photo: "პროფილის ფოტო",
  spend_synastry: "თავსებადობა",
  spend_chat: "AI ჩატი",
  spend_mbti: "პიროვნების ტესტი",
  spend_iq: "IQ ტესტი",
  spend_eq: "EQ ტესტი",
  spend_bigfive: "Big Five ტესტი",
  spend_audio: "აუდიო ჰოროსკოპი",
  spend_report: "PDF რუკა",
  spend_weekly: "7-დღიანი პროგნოზი",
  spend_tarot: "ტარო კითხვა",
  grandfather: "საჩუქარი",
  admin_grant: "საჩუქარი",
};

export const CREDIT_REASON_LABEL_EN: Record<CreditReason, string> = {
  signup_bonus: "Welcome bonus",
  referral: "Friend referral",
  purchase: "Balance top-up",
  monthly_bonus: "Monthly bonus",
  streak_bonus: "7-day ritual streak",
  birthday_gift: "Birthday gift",
  campaign_reward: "Birth details completion bonus",
  earn_feed_post: "Feed post",
  earn_profile_photo: "Profile photo",
  spend_synastry: "Compatibility",
  spend_chat: "AI chat",
  spend_mbti: "Personality test",
  spend_iq: "IQ test",
  spend_eq: "EQ test",
  spend_bigfive: "Big Five test",
  spend_audio: "Audio horoscope",
  spend_report: "PDF chart",
  spend_weekly: "7-day forecast",
  spend_tarot: "Tarot reading",
  grandfather: "Gift",
  admin_grant: "Gift",
};
