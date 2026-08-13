import type {
  ChartElement,
  SynastryAspect,
  SynastryCategory,
} from "@/lib/synastry";

export const CATEGORY_LABEL_EN: Record<SynastryCategory, string> = {
  love: "Love",
  friendship: "Friendship",
  communication: "Communication",
  growth: "Growth",
  chemistry: "Chemistry",
  business: "Working together",
};

export const CATEGORY_DESCRIPTOR_EN: Record<SynastryCategory, string> = {
  love: "Emotional connection and the way you give affection",
  friendship: "Trust, ease, and the pleasure of spending time together",
  communication: "How naturally your ideas and words meet",
  growth: "Your potential to learn and evolve together",
  chemistry: "Physical attraction and intensity",
  business: "Shared goals, structure, and collaboration",
};

export const BODY_LABEL_EN: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  chiron: "Chiron",
  ascendant: "Ascendant",
  midheaven: "Midheaven",
};

export const ASPECT_LABEL_EN: Record<string, string> = {
  conjunction: "conjunction",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposition",
};

export const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export const ELEMENT_LABEL_EN: Record<ChartElement, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};

export const ELEMENT_EMOJI_EN: Record<ChartElement, string> = {
  fire: "🔥",
  earth: "🪨",
  air: "🌬️",
  water: "💧",
};

export const HOUSE_LABEL_EN: Record<number, string> = {
  1: "1st house · identity",
  2: "2nd house · values",
  3: "3rd house · communication",
  4: "4th house · home and roots",
  5: "5th house · romance and creativity",
  6: "6th house · daily life",
  7: "7th house · partnership",
  8: "8th house · intimacy and transformation",
  9: "9th house · horizons and beliefs",
  10: "10th house · direction and reputation",
  11: "11th house · friendship and dreams",
  12: "12th house · inner world",
};

export function overallVerdictEn(percent: number): string {
  if (percent >= 88) return "Exceptional bond";
  if (percent >= 78) return "Strong compatibility";
  if (percent >= 66) return "Natural flow";
  if (percent >= 55) return "Promising potential";
  if (percent >= 43) return "A dynamic connection";
  if (percent >= 30) return "A challenge with room to grow";
  return "A high-friction connection";
}

export function overallNarrativeEn(percent: number): string {
  if (percent >= 78)
    return "Your charts show several points of natural recognition. The connection can feel easy without becoming passive.";
  if (percent >= 55)
    return "There is meaningful common ground here, alongside differences that keep the relationship active and evolving.";
  if (percent >= 43)
    return "This connection mixes ease with friction. Curiosity and honest communication will shape what it becomes.";
  return "Your charts ask for patience and conscious effort. The differences are real, but they can also reveal where each of you grows.";
}

export function categoryNarrativeEn(
  category: SynastryCategory,
  score: number,
): string {
  const subject = CATEGORY_LABEL_EN[category].toLowerCase();
  if (score >= 78)
    return `A clear strength: ${subject} tends to flow naturally between you.`;
  if (score >= 60)
    return `There is solid potential in ${subject}, especially when you stay attentive to each other's style.`;
  if (score >= 43)
    return `${CATEGORY_LABEL_EN[category]} is mixed: some patterns support you, while others need translation and patience.`;
  return `${CATEGORY_LABEL_EN[category]} may require deliberate effort, clear expectations, and room for difference.`;
}

export function aspectTone(
  kind: SynastryAspect["kind"],
): "harmonious" | "tense" | "neutral" {
  if (kind === "trine" || kind === "sextile") return "harmonious";
  if (kind === "square" || kind === "opposition") return "tense";
  return "neutral";
}

export function describeAspectEn(aspect: SynastryAspect): string {
  const left = BODY_LABEL_EN[aspect.a] ?? aspect.a;
  const right = BODY_LABEL_EN[aspect.b] ?? aspect.b;
  const tone = aspectTone(aspect.kind);
  if (tone === "harmonious")
    return `${left} and ${right} support an easy exchange of energy. The tighter the aspect, the more naturally you may notice it.`;
  if (tone === "tense")
    return `${left} and ${right} pull in different directions. This can create friction, but also momentum when the difference is handled consciously.`;
  return `${left} and ${right} are closely linked, amplifying both the ease and complexity of these two parts of your charts.`;
}

export function describeOverlayEn(body: string, house: number): string {
  const bodyName = BODY_LABEL_EN[body] ?? body;
  const houseName = HOUSE_LABEL_EN[house] ?? `${house}th house`;
  return `${bodyName} activates themes of the ${houseName.toLowerCase()}, making this area of life more noticeable in the relationship.`;
}
