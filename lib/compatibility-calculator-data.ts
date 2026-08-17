/**
 * Server-side builder for the slim dataset the interactive compatibility
 * calculator ships to the client. The full PAIRS_CONTENT (78 pairs × long
 * prose) is far too heavy to bundle into a client component, so we project
 * it down to just what the calculator renders: a percentage, the category,
 * the tagline, and the top strengths. Call this from a Server Component and
 * pass the result into <CompatibilityCalculator />.
 */

import {
  PAIRS_CONTENT,
  SIGNS_CONTENT,
  type CompatibilityScore,
} from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { pairPercent } from "@/lib/compatibility-score";
import { zodiacPairEnglish } from "@/lib/zodiac-pair-en";
import { zodiacPairArmenian } from "@/lib/zodiac-pair-am";

/**
 * The editorial category is what drives `percent` (see compatibility-score),
 * so the English label has to be a direct translation of it. Deriving the
 * label from the percentage instead lets the two disagree at a band edge —
 * a ჰარმონიული pair scoring 80 would read "Strong" in English but
 * "ჰარმონიული" in Georgian for the same couple.
 */
const SCORE_EN: Record<CompatibilityScore, string> = {
  ძლიერი: "Strong",
  ჰარმონიული: "Harmonious",
  გამომწვევი: "Dynamic",
};

const SCORE_AM: Record<CompatibilityScore, string> = {
  ძლიერი: "Ուժեղ",
  ჰარმონიული: "Ներդաշնակ",
  გამომწვევი: "Դինամիկ",
};

export type CalcSign = {
  slug: ZodiacSlug;
  label: string;
  symbol: string;
  color: string;
};

export type CalcPair = {
  slug: string;
  percent: number;
  score: string;
  tagline: string;
  strengths: string[];
  labelA: string;
  labelB: string;
};

export type CalculatorData = {
  signs: CalcSign[];
  pairs: Record<string, CalcPair>;
};

export function buildCalculatorData(
  locale: "ka" | "en" | "am" = "ka",
): CalculatorData {
  const en = locale === "en";
  const am = locale === "am";
  const signs: CalcSign[] = ALL_SLUGS.map((slug) => {
    const meta = signMetaBySlug(slug);
    const c = SIGNS_CONTENT[slug];
    return {
      slug,
      label: am
        ? (meta?.labelAm ?? slug)
        : en
          ? (meta?.labelEn ?? slug)
          : c.labelKa,
      symbol: c.symbol,
      color: meta ? signColor(meta) : "var(--vivida-violet)",
    };
  });

  const pairs: Record<string, CalcPair> = {};
  if (PAIRS_CONTENT) {
    for (const [slug, c] of Object.entries(PAIRS_CONTENT)) {
      const percent = pairPercent(slug, c.overallScore);
      const [aSlug, bSlug] = slug.split("-") as [ZodiacSlug, ZodiacSlug];
      const enContent = en ? zodiacPairEnglish(aSlug, bSlug) : null;
      const amContent = am ? zodiacPairArmenian(aSlug, bSlug) : null;
      const score = am
        ? SCORE_AM[c.overallScore]
        : en
          ? SCORE_EN[c.overallScore]
          : c.overallScore;

      pairs[slug] = {
        slug,
        percent,
        score,
        tagline: amContent
          ? amContent.tagline
          : enContent
            ? enContent.tagline
            : c.tagline,
        strengths: amContent
          ? amContent.strengths.slice(0, 3)
          : enContent
            ? enContent.strengths.slice(0, 3)
            : c.strengths.slice(0, 3),
        labelA: am
          ? (signMetaBySlug(aSlug)?.labelAm ?? c.labelA)
          : en
            ? (signMetaBySlug(aSlug)?.labelEn ?? c.labelA)
            : c.labelA,
        labelB: am
          ? (signMetaBySlug(bSlug)?.labelAm ?? c.labelB)
          : en
            ? (signMetaBySlug(bSlug)?.labelEn ?? c.labelB)
            : c.labelB,
      };
    }
  }

  return { signs, pairs };
}
