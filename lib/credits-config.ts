/**
 * Credit-economy constants, the pure, client-safe half of the credit system.
 *
 * Split out from lib/credits.ts (which imports the DB) so client components
 * (top-up card, invite card, etc.) can read prices/rewards without pulling
 * server-only code into the browser bundle. lib/credits re-exports everything
 * here, so server code can keep importing from a single place.
 *
 * Tuning the economy is a one-line change in this file.
 */

export const SIGNUP_BONUS = 3;
/** signup_credits_v1: staged cohort receives this immediately. */
export const STAGED_SIGNUP_BONUS = 3;
/**
 * signup_credits_v1: staged cohort receives this on its first 24h+ return.
 * Retired to 0 (2026-10-24): the welcome grant is now a single 5-credit bonus,
 * and returning is rewarded through the monthly bonus instead.
 */
export const STAGED_RETURN_BONUS = 0;
export const REFERRAL_REWARD = 10;
/**
 * Free credits granted to recently active users on the first of each month.
 * Reduced 5 -> 3 and re-targeted at active accounts on 2026-10-17; see
 * lib/monthly-bonus-eligibility.ts for the measurement behind it.
 */
export const MONTHLY_BONUS = 3;
/** Phone-gift campaign: one-time reward for verifying a mobile number. */
export const PHONE_VERIFY_GIFT = 3;
/** …granted on top of the above when promotional-SMS consent first turns on. */
export const SMS_CONSENT_GIFT = 3;
/** Credits gifted on a user's birthday (covers one full tarot reading). */
export const BIRTHDAY_CREDITS = 10;

export {
  creditPackForCountry,
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
  formatBillingAmount,
  impulsePackForCountry,
  premiumPlanForCountry,
  PURCHASE_PROMOTION_CREDIT_THRESHOLD,
  shouldShowPurchasePromotion,
  type CreditPack,
  type PremiumPlan,
} from "@/lib/billing-config";

/** Credits EARNED by activity (beyond signup/referral/purchase). Capped to
 *  prevent farming, see the caps below. */
export const CREDIT_REWARD = {
  /** One small weekly reward keeps the feed loop alive without replacing purchases. */
  feedPost: 1,
  profilePhoto: 3,
} as const;

/** Anti-farming caps for earned credits. */
export const REWARD_CAP = {
  /** Only the first eligible feed post in a UTC week earns credits. */
  feedPostPerWeek: 1,
  /** Profile-photo reward is one-time (guarded by ledger presence). */
} as const;

/** Lifetime-only ritual milestones. Total possible reward: 8 credits. */
export const RITUAL_STREAK_MILESTONES = [
  { days: 7, credits: 1 },
  { days: 30, credits: 2 },
  { days: 100, credits: 5 },
] as const;

/** What each gated action costs (beyond its free allowance). */
export const CREDIT_COST = {
  synastry: 10,
  chat: 2,
  /** One AI dream interpretation. No free allowance, every reading costs. */
  dream: 2,
  mbtiTest: 5,
  iqTest: 5,
  eqTest: 5,
  bigFiveTest: 5,
  /** The full written chart report, the deepest single deliverable we sell. */
  pdfReport: 15,
  weeklyForecast: 10,
  tarot: 10,
  /** A follow-up question on an already-drawn tarot spread. */
  tarotFollowup: 5,
  /** Five-card love spread, a bigger draw than the standard three cards. */
  tarotLove5: 15,
  /** Yes/No question with a timing card, a single-card spread. */
  tarotYesNo: 5,
} as const;

/** Free before credits are needed. */
export const FREE_ALLOWANCE = {
  /** Lifetime free compatibility charts. None: every compatibility reading is
   *  paid, so the free unlock branch in app/synastry never fires. */
  synastry: 0,
  /** Free AI-chat messages per day. */
  chatPerDay: 1,
  /** Lifetime free tarot readings before each costs credits. */
  tarot: 1,
} as const;

export type CreditReason =
  | "signup_bonus"
  | "first_return_bonus"
  | "referral"
  | "purchase"
  | "monthly_bonus"
  | "streak_bonus"
  | "birthday_gift"
  | "campaign_reward"
  | "earn_feed_post"
  | "earn_profile_photo"
  | "earn_phone_verify"
  | "earn_sms_consent"
  | "spend_synastry"
  | "spend_chat"
  | "spend_dream"
  | "spend_mbti"
  | "spend_iq"
  | "spend_eq"
  | "spend_bigfive"
  | "spend_audio"
  | "spend_report"
  | "spend_weekly"
  | "spend_tarot"
  | "spend_tarot_followup"
  | "grandfather"
  | "admin_grant";

/**
 * Short Georgian label per reason, used in the credit notification row so the
 * user sees *why* their balance moved. Kept here (client-safe) so the
 * notifications dropdown can read it without pulling in server code.
 */
export const CREDIT_REASON_LABEL_KA: Record<CreditReason, string> = {
  signup_bonus: "მისალმების ბონუსი",
  first_return_bonus: "დაბრუნების ბონუსი",
  referral: "მეგობრის მოწვევა",
  purchase: "ბალანსის შევსება",
  monthly_bonus: "თვის ბონუსი",
  streak_bonus: "დღიური სერიის ბონუსი",
  birthday_gift: "დაბადების დღის საჩუქარი",
  campaign_reward: "დაბადების დეტალების შევსების ბონუსი",
  earn_feed_post: "პოსტი ფიდში",
  earn_profile_photo: "პროფილის ფოტო",
  earn_phone_verify: "ნომრის დადასტურება",
  earn_sms_consent: "მარკეტინგული SMS",
  spend_synastry: "თავსებადობა",
  spend_chat: "AI ჩატი",
  spend_dream: "სიზმრის AI ახსნა",
  spend_mbti: "პიროვნების ტესტი",
  spend_iq: "IQ ტესტი",
  spend_eq: "EQ ტესტი",
  spend_bigfive: "Big Five ტესტი",
  spend_audio: "აუდიო ჰოროსკოპი",
  spend_report: "PDF რუკა",
  spend_weekly: "7-დღიანი პროგნოზი",
  spend_tarot: "ტარო კითხვა",
  spend_tarot_followup: "ტაროს დაზუსტება",
  grandfather: "საჩუქარი",
  admin_grant: "საჩუქარი",
};

export const CREDIT_REASON_LABEL_EN: Record<CreditReason, string> = {
  signup_bonus: "Welcome bonus",
  first_return_bonus: "First return bonus",
  referral: "Friend referral",
  purchase: "Balance top-up",
  monthly_bonus: "Monthly bonus",
  streak_bonus: "Daily streak bonus",
  birthday_gift: "Birthday gift",
  campaign_reward: "Birth details completion bonus",
  earn_feed_post: "Feed post",
  earn_profile_photo: "Profile photo",
  earn_phone_verify: "Phone verification",
  earn_sms_consent: "Promotional SMS",
  spend_synastry: "Compatibility",
  spend_chat: "AI chat",
  spend_dream: "AI dream interpretation",
  spend_mbti: "Personality test",
  spend_iq: "IQ test",
  spend_eq: "EQ test",
  spend_bigfive: "Big Five test",
  spend_audio: "Audio horoscope",
  spend_report: "PDF chart",
  spend_weekly: "7-day forecast",
  spend_tarot: "Tarot reading",
  spend_tarot_followup: "Tarot follow-up",
  grandfather: "Gift",
  admin_grant: "Gift",
};
