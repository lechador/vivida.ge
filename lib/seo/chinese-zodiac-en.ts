import { CHINESE_ANIMALS } from "@/lib/seo/chinese-zodiac";

export type ChineseAnimalContentEn = {
  slug: string;
  headline: string;
  intro: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  love: string;
  career: string;
  compatible: string[];
  challenging: string[];
};

const CONTENT_BY_SLUG: Record<string, ChineseAnimalContentEn> = Object.fromEntries(
  CHINESE_ANIMALS.map((animal, idx) => {
    const comp1 = CHINESE_ANIMALS[(idx + 4) % 12].slug;
    const comp2 = CHINESE_ANIMALS[(idx + 8) % 12].slug;
    const chal1 = CHINESE_ANIMALS[(idx + 6) % 12].slug;
    const chal2 = CHINESE_ANIMALS[(idx + 3) % 12].slug;
    return [
      animal.slug,
      {
        slug: animal.slug,
        headline: `Quick-minded, observant, and grounded in ${animal.elementEn} energy`,
        intro: `In the twelve-year Chinese zodiac cycle, the ${animal.nameEn} represents a distinct approach to timing, relationships, and resourcefulness. Associated with the ${animal.elementEn} element and ${animal.polarityEn} polarity, this sign combines practical awareness with enduring character.`,
        personality: `People born in the Year of the ${animal.nameEn} are traditionally described as attentive, purposeful, and resilient. They notice subtle shifts in their environment and prefer meaningful progress over empty display.`,
        strengths: [
          "Adaptable and observant under pressure",
          "Loyal to trusted friends and family",
          "Resourceful problem-solving style",
        ],
        challenges: [
          "Taking on too much responsibility alone",
          "Hesitating to share vulnerability early",
          "Impatience when plans lack structure",
        ],
        love: `In relationships, the ${animal.nameEn} values sincerity, emotional reliability, and mutual respect. Trust deepens when both partners honor each other's independence and shared commitments.`,
        career: `At work, the ${animal.nameEn} thrives where clear goals meet room for initiative. Strategic planning, research, leadership, and creative craftsmanship all suit this archetype.`,
        compatible: [comp1, comp2],
        challenging: [chal1, chal2],
      },
    ];
  }),
);

export function chineseZodiacContentEnBySlug(
  slug: string,
): ChineseAnimalContentEn | undefined {
  return CONTENT_BY_SLUG[slug];
}
