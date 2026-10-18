import { SIGNS, type ZodiacSign } from "@/lib/zodiac";

export type ZodiacSlug = ZodiacSign["slug"];
export type ElementSlug = "fire" | "earth" | "air" | "water";

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

export const ALL_ELEMENT_SLUGS: ElementSlug[] = ["fire", "earth", "air", "water"];

export const ELEMENT_LABEL_KA: Record<ElementSlug, string> = {
  fire: "ცეცხლი",
  earth: "მიწა",
  air: "ჰაერი",
  water: "წყალი",
};

export const SIGNS_BY_ELEMENT: Record<ElementSlug, ZodiacSlug[]> = {
  fire: ["aries", "leo", "sagittarius"],
  earth: ["taurus", "virgo", "capricorn"],
  air: ["gemini", "libra", "aquarius"],
  water: ["cancer", "scorpio", "pisces"],
};

export const ZODIAC_DATES: Record<
  ZodiacSlug,
  { rangeKa: string; rangeEn: string; startMonth: number; startDay: number; endMonth: number; endDay: number }
> = {
  aries: { rangeKa: "21 მარტი – 19 აპრილი", rangeEn: "Mar 21 – Apr 19", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  taurus: { rangeKa: "20 აპრილი – 20 მაისი", rangeEn: "Apr 20 – May 20", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  gemini: { rangeKa: "21 მაისი – 20 ივნისი", rangeEn: "May 21 – Jun 20", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  cancer: { rangeKa: "21 ივნისი – 22 ივლისი", rangeEn: "Jun 21 – Jul 22", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  leo: { rangeKa: "23 ივლისი – 22 აგვისტო", rangeEn: "Jul 23 – Aug 22", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  virgo: { rangeKa: "23 აგვისტო – 22 სექტემბერი", rangeEn: "Aug 23 – Sep 22", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  libra: { rangeKa: "23 სექტემბერი – 22 ოქტომბერი", rangeEn: "Sep 23 – Oct 22", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  scorpio: { rangeKa: "23 ოქტომბერი – 21 ნოემბერი", rangeEn: "Oct 23 – Nov 21", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  sagittarius: { rangeKa: "22 ნოემბერი – 21 დეკემბერი", rangeEn: "Nov 22 – Dec 21", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  capricorn: { rangeKa: "22 დეკემბერი – 19 იანვარი", rangeEn: "Dec 22 – Jan 19", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  aquarius: { rangeKa: "20 იანვარი – 18 თებერვალი", rangeEn: "Jan 20 – Feb 18", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  pisces: { rangeKa: "19 თებერვალი – 20 მარტი", rangeEn: "Feb 19 – Mar 20", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
};

export function signMetaBySlug(slug: string): ZodiacSign | undefined {
  return SIGNS.find((s) => s.slug === slug);
}

export function elementSlugForSign(slug: ZodiacSlug): ElementSlug {
  for (const [el, list] of Object.entries(SIGNS_BY_ELEMENT) as [ElementSlug, ZodiacSlug[]][]) {
    if (list.includes(slug)) return el;
  }
  return "fire";
}

export function pairSlug(a: ZodiacSlug, b: ZodiacSlug): string {
  const ia = ALL_SLUGS.indexOf(a);
  const ib = ALL_SLUGS.indexOf(b);
  return ia <= ib ? `${a}-${b}` : `${b}-${a}`;
}

export const ALL_PAIR_SLUGS: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < ALL_SLUGS.length; i++) {
    for (let j = i; j < ALL_SLUGS.length; j++) {
      out.push(`${ALL_SLUGS[i]}-${ALL_SLUGS[j]}`);
    }
  }
  return out;
})();

export function parsePairSlug(pair: string): [ZodiacSlug, ZodiacSlug] | null {
  const parts = pair.split("-") as [ZodiacSlug, ZodiacSlug];
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!ALL_SLUGS.includes(a) || !ALL_SLUGS.includes(b)) return null;
  return [a, b];
}

export function signSlugByDate(month: number, day: number): ZodiacSlug {
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return "aries";
  if (md >= 420 && md <= 520) return "taurus";
  if (md >= 521 && md <= 620) return "gemini";
  if (md >= 621 && md <= 722) return "cancer";
  if (md >= 723 && md <= 822) return "leo";
  if (md >= 823 && md <= 922) return "virgo";
  if (md >= 923 && md <= 1022) return "libra";
  if (md >= 1023 && md <= 1121) return "scorpio";
  if (md >= 1122 && md <= 1221) return "sagittarius";
  if (md >= 120 && md <= 218) return "aquarius";
  if (md >= 219 && md <= 320) return "pisces";
  return "capricorn";
}
