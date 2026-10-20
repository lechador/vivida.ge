/**
 * Dormant win-back sequence v1: pure configuration and selection logic.
 *
 * Anchor = the user's last `user_activity_day.date_local`. Steps fire relative
 * to that anchor, not relative to when the previous email was sent, so a missed
 * cron run does not shift the whole schedule.
 *
 * Approved Georgian copy (COR-21) and its English fallbacks live here, next to
 * the step config, so the sender and the React Email template cannot drift
 * apart. Do not edit the copy without going back through Retention/SEO.
 *
 * Exit rules: a return (`daysSinceLastVisit` drops below the dormant window),
 * a purchase, or a nudges unsubscribe ends the spell. Selection also enforces
 * one email per step per 30-day spell and a minimum gap between steps.
 */

export type WinbackStepNumber = 1 | 2 | 3;

export type WinbackKind = "winback_v1_s1" | "winback_v1_s2" | "winback_v1_s3";

export type WinbackStep = {
  step: WinbackStepNumber;
  kind: WinbackKind;
  /** Stable `email_campaign.slug`. Never rename: conversion rows key off it. */
  slug: string;
  /** Stable `email_campaign.template` value (React Email component id). */
  template: string;
  /** Due once the user has been dormant at least this many days. */
  dueAfterDays: number;
  /** Path on the localized origin; the sender prefixes the origin. */
  path: string;
  subjectKa: string;
  subjectEn: string;
  preheaderKa: string;
  preheaderEn: string;
  bodyKa: readonly string[];
  bodyEn: readonly string[];
  ctaKa: string;
  ctaEn: string;
  pushTitleKa: string;
  pushTitleEn: string;
  pushBodyKa: string;
  pushBodyEn: string;
};

