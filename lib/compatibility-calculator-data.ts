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
  locale: "ka" | "en" = "ka",
): CalculatorData {
  const en = locale === "en";
  const signs: CalcSign[] = ALL_SLUGS.map((slug) => {
    const meta = signMetaBySlug(slug);
    const c = SIGNS_CONTENT[slug];
    return {
      slug,
      label: en ? (meta?.labelEn ?? slug) : c.labelKa,
      symbol: c.symbol,
      color: meta ? signColor(meta) : "var(--vivida-violet)",
    };
  });

  const pairs: Record<string, CalcPair> = {};
  if (PAIRS_CONTENT) {
    for (const [slug, c] of Object.entries(PAIRS_CONTENT)) {
      const percent = pairPercent(slug, c.overallScore);
      const [aSlug, bSlug] = slug.split("-") as [ZodiacSlug, ZodiacSlug];
      // Every pair previously shared one of three canned taglines and an
      // identical strengths list, so all 78 English results read the same.
      // This is the per-pair copy already used by /zodiac/tavsebadoba/[pair],
      // which is also where the "View full analysis" link goes — so the
      // teaser and the page it opens now agree.
      const enContent = en ? zodiacPairEnglish(aSlug, bSlug) : null;
      pairs[slug] = {
        slug,
        percent,
        score: en ? SCORE_EN[c.overallScore] : c.overallScore,
        tagline: enContent ? enContent.tagline : c.tagline,
        strengths: enContent
          ? enContent.strengths.slice(0, 3)
          : c.strengths.slice(0, 3),
        labelA: en
          ? (signMetaBySlug(aSlug)?.labelEn ?? c.labelA)
          : c.labelA,
        labelB: en
          ? (signMetaBySlug(bSlug)?.labelEn ?? c.labelB)
          : c.labelB,
      };
    }
  }

  return { signs, pairs };
}
