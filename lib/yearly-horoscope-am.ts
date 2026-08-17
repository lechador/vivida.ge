import rawData from "@/lib/seo/yearly-horoscope-am.json";
import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type YearlyHoroscopeArmenian = {
  title: string;
  description: string;
  tagline: string;
  overview: string[];
  supportiveMonths: string[];
  reflectiveMonths: string[];
  sections: Array<{ title: string; body: string }>;
  keyDates: Array<{ date: string; note: string }>;
  advice: string;
  faq: Array<{ q: string; a: string }>;
};

type YearlySource = {
  slug: string;
  year: number;
  labelEn: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  overview: string;
  love: { title: string; body: string };
  career: { title: string; body: string };
  money: { title: string; body: string };
  health: { title: string; body: string };
  growth: { title: string; body: string };
  bestMonths: string[];
  hardMonths: string[];
  keyDates: Array<{ date: string; note: string }>;
  advice: string;
  faq: Array<{ q: string; a: string }>;
};

const YEARLY_AM = rawData as Record<ZodiacSlug, YearlySource>;

export function yearlyHoroscopeArmenian(
  sign: ZodiacSlug,
  year: number,
): YearlyHoroscopeArmenian | undefined {
  if (year !== 2026) return undefined;
  const source = YEARLY_AM[sign];
  if (!source || source.slug !== sign || source.year !== year) return undefined;

  return {
    title: source.pageTitle,
    description: source.metaDescription,
    tagline: source.tagline,
    overview: source.overview
      .split("\n\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    supportiveMonths: source.bestMonths,
    reflectiveMonths: source.hardMonths,
    sections: [
      source.love,
      source.career,
      source.money,
      source.health,
      source.growth,
    ],
    keyDates: source.keyDates,
    advice: source.advice,
    faq: source.faq,
  };
}
