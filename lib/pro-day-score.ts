import type { UserLocale } from "./i18n/user-locale";

/**
 * PRO day score — a single 1–10 number summarizing today's sky from the
 * transit aspects already overlaid for the dashboard breakdown. Pure and
 * deterministic: harmonic aspects pull up, tense ones pull down, everything
 * else (conjunctions, unknowns) is neutral. No AI, no DB, no cost.
 */

const HARMONIC = new Set(["sextile", "trine"]);
const TENSE = new Set(["square", "opposition"]);

export type ProDayScore = {
  score: number;
  harmonic: number;
  tense: number;
  neutral: number;
};

export function proDayScore(kinds: string[]): ProDayScore {
  let harmonic = 0;
  let tense = 0;
  let neutral = 0;
  for (const kind of kinds) {
    if (HARMONIC.has(kind)) harmonic += 1;
    else if (TENSE.has(kind)) tense += 1;
    else neutral += 1;
  }
  const score = Math.min(10, Math.max(1, 5 + harmonic - tense));
  return { score, harmonic, tense, neutral };
}

export type DayScoreBand = {
  label: string;
  hint: string;
};

const BANDS_KA: Array<{ min: number; label: string; hint: string }> = [
  {
    min: 9,
    label: "ძლიერი დღე",
    hint: "ცა შენს მხარესაა — გაბედე დიდი ნაბიჯი.",
  },
  {
    min: 7,
    label: "კარგი დღე",
    hint: "მხარდამჭერი ფონია — გამოიყენე ის შენს სასარგებლოდ.",
  },
  {
    min: 5,
    label: "წონასწორული დღე",
    hint: "არც წინაღობა ჩანს, არც საჩუქარი — რიტმს შენ ქმნი.",
  },
  {
    min: 3,
    label: "მშვიდი დღე",
    hint: "ნუ გადატვირთავ განრიგს — დაისვენე და დააკვირდი.",
  },
  {
    min: 1,
    label: "რთული დღე",
    hint: "მოერიდე მნიშვნელოვან გადაწყვეტილებებს და გაუფრთხილდი თავს.",
  },
];

const BANDS_EN: Array<{ min: number; label: string; hint: string }> = [
  {
    min: 9,
    label: "A power day",
    hint: "The sky is on your side — take the bold step.",
  },
  {
    min: 7,
    label: "A good day",
    hint: "Supportive background — put it to work for you.",
  },
  {
    min: 5,
    label: "A balanced day",
    hint: "No clear obstacle, no clear gift — you set the rhythm.",
  },
  {
    min: 3,
    label: "A quiet day",
    hint: "Don't overload your schedule — rest and observe.",
  },
  {
    min: 1,
    label: "A tender day",
    hint: "Avoid big decisions and be gentle with yourself.",
  },
];

export function dayScoreBand(
  score: number,
  locale: UserLocale = "ka",
): DayScoreBand {
  const bands = locale === "ka" ? BANDS_KA : BANDS_EN;
  const band = bands.find((b) => score >= b.min) ?? bands[bands.length - 1];
  return { label: band.label, hint: band.hint };
}
