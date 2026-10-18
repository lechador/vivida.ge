import { SIGNS } from "@/lib/zodiac";
import { ZODIAC_DATES, type ZodiacSlug } from "./zodiac-dates";

export type SignContentEn = {
  slug: ZodiacSlug;
  labelEn: string;
  symbol: string;
  element: string;
  modality: string;
  ruler: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  career: string;
  compatibility: Array<{ signSlug: ZodiacSlug; signEn: string; level: string; note: string }>;
  famous: string[];
  faq: Array<{ q: string; a: string }>;
};

export const SIGNS_CONTENT_EN: Record<ZodiacSlug, SignContentEn> = Object.fromEntries(
  SIGNS.map((s) => [
    s.slug,
    {
      slug: s.slug,
      labelEn: s.labelEn,
      symbol: s.symbol,
      element: s.elementEn,
      modality: s.modalityEn,
      ruler: s.rulerEn,
      tagline: `${s.modalityEn} ${s.elementEn} sign ruled by ${s.rulerEn}.`,
      intro: `${s.labelEn} (${ZODIAC_DATES[s.slug].rangeEn}) is a ${s.modalityEn.toLowerCase()} ${s.elementEn.toLowerCase()} sign ruled by ${s.rulerEn}.`,
      personality: `${s.labelEn} brings ${s.elementEn.toLowerCase()} vitality and ${s.modalityEn.toLowerCase()} focus to everyday life.`,
      strengths: ["Authentic self-expression", "Resilience and focus", "Loyal connection"],
      weaknesses: ["Overthinking under pressure", "Impatience with stagnation"],
      love: `In relationships, ${s.labelEn} values honesty, emotional presence, and shared growth.`,
      career: `At work, ${s.labelEn} thrives when given autonomy, clear goals, and meaningful challenges.`,
      compatibility: SIGNS.filter((o) => o.slug !== s.slug)
        .slice(0, 4)
        .map((o) => ({
          signSlug: o.slug,
          signEn: o.labelEn,
          level: "Strong",
          note: `${s.labelEn} and ${o.labelEn} share a complementary and engaging dynamic.`,
        })),
      famous: [],
      faq: [
        {
          q: `What are ${s.labelEn} dates?`,
          a: `${s.labelEn} season runs from ${ZODIAC_DATES[s.slug].rangeEn}.`,
        },
      ],
    },
  ]),
) as unknown as Record<ZodiacSlug, SignContentEn>;
