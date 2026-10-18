import type {
  ChartElement,
  SynastryAspect,
  SynastryCategory,
} from "@/lib/synastry";

export const CATEGORY_LABEL_EN: Record<SynastryCategory, string> = {
  love: "Love & Romance",
  friendship: "Friendship",
  communication: "Communication",
  growth: "Shared Growth",
  chemistry: "Attraction & Chemistry",
  business: "Shared Goals",
};

export const CATEGORY_DESCRIPTOR_EN: Record<SynastryCategory, string> = {
  love: "Emotional warmth and romantic closeness",
  friendship: "Shared ease, humor, and companionship",
  communication: "How naturally thoughts and feelings translate",
  growth: "Long-term encouragement and resilience",
  chemistry: "Magnetic spark and physical energy",
  business: "Practical teamwork and reliability",
};

export const ELEMENT_LABEL_EN: Record<ChartElement, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};

export const ELEMENT_EMOJI_EN: Record<ChartElement, string> = {
  fire: "🔥",
  earth: "🌿",
  air: "💨",
  water: "🌊",
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
  ascendant: "Ascendant",
};

export const ASPECT_LABEL_EN: Record<string, string> = {
  conjunction: "conjunct",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposite",
};

export const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export const HOUSE_LABEL_EN: Record<number, string> = {
  1: "1st House",
  2: "2nd House",
  3: "3rd House",
  4: "4th House",
  5: "5th House",
  6: "6th House",
  7: "7th House",
  8: "8th House",
  9: "9th House",
  10: "10th House",
  11: "11th House",
  12: "12th House",
};

export function aspectTone(
  kind: string,
): "harmonious" | "tense" | "neutral" {
  if (kind === "trine" || kind === "sextile") return "harmonious";
  if (kind === "square" || kind === "opposition") return "tense";
  return "neutral";
}

export function overallVerdictEn(score: number): string {
  if (score >= 85) return "Deep Cosmic Resonance";
  if (score >= 75) return "Strong & Magnetic Bond";
  if (score >= 65) return "Supportive & Balanced Match";
  return "Dynamic Growth Connection";
}

export function overallNarrativeEn(score: number): string {
  return `With an overall alignment of ${score}%, your charts combine natural rapport with meaningful opportunities for mutual growth.`;
}

export function categoryNarrativeEn(
  category: SynastryCategory,
  score: number,
): string {
  return `${CATEGORY_LABEL_EN[category]} scores ${score}%, reflecting steady synergy and responsive interaction between your charts.`;
}

export function describeAspectEn(aspect: SynastryAspect): string {
  const a = BODY_LABEL_EN[aspect.a] ?? aspect.a;
  const b = BODY_LABEL_EN[aspect.b] ?? aspect.b;
  const asp = ASPECT_LABEL_EN[aspect.kind] ?? aspect.kind;
  return `${a} ${asp} ${b} creates a vivid point of contact between your charts, shaping how you respond to each other.`;
}

export function describeOverlayEn(body: string, house: number): string {
  const b = BODY_LABEL_EN[body] ?? body;
  const h = HOUSE_LABEL_EN[house] ?? `House ${house}`;
  return `${b} in the ${h} brings active attention and personal warmth to the themes of this life area.`;
}
