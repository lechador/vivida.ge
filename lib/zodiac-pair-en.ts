import { pairSlug, signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { PAIRS_CONTENT_EN, type PairContentEn } from "@/lib/seo/zodiac-content-en";

export type PairRating = "Strong" | "Harmonious" | "Challenging" | "Natural flow" | "Growth-oriented" | "Powerful mirror";

export type ZodiacPairEnglish = {
  title: string;
  description: string;
  tagline: string;
  rating: PairRating;
  overall: string;
  love: string;
  friendship: string;
  communication: string;
  strengths: string[];
  challenges: string[];
  verdict: string;
  faq: Array<{ q: string; a: string }>;
};

export function zodiacPairEnglish(a: ZodiacSlug, b: ZodiacSlug): ZodiacPairEnglish {
  const aMeta = signMetaBySlug(a)!;
  const bMeta = signMetaBySlug(b)!;
  const aName = aMeta.labelEn;
  const bName = bMeta.labelEn;
  const slug = pairSlug(a, b);
  const pair: PairContentEn | undefined = PAIRS_CONTENT_EN[slug];

  if (pair) {
    const rawRating = String(pair.overallScore || "Harmonious");
    const rating: PairRating =
      rawRating === "ძლიერი" || rawRating === "Strong"
        ? "Strong"
        : rawRating === "ჰარმონიული" || rawRating === "Harmonious"
          ? "Harmonious"
          : "Challenging";

    const defaultFaq = [
      {
        q: `Are ${aName} and ${bName} compatible?`,
        a: pair.verdict || `${aName} and ${bName} can build a meaningful relationship when they respect each other's differences.`,
      },
      {
        q: `How do ${aName} and ${bName} connect in love?`,
        a: pair.love || `${aName} and ${bName} explore love through their respective Air/Water/Fire/Earth styles.`,
      },
      {
        q: `What is the main challenge between ${aName} and ${bName}?`,
        a: (pair.challenges && pair.challenges[0]) || `Navigating different emotional and conversational rhythms requires patience and clarity.`,
      },
      {
        q: "Can Sun signs alone determine relationship outcome?",
        a: "No. While Sun signs offer a valuable archetypal baseline, deep compatibility is shaped by Moon signs, Venus, Mars, Ascendants, houses, and mutual commitment.",
      },
    ];

    return {
      title: pair.pageTitle || `${aName} and ${bName} Compatibility: Love, Friendship and Communication`,
      description: pair.metaDescription || `${aName} and ${bName} compatibility in love, friendship, and communication.`,
      tagline: pair.tagline || `${aName} × ${bName} relationship dynamic`,
      rating,
      overall: pair.overall,
      love: pair.love,
      friendship: pair.friendship,
      communication: pair.communication,
      strengths: pair.strengths || [],
      challenges: pair.challenges || [],
      verdict: pair.verdict,
      faq: pair.faq && pair.faq.length >= 3 ? pair.faq : defaultFaq,
    };
  }

  // Fallback
  return {
    title: `${aName} and ${bName} Compatibility: Love, Friendship and Communication`,
    description: `${aName} and ${bName} compatibility in love, friendship, and communication.`,
    tagline: `${aName} × ${bName}`,
    rating: "Harmonious",
    overall: `${aName} and ${bName} dynamic.`,
    love: `Love between ${aName} and ${bName}.`,
    friendship: `Friendship between ${aName} and ${bName}.`,
    communication: `Communication between ${aName} and ${bName}.`,
    strengths: [],
    challenges: [],
    verdict: `Verdict for ${aName} and ${bName}.`,
    faq: [],
  };
}
