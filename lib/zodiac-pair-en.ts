import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type ZodiacPairEn = {
  title: string;
  description: string;
  rating: string;
  scoreLabel: string;
  tagline: string;
  overall: string;
  intro: string[];
  love: string;
  friendship: string;
  communication: string[];
  trust: string[];
  verdict: string;
  strengths: string[];
  challenges: string[];
  advice: string;
  faq: Array<{ q: string; a: string }>;
};

export function zodiacPairEnglish(a: ZodiacSlug, b: ZodiacSlug): ZodiacPairEn {
  const ma = signMetaBySlug(a);
  const mb = signMetaBySlug(b);
  const nameA = ma?.labelEn ?? a;
  const nameB = mb?.labelEn ?? b;
  const sameEl = ma?.elementEn === mb?.elementEn;
  const rating = sameEl ? "Strong" : "Harmonious";
  const overall = `When ${nameA} and ${nameB} connect, their ${ma?.elementEn?.toLowerCase() ?? "elemental"} and ${mb?.elementEn?.toLowerCase() ?? "elemental"} temperaments create an engaging interplay of strengths.`;
  const love = `In romance, ${nameA} and ${nameB} balance personal expression with mutual care and shared curiosity.`;
  const friendship = `As friends, ${nameA} and ${nameB} offer steady encouragement, candid perspective, and lasting loyalty.`;
  const advice = `Give both ${nameA} and ${nameB} room to express their natural style while keeping communication direct and warm.`;

  return {
    title: `${nameA} and ${nameB} Compatibility: Love, Friendship and Synastry`,
    description: `Explore ${nameA} and ${nameB} compatibility in love, communication, emotional rhythm, and long-term partnership.`,
    rating,
    scoreLabel: rating,
    tagline: `${nameA} and ${nameB} bring together ${ma?.elementEn ?? "Fire"} and ${mb?.elementEn ?? "Air"} perspectives in a dynamic, growth-oriented bond.`,
    overall,
    intro: [overall],
    love,
    friendship,
    communication: [
      `Open dialogue helps ${nameA} and ${nameB} translate their natural rhythms into lasting understanding.`,
    ],
    trust: [
      `Shared values and consistent follow-through build a resilient foundation between ${nameA} and ${nameB}.`,
    ],
    verdict: advice,
    strengths: [
      "Complementary perspectives that spark growth",
      "Strong mutual curiosity and emotional honesty",
      "Resilience when working toward shared goals",
    ],
    challenges: [
      "Different pacing when processing emotions",
      "Balancing independence with togetherness",
    ],
    advice,
    faq: [
      {
        q: `Are ${nameA} and ${nameB} compatible?`,
        a: `${nameA} and ${nameB} have a ${rating.toLowerCase()} connection that thrives on honest communication and full-chart synastry.`,
      },
    ],
  };
}