export const WINBACK_STEPS: readonly WinbackStep[] = [
  {
    step: 1,
    kind: "winback_v1_s1",
    slug: "winback_dormant_v1_s1",
    template: "winback-s1",
    dueAfterDays: 8,
    path: "/dashboard",
    subjectKa: "ცა არ გაჩერებულა — რა ხდება დღეს შენს ნიშანთან",
    subjectEn: "The sky kept moving — today's view for your sign",
    preheaderKa:
      "ბოლო დღეებში პლანეტებმა პოზიციები შეიცვალეს. ნახე დღევანდელი ტრანზიტი.",
    preheaderEn:
      "Planetary positions have shifted over the past few days. See today's transit.",
    bodyKa: [
      "როცა ყოველდღიური საქმეებით ხარ დაკავებული, ცა თავის გზას განაგრძობს. ბოლო ერთი კვირის განმავლობაში პლანეტებმა ახალი ასპექტები შექმნეს, რაც შენი ნიშნის ენერგიასა და განწყობაზე უკვე აისახება.",
      "დღეს შენს ჰოროსკოპში რამდენიმე საინტერესო აქცენტი გამოიკვეთა — განსაკუთრებით ურთიერთობებისა და შინაგანი რესურსების კუთხით. ეს არ არის წინასწარ განსაზღვრული მოვლენები, არამედ მარტივი ორიენტირი, თუ როგორ გამოიყენო დღევანდელი დღის რიტმი შენს სასიკეთოდ.",
      "შენი პერსონალური დღის რუკა და რეკომენდაციები უკვე მზადაა.",
    ],
    bodyEn: [
      "While you were immersed in your daily routine, the sky continued on its course. Over the past week, the planets formed new aspects that are already reflected in the energy and mood of your sign.",
      "Today's horoscope highlights several key themes — particularly around relationships and inner focus. Rather than predicting set events, it offers a steady anchor to help you align with today's rhythm.",
      "Your personal daily reading is ready on your dashboard.",
    ],
    ctaKa: "ნახე დღევანდელი ჰოროსკოპი",
    ctaEn: "Read today's horoscope",
    pushTitleKa: "ცა არ გაჩერებულა ✨",
    pushTitleEn: "The sky kept moving ✨",
    pushBodyKa:
      "შენი ნიშნისთვის ახალი ასპექტი შეიქმნა. ნახე დღევანდელი სურათი.",
    pushBodyEn:
      "A new transit formed for your sign. See today's personal reading.",
  },
  {
    step: 2,
    kind: "winback_v1_s2",
    slug: "winback_dormant_v1_s2",
    template: "winback-s2",
    dueAfterDays: 11,
    path: "/horoskopi/kvireuli",
    subjectKa: "მთვარის ახალი ციკლი — შენი ნიშნის ტრანზიტები",
    subjectEn: "The moon is shifting — this week's key transits",
    preheaderKa: "უახლოესი დღეების ასტროლოგიური მოვლენები შენი ნიშნისთვის.",
    preheaderEn: "Upcoming astrological moments and transits for your sign.",
    bodyKa: [
      "ასტროლოგიაში მთავარი მოვლენები ყოველთვის ეტაპობრივად ვითარდება. ამ კვირაში მთვარე ახალ ფაზაში გადადის, რაც მიმდინარე საქმეების გადაფასებისა და ახალი მიმართულების განსაზღვრისთვის საუკეთესო პერიოდია.",
      "შენი ნიშნისთვის უახლოესი დღეები განსაკუთრებულ ყურადღებას მოითხოვს ენერგიის სწორ განაწილებასა და გეგმების დალაგებაზე. კვირის ტრანზიტების ცოდნა დაგეხმარება, წინასწარ იგრძნო საერთო ფონი და ზედმეტი აჩქარების გარეშე მიიღო გადაწყვეტილებები.",
      "შეამოწმე, რომელი დღეებია შენთვის ყველაზე ხელსაყრელი და რას მიაქციო ყურადღება კვირის ბოლომდე.",
    ],
    bodyEn: [
      "Key astrological shifts always unfold gradually. This week the moon transitions into a new phase, marking a natural moment to reflect on current priorities and adjust your direction.",
      "For your sign, the coming days emphasize steady energy management and clear planning. Understanding this week's planetary transits helps you gauge the overall atmosphere and move forward without unnecessary rush.",
      "See which days are most favorable for you and where to focus your attention through the end of the week.",
    ],
    ctaKa: "ნახე კვირის პროგნოზი",
    ctaEn: "Explore weekly forecast",
    pushTitleKa: "მთვარე ფაზას იცვლის 🌙",
    pushTitleEn: "The moon is shifting 🌙",
    pushBodyKa: "ნახე, როგორ აისახება ამ კვირის ტრანზიტები შენს ნიშანზე.",
    pushBodyEn: "See how this week's planetary transits influence your sign.",
  },
  {
    step: 3,
    kind: "winback_v1_s3",
    slug: "winback_dormant_v1_s3",
    template: "winback-s3",
    dueAfterDays: 14,
    path: "/taro",
    subjectKa: "ერთი კითხვა სიცხადისთვის — გაშალე ტარო",
    subjectEn: "A question on your mind? Draw a tarot card",
    preheaderKa: "ტარო არ წყვეტს შენ ნაცვლად — ის ახალ პერსპექტივას გაჩვენებს.",
    preheaderEn:
      "Tarot doesn't decide for you — it offers a fresh perspective.",
    bodyKa: [
      "ხანდახან ყველაზე რთული არა პასუხის პოვნა, არამედ სიტუაციის სხვა კუთხით დანახვაა. თუ ბოლო დროს რაიმე გადაწყვეტილებაზე ყოყმანობ, პირად ურთიერთობაში თუ საქმეში, ტარო კარგი საშუალებაა შინაგანი სიცხადის მოსაპოვებლად.",
      "ტარო მომავალს კი არ გიწინასწარმეტყველებს, არამედ გეხმარება დაინახო ის დეტალები და ემოციური ფონი, რომლებსაც ყოველდღიურ აურზაურში შესაძლოა ყურადღებას არ აქცევდე.",
      "დაუსვი ერთი გულწრფელი კითხვა საკუთარ თავს, აარჩიე კარტი და ნახე, რა სიმბოლური მინიშნება გამოჩნდება შენ წინაშე.",
    ],
    bodyEn: [
      "Sometimes the hardest part isn't finding an answer, but looking at a situation from a different angle. If you've been sitting on a decision lately — in relationships or daily matters — tarot is a grounded way to gain personal clarity.",
      "Tarot doesn't predict an inevitable future; rather, it highlights nuances and emotional undercurrents that might get lost in daily commotion.",
      "Frame a sincere question for yourself, draw a card, and see what symbolic perspective emerges.",
    ],
    ctaKa: "გაშალე ტარო",
    ctaEn: "Draw a tarot card",
    pushTitleKa: "ტაროს გაშლა 🃏",
    pushTitleEn: "Tarot reading 🃏",
    pushBodyKa: "დაუსვი კითხვა და მიიღე სიმბოლური მინიშნება.",
    pushBodyEn: "Ask your question and discover a symbolic reflection.",
  },
] as const;

