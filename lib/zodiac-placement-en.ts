import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type PlacementKind = "moon" | "rising";

export type PlacementEnContent = {
  title: string;
  description: string;
  tagline: string;
  intro: string;
  sections: Array<{ title: string; heading: string; body: string }>;
  emotionalWorld: string;
  inRelationships: string;
  needsAndComfort: string;
  firstImpressions: string;
  lifePath: string;
  appearanceAndVibe: string;
  strengths: string[];
  challenges: string[];
  famous: string[];
  faq: Array<{ q: string; a: string }>;
};

export function placementEnglish(kind: PlacementKind, sign: ZodiacSlug): PlacementEnContent {
  const meta = signMetaBySlug(sign);
  const name = meta?.labelEn ?? sign;
  const isMoon = kind === "moon";
  const title = isMoon
    ? `Moon in ${name}: Emotional Nature, Needs and Compatibility`
    : `${name} Rising (Ascendant): First Impressions and Chart Ruler`;
  const description = isMoon
    ? `Discover what Moon in ${name} means in your natal chart: emotional instincts, comfort needs, and relationship style.`
    : `Discover what ${name} Rising (Ascendant) means in your birth chart: outward presence, chart ruler ${meta?.rulerEn ?? ""}, and life path.`;

  return {
    title,
    description,
    tagline: isMoon
      ? `Instinctive ${meta?.elementEn?.toLowerCase() ?? ""} sensitivity shaped by ${meta?.rulerEn ?? ""}.`
      : `An outward presence guided by ${name}'s ${meta?.elementEn?.toLowerCase() ?? ""} energy and ruled by ${meta?.rulerEn ?? ""}.`,
    intro: isMoon
      ? `With your Moon in ${name}, your emotional world responds through ${meta?.elementEn?.toLowerCase() ?? "natural"} instincts and ${meta?.modalityEn?.toLowerCase() ?? "steady"} rhythms.`
      : `With ${name} rising on the eastern horizon at your birth, you meet the world with ${meta?.elementEn?.toLowerCase() ?? "distinct"} vitality and ${meta?.rulerEn ?? "planetary"} focus.`,
    sections: [
      {
        title: isMoon ? "Emotional World" : "First Impressions",
        heading: isMoon ? "Emotional World" : "First Impressions",
        body: `Your ${name} placement shapes how you process experiences and connect with your environment.`,
      },
      {
        title: "In Relationships",
        heading: "In Relationships",
        body: `You value authenticity, mutual understanding, and space to be yourself.`,
      },
    ],
    emotionalWorld: `Your inner world is colored by ${name}'s ${meta?.elementEn?.toLowerCase() ?? ""} temperament.`,
    inRelationships: `In close bonds, ${name} brings sincerity, attentiveness, and depth.`,
    needsAndComfort: `You recharge best when your need for ${meta?.elementEn === "Fire" ? "movement and inspiration" : meta?.elementEn === "Earth" ? "stability and calm" : meta?.elementEn === "Air" ? "conversation and space" : "emotional safety and quiet"} is honored.`,
    firstImpressions: `People notice your ${name} poise, curiosity, and authentic presence right away.`,
    lifePath: `Guided by ${meta?.rulerEn ?? "your chart ruler"}, your path unfolds through self-discovery and purposeful action.`,
    appearanceAndVibe: `A ${meta?.modalityEn?.toLowerCase() ?? ""} ${meta?.elementEn?.toLowerCase() ?? ""} aura that feels both grounded and magnetic.`,
    strengths: [
      "Authentic emotional expression",
      "Resilient self-awareness",
      "Warmth and loyalty in close bonds",
    ],
    challenges: [
      "Balancing personal needs with external expectations",
      "Slowing down during high-stress periods",
    ],
    famous: [],
    faq: [
      {
        q: isMoon ? `What does Moon in ${name} mean?` : `What does ${name} Rising mean?`,
        a: isMoon
          ? `Moon in ${name} describes your instinctive emotional nature, inner needs, and how you restore balance.`
          : `${name} Rising describes the sign on the eastern horizon at your birth, shaping your outward presence and house structure.`,
      },
    ],
  };
}
