import {
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import {
  COMPATIBILITY_EN,
  ELEMENT_EN,
  ZODIAC_SIGN_EN,
} from "@/lib/zodiac-sign-en";

export type PlacementKind = "moon" | "rising";

export type PlacementEnglish = {
  title: string;
  description: string;
  tagline: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
};

export function placementEnglish(
  kind: PlacementKind,
  sign: ZodiacSlug,
): PlacementEnglish {
  const meta = signMetaBySlug(sign)!;
  const profile = ZODIAC_SIGN_EN[sign];
  const name = meta.labelEn;
  const element = ELEMENT_EN[meta.element].toLowerCase();
  const compatible = COMPATIBILITY_EN[sign]
    .slice(0, 3)
    .map((slug) => signMetaBySlug(slug)!.labelEn)
    .join(", ");

  if (kind === "moon") {
    return {
      title: `Moon in ${name}: Meaning, Emotional Traits and Love`,
      description: `Discover what a ${name} Moon means for emotions, inner needs, relationships, challenges, and Moon-sign compatibility.`,
      tagline: `An inner world guided by ${profile.tagline.toLowerCase()}`,
      intro: `Your Moon sign describes instinctive reactions, emotional needs, and the private self that appears when you feel safe. With the Moon in ${name}, those needs take on this sign's ${element} style. ${profile.core}`,
      sections: [
        {
          title: "Emotional core",
          body: `A ${name} Moon tends to feel most secure when it can express ${profile.strengths.slice(0, 2).join(" and ").toLowerCase()}. Feelings are processed through the ${element} element, so emotional balance grows when instinct is given a practical, honest outlet rather than ignored.`,
        },
        {
          title: `Moon in ${name} in love`,
          body: `${profile.love} As a Moon placement, this describes what creates emotional safety behind the visible chemistry of a relationship.`,
        },
        {
          title: "Shadow patterns and growth",
          body: `Under stress, this Moon may struggle with ${profile.challenges.slice(0, 2).join(" and ").toLowerCase()}. Growth comes from treating these reactions as signals rather than fixed identity, then asking directly for the reassurance, space, or connection that is actually needed.`,
        },
        {
          title: "Moon-sign compatibility",
          body: `${name} Moon often finds an easy emotional rhythm with ${compatible}, although no single placement decides compatibility. Venus, Mars, the Ascendant, house overlays, and aspects between two full charts can strengthen or complicate the bond.`,
        },
      ],
    };
  }

  return {
    title: `${name} Rising: Ascendant Meaning and First Impressions`,
    description: `Discover the meaning of ${name} rising: first impressions, outward style, approach to life, strengths, challenges, and relationships.`,
    tagline: `A first impression shaped by ${profile.tagline.toLowerCase()}`,
    intro: `The rising sign, or Ascendant, is the zodiac sign that was appearing on the eastern horizon at the moment of birth. It describes your entry point into life: how you meet new situations, the energy others notice first, and the style through which the rest of your chart is expressed. With ${name} rising, that outer approach carries a distinctly ${element} quality.`,
    sections: [
      {
        title: "First impression",
        body: `${name} rising can initially appear ${profile.strengths.slice(0, 3).join(", ").toLowerCase()}. These qualities often show before people discover the more private Moon sign or the central motivations of the Sun sign.`,
      },
      {
        title: "Appearance and personal style",
        body: `Astrology does not prescribe one body type, but ${name} rising often creates a recognizable social presence. Its ${element} element can influence pace, expression, posture, and aesthetic choices, while the condition of the chart ruler adds the more personal details.`,
      },
      {
        title: "Approach to life",
        body: `${profile.core} As an Ascendant, this pattern becomes a strategy for navigating unfamiliar people, choices, and environments. The longer-term task is to use its strengths consciously without becoming trapped by the first response.`,
      },
      {
        title: "Relationships and complementary energy",
        body: `${name} rising often connects naturally with the qualities represented by ${compatible}. Yet rising-sign chemistry is only one layer: the Descendant, its ruler, Venus, Mars, and contacts between both birth charts give a much fuller relationship picture.`,
      },
    ],
  };
}