/** Oldest anchor the sequence will still mail. Older users are left alone. */
export const WINBACK_SEQUENCE_MAX_DAYS = 21;

/** Step 1 only enrolls users still in their first dormant week. */
export const WINBACK_STEP_ONE_MAX_DAYS = 10;

/** Minimum spacing between two steps of the same spell. */
export const WINBACK_MIN_STEP_GAP_DAYS = 2;

/** A new spell can only start this long after the previous sequence ended. */
export const WINBACK_SPELL_COOLDOWN_DAYS = 30;

export const WINBACK_KINDS = WINBACK_STEPS.map((s) => s.kind);
export const WINBACK_SLUGS = WINBACK_STEPS.map((s) => s.slug);

export type WinbackSelectionInput = {
  daysSinceLastVisit: number;
  /** Steps already claimed (sent/pending) during this same dormancy spell. */
  sentSteps: readonly number[];
  /** Days since the most recent step of this spell, null when none yet. */
  daysSinceLastStep?: number | null;
  /** `users.email_nudges === false`, or the nudges unsubscribe was used. */
  nudgesOptedOut?: boolean;
  /** Purchase recorded after the anchor (stamped as campaign completion). */
  purchasedAt?: Date | null;
  /** Return recorded after the anchor (stamped as campaign completion). */
  convertedAt?: Date | null;
};

/**
 * Pick the single step this run may send, or null.
 *
 * Only one step per user per run: the cron is daily, and firing several steps
 * at someone who missed runs would read as a burst.
 */
export function selectWinbackStep(
  input: WinbackSelectionInput,
): WinbackStep | null {
  if (input.nudgesOptedOut) return null;
  if (input.purchasedAt || input.convertedAt) return null;

  const days = input.daysSinceLastVisit;
  if (!Number.isFinite(days) || days < 8 || days > WINBACK_SEQUENCE_MAX_DAYS) {
    return null;
  }

  const sent = new Set(input.sentSteps);
  const next = WINBACK_STEPS.find((s) => !sent.has(s.step));
  if (!next) return null;
  if (days < next.dueAfterDays) return null;

  // Never skip ahead: step 2/3 only fire after their predecessors.
  if (next.step === 2 && !sent.has(1)) return null;
  if (next.step === 3 && (!sent.has(1) || !sent.has(2))) return null;

  // A user who is already 11+ days dormant missed the step-1 window. Do not
  // mail day-8 copy late; leave them to the next spell.
  if (next.step === 1 && days > WINBACK_STEP_ONE_MAX_DAYS) return null;

  if (
    input.daysSinceLastStep != null &&
    input.daysSinceLastStep < WINBACK_MIN_STEP_GAP_DAYS
  ) {
    return null;
  }

  return next;
}

/** Whole-day distance between two YYYY-MM-DD keys (b - a). */
export function dayDifference(a: string, b: string): number {
  const start = Date.parse(`${a}T00:00:00Z`);
  const end = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return Number.NaN;
  return Math.round((end - start) / 86_400_000);
}
