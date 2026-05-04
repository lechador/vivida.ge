/**
 * Synastry: compatibility scoring between two natal charts.
 *
 * For each pair of bodies (one from each chart), we look for major
 * aspects and award points to one or more "category" buckets — love,
 * friendship, communication, growth, chemistry. Higher orb tightness +
 * harmonious aspects + personally-relevant body pairs all push a
 * category's score up.
 *
 * Scores are normalised into a friendly 0–100 percentage via tanh so
 * extreme values are bounded — most pairs land in the 35–85% range.
 */

import { ASPECTS, angularDistance, type AspectKind } from "./aspects";
import type { NatalChartJson } from "@/db/schema";

export type SynastryCategory =
  | "love"
  | "friendship"
  | "communication"
  | "growth"
  | "chemistry";

export const CATEGORIES: SynastryCategory[] = [
  "love",
  "friendship",
  "communication",
  "growth",
  "chemistry",
];

/** Bodies that "matter" for each category. An aspect counts toward the
 *  category iff both endpoints live in its set. */
const CATEGORY_BODIES: Record<SynastryCategory, Set<string>> = {
  love: new Set(["sun", "moon", "venus", "mars", "ascendant"]),
  friendship: new Set(["sun", "moon", "mercury", "jupiter", "ascendant"]),
  communication: new Set(["mercury", "sun", "mars", "jupiter", "moon"]),
  growth: new Set(["jupiter", "saturn", "sun", "moon", "midheaven"]),
  chemistry: new Set(["mars", "pluto", "venus", "sun", "moon"]),
};

/** Per-aspect "valence" — how much positive (or negative) signal it carries.
 *  Squares and oppositions still create connection (often passionate), so
 *  we score them mildly negative rather than zeroing them out. */
const ASPECT_VALENCE: Record<AspectKind, number> = {
  conjunction: 0.85,
  trine: 1.0,
  sextile: 0.65,
  square: -0.25,
  opposition: -0.15,
};

/** Big-three weighting — Sun, Moon, and Ascendant carry the most personal
 *  signal. Asteroid-style points (Chiron etc.) get half weight. */
const BODY_WEIGHT: Record<string, number> = {
  sun: 1.4,
  moon: 1.4,
  ascendant: 1.3,
  venus: 1.1,
  mars: 1.1,
  mercury: 1.0,
  jupiter: 0.9,
  saturn: 0.8,
  uranus: 0.7,
  neptune: 0.7,
  pluto: 0.7,
  midheaven: 1.0,
  chiron: 0.5,
};

export type SynastryAspect = {
  a: string;
  b: string;
  kind: AspectKind;
  orb: number;
  tightness: number;
};

export type SynastryResult = {
  /** Per-category percentages, 0–100. */
  scores: Record<SynastryCategory, number>;
  /** Weighted overall compatibility, 0–100. */
  overall: number;
  /** Tightest cross-aspects, sorted desc by tightness. */
  topAspects: SynastryAspect[];
};

const CATEGORY_WEIGHT: Record<SynastryCategory, number> = {
  love: 0.25,
  friendship: 0.2,
  chemistry: 0.2,
  communication: 0.2,
  growth: 0.15,
};

/**
 * Compute synastry between two natal charts.
 * Returns category scores, an overall compatibility number, and the
 * tightest aspects so we can show a few "highlights" if we want.
 */
