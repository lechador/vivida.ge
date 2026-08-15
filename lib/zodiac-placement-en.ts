import {
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { MOONS_CONTENT_EN, RISINGS_CONTENT_EN } from "@/lib/seo/zodiac-content-en";

export type PlacementKind = "moon" | "rising";

export type PlacementEnglish = {
  title: string;
  description: string;
  tagline: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  famous?: string[];
  faq?: Array<{ q: string; a: string }>;
};

export function placementEnglish(
  kind: PlacementKind,
  sign: ZodiacSlug,
): PlacementEnglish {
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelEn;

  if (kind === "moon") {
    const moon = MOONS_CONTENT_EN[sign];
    if (moon) {
      return {
        title: moon.pageTitle || `Moon in ${name}: Meaning, Emotional Traits and Love`,
        description: moon.metaDescription || `Discover what a ${name} Moon means for emotions, inner needs, relationships, challenges, and Moon-sign compatibility.`,
        tagline: moon.tagline,
        intro: moon.intro,
        sections: [
          {
            title: "Emotional core",
            body: moon.emotionalCore,
          },
          {
            title: `Moon in ${name} in love`,
            body: moon.love,
          },
          {
            title: "Shadow patterns and challenges",
            body: moon.shadow,
          },
          {
            title: "Moon-sign compatibility",
            body: moon.compatibility,
          },
        ],
        famous: moon.famous,
        faq: moon.faq,
      };
    }
  }

  const rising = RISINGS_CONTENT_EN[sign];
  if (rising) {
    return {
      title: rising.pageTitle || `${name} Rising: Ascendant Meaning and First Impressions`,
      description: rising.metaDescription || `Discover the meaning of ${name} rising: first impressions, outward style, approach to life, strengths, challenges, and relationships.`,
      tagline: rising.tagline,
      intro: rising.intro,
      sections: [
        {
          title: "First impression",
          body: rising.firstImpression,
        },
        {
          title: "Appearance and personal style",
          body: rising.appearance,
        },
        {
          title: "Approach to life",
          body: rising.approach,
        },
        {
          title: "Relationships and complementary energy",
          body: rising.bestPaired,
        },
      ],
      famous: rising.famous,
      faq: rising.faq,
    };
  }

  // Fallback
  return {
    title: `${name} ${kind === "moon" ? "Moon" : "Rising"}`,
    description: `${name} ${kind} interpretation`,
    tagline: `${name} ${kind}`,
    intro: `${name} ${kind} guide.`,
    sections: [],
  };
}
