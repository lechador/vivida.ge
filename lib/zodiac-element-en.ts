import type { ElementSlug } from "@/lib/seo/zodiac-dates";
import { ELEMENTS_CONTENT_EN, type ElementContentEn } from "@/lib/seo/zodiac-content-en";

export type ZodiacElementEnglish = {
  name: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  love: string;
  career: string;
  compatibility: string;
  faq?: Array<{ q: string; a: string }>;
};

function getElementEnglish(slug: ElementSlug): ZodiacElementEnglish {
  const el: ElementContentEn | undefined = ELEMENTS_CONTENT_EN[slug];
  const nameMap: Record<ElementSlug, string> = {
    fire: "Fire signs",
    earth: "Earth signs",
    air: "Air signs",
    water: "Water signs",
  };

  if (el) {
    return {
      name: nameMap[slug],
      tagline: el.tagline,
      intro: el.intro,
      personality: el.personality,
      strengths: el.strengths || [],
      challenges: el.weaknesses || [],
      love: el.love,
      career: el.career,
      compatibility: el.compatibility,
      faq: el.faq || [],
    };
  }

  return {
    name: nameMap[slug],
    tagline: `${slug} element traits`,
    intro: `${slug} element guide`,
    personality: `${slug} personality`,
    strengths: [],
    challenges: [],
    love: "",
    career: "",
    compatibility: "",
    faq: [],
  };
}

export const ELEMENT_ENGLISH: Record<ElementSlug, ZodiacElementEnglish> = {
  fire: getElementEnglish("fire"),
  earth: getElementEnglish("earth"),
  air: getElementEnglish("air"),
  water: getElementEnglish("water"),
};