export function computeSynastry(
  a: NatalChartJson,
  b: NatalChartJson
): SynastryResult {
  // Build a flat point set for each chart (bodies + Asc + MC).
  const pointsA: Record<string, { longitude: number }> = {};
  const pointsB: Record<string, { longitude: number }> = {};
  for (const [k, v] of Object.entries(a.bodies))
    pointsA[k] = { longitude: v.longitude };
  for (const [k, v] of Object.entries(b.bodies))
    pointsB[k] = { longitude: v.longitude };
  pointsA.ascendant = { longitude: a.ascendant.longitude };
  pointsA.midheaven = { longitude: a.midheaven.longitude };
  pointsB.ascendant = { longitude: b.ascendant.longitude };
  pointsB.midheaven = { longitude: b.midheaven.longitude };

  // Raw weighted sums per category (un-normalised)
  const raw: Record<SynastryCategory, number> = {
    love: 0,
    friendship: 0,
    communication: 0,
    growth: 0,
    chemistry: 0,
  };

  const aspectsFound: SynastryAspect[] = [];

  for (const [keyA, bodyA] of Object.entries(pointsA)) {
    for (const [keyB, bodyB] of Object.entries(pointsB)) {
      const d = angularDistance(bodyA.longitude, bodyB.longitude);

      // Find the tightest matching aspect for this body pair
      let best: { kind: AspectKind; orb: number; maxOrb: number } | null = null;
      for (const aspect of ASPECTS) {
        const orb = Math.abs(d - aspect.angle);
        if (orb <= aspect.orb && (!best || orb < best.orb)) {
          best = { kind: aspect.kind, orb, maxOrb: aspect.orb };
        }
      }
      if (!best) continue;

      const tightness = 1 - best.orb / best.maxOrb;
      aspectsFound.push({
        a: keyA,
        b: keyB,
        kind: best.kind,
        orb: best.orb,
        tightness,
      });

      const valence = ASPECT_VALENCE[best.kind];
      const bodyMul =
        (BODY_WEIGHT[keyA] ?? 0.6) * (BODY_WEIGHT[keyB] ?? 0.6);

      const contribution = valence * tightness * bodyMul;

      // Add to each category whose body set contains both endpoints
      for (const cat of CATEGORIES) {
        const set = CATEGORY_BODIES[cat];
        if (set.has(keyA) && set.has(keyB)) {
          raw[cat] += contribution;
        }
      }
    }
  }

  // Sigmoid-style normalisation to a 25–95 range so users always see
  // some compatibility. tanh maps any input to [-1, 1].
  const scores = {} as Record<SynastryCategory, number>;
  for (const cat of CATEGORIES) {
    const x = raw[cat];
    const norm = 60 + 30 * Math.tanh(x / 6);
    scores[cat] = Math.max(25, Math.min(95, Math.round(norm)));
  }

  const overall = Math.round(
    CATEGORIES.reduce((sum, c) => sum + scores[c] * CATEGORY_WEIGHT[c], 0)
  );

  return {
    scores,
    overall,
    topAspects: aspectsFound
      .sort((x, y) => y.tightness - x.tightness)
      .slice(0, 8),
  };
}

export const CATEGORY_LABEL_KA: Record<SynastryCategory, string> = {
  love: "სიყვარული",
  friendship: "მეგობრობა",
  communication: "კომუნიკაცია",
  growth: "ერთობლივი ზრდა",
  chemistry: "ქიმია",
};

export const CATEGORY_DESCRIPTOR_KA: Record<SynastryCategory, string> = {
  love: "გრძნობების ენა და ემოციური კავშირი",
  friendship: "ერთად ყოფნის სიამოვნება და ნდობა",
  communication: "სიტყვები, აზრები, რომლებიც ერთმანეთს ხვდებიან",
  growth: "გრძელვადიანი ზრდის და სწავლის პოტენციალი",
  chemistry: "ფიზიკური მიზიდულობა და მძაფრი ენერგია",
};

export const CATEGORY_EMOJI: Record<SynastryCategory, string> = {
  love: "💞",
  friendship: "🤝",
  communication: "💬",
  growth: "🌱",
  chemistry: "🔥",
};

/** Human-friendly verdict for an overall percentage. */
export function overallVerdict(percent: number): string {
  if (percent >= 85) return "ციური ბმა";
  if (percent >= 75) return "ძლიერი თავსებადობა";
  if (percent >= 65) return "ბუნებრივი ნაკადი";
  if (percent >= 55) return "კარგი პოტენციალი";
  if (percent >= 45) return "ცოცხალი დინამიკა";
  return "გამოწვევა, რომელშიც ზრდაა";
}
