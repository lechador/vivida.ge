/**
 * Server-side builder for the slim dataset the interactive compatibility
 * calculator ships to the client. The full PAIRS_CONTENT (78 pairs × long
 * prose) is far too heavy to bundle into a client component, so we project
 * it down to just what the calculator renders: a percentage, the category,
 * the tagline, and the top strengths. Call this from a Server Component and
 * pass the result into <CompatibilityCalculator />.
 */

import { PAIRS_CONTENT, SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { pairPercent } from "@/lib/compatibility-score";

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

export function buildCalculatorData(): CalculatorData {
  const signs: CalcSign[] = ALL_SLUGS.map((slug) => {
    const meta = signMetaBySlug(slug);
    const c = SIGNS_CONTENT[slug];
    return {
      slug,
      label: c.labelKa,
      symbol: c.symbol,
      color: meta ? signColor(meta) : "var(--vivida-violet)",
    };
  });

  const pairs: Record<string, CalcPair> = {};
  if (PAIRS_CONTENT) {
    for (const [slug, c] of Object.entries(PAIRS_CONTENT)) {
      pairs[slug] = {
        slug,
        percent: pairPercent(slug, c.overallScore),
        score: c.overallScore,
        tagline: c.tagline,
        strengths: c.strengths.slice(0, 3),
        labelA: c.labelA,
        labelB: c.labelB,
      };
    }
  }

  return { signs, pairs };
}
