/**
 * Static date metadata for the public zodiac SEO pages. Slugs match
 * `lib/zodiac.ts` keys (latin), Georgian labels mirror the chart engine
 * so we never invent a translation here.
 *
 * Date ranges are the conventional Western tropical sun-sign cusps, not
 * the precise yearly transit (which can shift by ±1 day). Good enough for
 * SEO copy; the by-date lookup uses these same boundaries so it stays
 * consistent with what's printed on the page.
 */

import { SIGNS } from "@/lib/zodiac";
import type { ZodiacSign } from "@/lib/zodiac";

export type ZodiacSlug =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ZodiacDateMeta = {
  slug: ZodiacSlug;
  /** Inclusive start. */
  start: { month: number; day: number };
  /** Inclusive end. */
  end: { month: number; day: number };
  /** Display string in Georgian, e.g. "21 მარტი – 19 აპრილი". */
  rangeKa: string;
  /** Display string in English. */
  rangeEn: string;
};

export const ZODIAC_DATES: Record<ZodiacSlug, ZodiacDateMeta> = {
  aries: {
    slug: "aries",
    start: { month: 3, day: 21 },
    end: { month: 4, day: 19 },
    rangeKa: "21 მარტი – 19 აპრილი",
    rangeEn: "March 21 – April 19",
  },
  taurus: {
    slug: "taurus",
    start: { month: 4, day: 20 },
    end: { month: 5, day: 20 },
    rangeKa: "20 აპრილი – 20 მაისი",
    rangeEn: "April 20 – May 20",
  },
  gemini: {
    slug: "gemini",
    start: { month: 5, day: 21 },
    end: { month: 6, day: 20 },
    rangeKa: "21 მაისი – 20 ივნისი",
    rangeEn: "May 21 – June 20",
  },
  cancer: {
    slug: "cancer",
    start: { month: 6, day: 21 },
    end: { month: 7, day: 22 },
    rangeKa: "21 ივნისი – 22 ივლისი",
    rangeEn: "June 21 – July 22",
  },
  leo: {
    slug: "leo",
    start: { month: 7, day: 23 },
    end: { month: 8, day: 22 },
    rangeKa: "23 ივლისი – 22 აგვისტო",
    rangeEn: "July 23 – August 22",
  },
  virgo: {
    slug: "virgo",
    start: { month: 8, day: 23 },
    end: { month: 9, day: 22 },
    rangeKa: "23 აგვისტო – 22 სექტემბერი",
    rangeEn: "August 23 – September 22",
  },
  libra: {
    slug: "libra",
    start: { month: 9, day: 23 },
    end: { month: 10, day: 22 },
    rangeKa: "23 სექტემბერი – 22 ოქტომბერი",
    rangeEn: "September 23 – October 22",
  },
  scorpio: {
    slug: "scorpio",
    start: { month: 10, day: 23 },
    end: { month: 11, day: 21 },
    rangeKa: "23 ოქტომბერი – 21 ნოემბერი",
    rangeEn: "October 23 – November 21",
  },
  sagittarius: {
    slug: "sagittarius",
    start: { month: 11, day: 22 },
    end: { month: 12, day: 21 },
    rangeKa: "22 ნოემბერი – 21 დეკემბერი",
    rangeEn: "November 22 – December 21",
  },
  capricorn: {
    slug: "capricorn",
    start: { month: 12, day: 22 },
    end: { month: 1, day: 19 },
    rangeKa: "22 დეკემბერი – 19 იანვარი",
    rangeEn: "December 22 – January 19",
  },
  aquarius: {
    slug: "aquarius",
    start: { month: 1, day: 20 },
    end: { month: 2, day: 18 },
    rangeKa: "20 იანვარი – 18 თებერვალი",
    rangeEn: "January 20 – February 18",
  },
  pisces: {
    slug: "pisces",
    start: { month: 2, day: 19 },
    end: { month: 3, day: 20 },
    rangeKa: "19 თებერვალი – 20 მარტი",
    rangeEn: "February 19 – March 20",
  },
};

export const ALL_SLUGS: ZodiacSlug[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

export function signMetaBySlug(slug: ZodiacSlug): ZodiacSign | undefined {
  return SIGNS.find((s) => s.key === slug);
}

// ─── Element helpers ───────────────────────────────────────────────────

export type ElementSlug = "fire" | "earth" | "air" | "water";

export const ELEMENT_LABEL_KA: Record<ElementSlug, string> = {
  fire: "ცეცხლი",
  earth: "მიწა",
  air: "ჰაერი",
  water: "წყალი",
};

export const ALL_ELEMENT_SLUGS: ElementSlug[] = [
  "fire",
  "earth",
  "air",
  "water",
];

export const SIGNS_BY_ELEMENT: Record<ElementSlug, ZodiacSlug[]> = {
  fire: ["aries", "leo", "sagittarius"],
  earth: ["taurus", "virgo", "capricorn"],
  air: ["gemini", "libra", "aquarius"],
  water: ["cancer", "scorpio", "pisces"],
};

export function elementSlugForSign(slug: ZodiacSlug): ElementSlug {
  for (const el of ALL_ELEMENT_SLUGS) {
    if (SIGNS_BY_ELEMENT[el].includes(slug)) return el;
  }
  return "fire";
}

// ─── Pair helpers ───────────────────────────────────────────────────────

/**
 * Canonical pair slug, always sorted by canonical sign index so
 * `aries-leo` and `leo-aries` resolve to the same key.
 */
export function pairSlug(a: ZodiacSlug, b: ZodiacSlug): string {
  const ia = ALL_SLUGS.indexOf(a);
  const ib = ALL_SLUGS.indexOf(b);
  return ia <= ib ? `${a}-${b}` : `${b}-${a}`;
}

/** Parse `aries-leo` into [aries, leo] in canonical order, or null if invalid. */
export function parsePairSlug(slug: string): [ZodiacSlug, ZodiacSlug] | null {
  const [a, b] = slug.split("-") as [ZodiacSlug, ZodiacSlug];
  if (!a || !b) return null;
  if (!ALL_SLUGS.includes(a) || !ALL_SLUGS.includes(b)) return null;
  // Reject unsorted form so canonical URL is the only valid path.
  if (ALL_SLUGS.indexOf(a) > ALL_SLUGS.indexOf(b)) return null;
  return [a, b];
}

/** All unique unordered pairs including same-sign (i ≤ j). 78 entries. */
export const ALL_PAIR_SLUGS: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < ALL_SLUGS.length; i++) {
    for (let j = i; j < ALL_SLUGS.length; j++) {
      out.push(`${ALL_SLUGS[i]}-${ALL_SLUGS[j]}`);
    }
  }
  return out;
})();

/**
 * Resolve the sun sign for a given (month, day). The boundaries follow
 * ZODIAC_DATES, Capricorn wraps across the year boundary so the lookup
 * needs explicit handling of both halves.
 */
export function signSlugByDate(month: number, day: number): ZodiacSlug {
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "pisces";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "scorpio";
  return "sagittarius";
}
