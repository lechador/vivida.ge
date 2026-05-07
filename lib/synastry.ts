/**
 * Synastry: compatibility scoring between two natal charts.
 *
 * Score components (in order of impact):
 *
 *   1. Cross-aspects — for every pair of bodies (one from each chart) we
 *      look for the tightest major aspect within tolerance and award
 *      `valence * tightness^1.5 * bodyMul` to each category whose body
 *      set contains both endpoints. The 1.5 exponent on tightness biases
 *      toward exact aspects so a 0.5° conjunction outweighs a 5° one.
 *
 *   2. Pair magnifiers — specific body pairs (Sun-Moon, Venus-Mars,
 *      Mercury-Mercury …) carry extra romantic / friendship weight on
 *      top of their bodyMul, mirroring how astrologers actually read
 *      synastry instead of treating every pair the same.
 *
 *   3. House overlays — where person A's planets fall in person B's
 *      house system (and vice versa). Venus in someone's 5th/7th, Mars
 *      in their 8th, Sun in their 1st, etc. This is a major synastry
 *      technique that aspect-only scoring misses entirely.
 *
 *   4. Element compatibility — Sun and Moon elements (Fire/Earth/Air/
 *      Water) interacting along classical affinity rules. Small bias,
 *      but noticeable when the rest of the chart is borderline.
 *
 * Scores are normalised through tanh so the spread is realistic
 * (typical pairs ~30–88%, exceptional ~92+, friction-heavy ~25–35%).
 */

import { ASPECTS, angularDistance, type AspectKind } from "./aspects";
import type { HouseJson, NatalChartJson } from "@/db/schema";

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
 *  Squares and oppositions are real friction, not just "passion lite" —
 *  scored honestly negative so a chart full of hard aspects can drag the
 *  number into the 20s the way it should. */
const ASPECT_VALENCE: Record<AspectKind, number> = {
  conjunction: 0.85,
  trine: 1.0,
  sextile: 0.65,
  square: -0.55,
  opposition: -0.45,
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

/**
 * Pair-specific magnifiers — applied on top of bodyMul. Keys are sorted
 * `"a-b"` strings so the lookup is order-independent. These boost the
 * archetypal "synastry signature" pairs that astrologers weight heavily.
 */
const PAIR_MAGNIFIER: Record<string, number> = {
  // Sun ↔ Moon: identity meets feeling. The single most-cited synastry
  // contact for long-term resonance.
  "moon-sun": 1.55,
  "moon-moon": 1.4,
  "sun-sun": 1.25,
  // Venus ↔ Mars: classical chemistry axis.
  "mars-venus": 1.6,
  "venus-venus": 1.3,
  "mars-mars": 1.2,
  // Mercury ↔ Mercury / Sun: mental wavelength.
  "mercury-mercury": 1.35,
  "mercury-sun": 1.15,
  "mercury-moon": 1.15,
  // Saturn anchors: stabilising / karmic, weighty when present.
  "saturn-sun": 1.3,
  "saturn-moon": 1.3,
  "saturn-venus": 1.25,
  // Ascendant contacts: instant attraction.
  "ascendant-sun": 1.3,
  "ascendant-moon": 1.3,
  "ascendant-venus": 1.25,
  "ascendant-mars": 1.25,
  // Jupiter: the great expansive blessing.
  "jupiter-sun": 1.2,
  "jupiter-moon": 1.2,
  "jupiter-venus": 1.2,
};

/**
 * House overlay scoring: when a body from chart A falls into a house in
 * chart B, the relationship picks up that house's signature. Both
 * positive AND negative — overlays into the 6th and 12th houses are
 * real friction astrologically (service-mode / hidden) and their absence
 * shouldn't be scored as neutral.
 */
const HOUSE_OVERLAY: Record<
  number,
  Partial<Record<SynastryCategory, number>>
> = {
  1: { love: 0.25, chemistry: 0.2, friendship: 0.18 }, // identity / attraction
  3: { communication: 0.25, friendship: 0.12 },
  4: { love: 0.18, friendship: 0.12, growth: 0.12 }, // home / roots
  5: { love: 0.3, chemistry: 0.28, friendship: 0.12 }, // romance / play
  6: { love: -0.2, chemistry: -0.15 }, // service / work-mode (cold for romance)
  7: { love: 0.35, friendship: 0.22, communication: 0.18 }, // partnership
  8: { love: 0.22, chemistry: 0.35, growth: 0.22 }, // intimacy / transformation
  9: { growth: 0.25, friendship: 0.15, communication: 0.12 }, // shared horizons
  10: { growth: 0.22, friendship: -0.08 }, // public-facing, less buddy
  11: { friendship: 0.32, growth: 0.15, communication: 0.18 }, // friendship / dreams
  12: { love: -0.1, friendship: -0.18, communication: -0.22 }, // hidden / isolating
};

/** Bodies whose house-overlay placement we score. We don't bother with
 *  asteroids or outers in less-personal houses — keeps the signal-to-
 *  noise ratio high. */
const OVERLAY_BODY_WEIGHT: Record<string, number> = {
  sun: 1.4,
  moon: 1.3,
  venus: 1.2,
  mars: 1.1,
  mercury: 0.9,
  jupiter: 0.85,
  saturn: 0.85,
  ascendant: 1.0,
};

/** Elemental affinity between the two Suns (and Moons). Classical:
 *  same element resonates, fire+air and earth+water flow, cross-pairs
 *  friction. Friction values are now substantial (-0.4 ish) so an
 *  Aries × Cancer pair really does feel the elemental clash in the
 *  number, instead of the imbalance being papered over by other
 *  positives. */
const ELEMENT_AFFINITY: Record<string, Record<string, number>> = {
  fire: { fire: 0.5, air: 0.7, earth: -0.45, water: -0.3 },
  earth: { earth: 0.5, water: 0.7, fire: -0.45, air: -0.3 },
  air: { air: 0.5, fire: 0.7, water: -0.3, earth: -0.45 },
  water: { water: 0.5, earth: 0.7, air: -0.45, fire: -0.3 },
};

const ELEMENT_BY_SIGN: Array<"fire" | "earth" | "air" | "water"> = [
  "fire", "earth", "air", "water",
  "fire", "earth", "air", "water",
  "fire", "earth", "air", "water",
];

export type ChartElement = "fire" | "earth" | "air" | "water";

export type SynastryAspect = {
  a: string;
  b: string;
  kind: AspectKind;
  orb: number;
  tightness: number;
};

export type SynastryHouseOverlay = {
  /** Whose body it is — "a" or "b". */
  source: "a" | "b";
  body: string;
  /** Which house in the other chart. */
  house: number;
};

export type SynastryBreakdown = {
  /** Sum of cross-aspect contribution across all categories. */
  aspectPoints: number;
  /** Sum of house-overlay contribution across all categories. */
  housePoints: number;
  /** Element-affinity contribution (Sun + Moon). */
  elementPoints: number;
  /** Up to four most-impactful overlays for storytelling. */
  topOverlays: SynastryHouseOverlay[];
};

export type SynastryResult = {
  /** Per-category percentages, 0–100. */
  scores: Record<SynastryCategory, number>;
  /** Weighted overall compatibility, 0–100. */
  overall: number;
  /** Tightest cross-aspects, sorted desc by tightness. */
  topAspects: SynastryAspect[];
  /** Sun + Moon elements per chart so the UI can show "🔥 Fire ↔ 💨 Air". */
  elements: {
    sunA: ChartElement;
    sunB: ChartElement;
    moonA: ChartElement;
    moonB: ChartElement;
  };
  /** Score breakdown so the UI can show "what made this number". */
  breakdown: SynastryBreakdown;
};

const CATEGORY_WEIGHT: Record<SynastryCategory, number> = {
  love: 0.25,
  friendship: 0.2,
  chemistry: 0.2,
  communication: 0.2,
  growth: 0.15,
};

/** Sorted lookup key for pair magnifier table. */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

/** Smaller of the two arcs between two longitudes; signed-positive 0–360. */
function normLng(lng: number): number {
  return ((lng % 360) + 360) % 360;
}

/** Find the house number a longitude falls into, given the 12 cusps. */
function houseOf(longitude: number, houses: HouseJson[]): number | null {
  if (!houses || houses.length < 12) return null;
  // Houses are 1–12 in order; iterate and check whether `longitude` lands
  // in the arc between cusp[i] and cusp[i+1] (wrap-aware).
  const sorted = [...houses].sort((a, b) => a.number - b.number);
  const lng = normLng(longitude);
  for (let i = 0; i < 12; i++) {
    const start = normLng(sorted[i].cuspLongitude);
    const end = normLng(sorted[(i + 1) % 12].cuspLongitude);
    const inside =
      start < end ? lng >= start && lng < end : lng >= start || lng < end;
    if (inside) return sorted[i].number;
  }
  return null;
}

/**
 * Compute synastry between two natal charts.
 * Returns category scores, an overall compatibility number, the tightest
 * aspects, and a breakdown so the UI can explain how the number was built.
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

  const raw: Record<SynastryCategory, number> = {
    love: 0, friendship: 0, communication: 0, growth: 0, chemistry: 0,
  };

  let aspectPoints = 0;
  let housePoints = 0;
  let elementPoints = 0;

  const aspectsFound: SynastryAspect[] = [];

  // ── 1. Cross-aspect contribution ──────────────────────────────────
  for (const [keyA, bodyA] of Object.entries(pointsA)) {
    for (const [keyB, bodyB] of Object.entries(pointsB)) {
      const d = angularDistance(bodyA.longitude, bodyB.longitude);

      let best: { kind: AspectKind; orb: number; maxOrb: number } | null = null;
      for (const aspect of ASPECTS) {
        const orb = Math.abs(d - aspect.angle);
        if (orb <= aspect.orb && (!best || orb < best.orb)) {
          best = { kind: aspect.kind, orb, maxOrb: aspect.orb };
        }
      }
      if (!best) continue;

      const tightnessLinear = 1 - best.orb / best.maxOrb;
      // Bias toward exact aspects: 0.5° aspect ≈ tightness 0.93,
      // 4° aspect ≈ tightness 0.42 (vs. 0.5 linearly).
      const tightness = Math.pow(tightnessLinear, 1.5);
      aspectsFound.push({
        a: keyA, b: keyB, kind: best.kind, orb: best.orb,
        tightness: tightnessLinear,
      });

      const valence = ASPECT_VALENCE[best.kind];
      const bodyMul =
        (BODY_WEIGHT[keyA] ?? 0.6) * (BODY_WEIGHT[keyB] ?? 0.6);
      const pairMul = PAIR_MAGNIFIER[pairKey(keyA, keyB)] ?? 1;

      const contribution = valence * tightness * bodyMul * pairMul;
      aspectPoints += Math.abs(contribution);

      for (const cat of CATEGORIES) {
        const set = CATEGORY_BODIES[cat];
        if (set.has(keyA) && set.has(keyB)) raw[cat] += contribution;
      }
    }
  }

  // ── 2. House overlay contribution ─────────────────────────────────
  const overlays: SynastryHouseOverlay[] = [];
  for (const [body, point] of Object.entries(pointsA)) {
    if (!OVERLAY_BODY_WEIGHT[body]) continue;
    const house = houseOf(point.longitude, b.houses);
    if (!house) continue;
    const bonus = HOUSE_OVERLAY[house];
    if (!bonus) continue;
    overlays.push({ source: "a", body, house });
    const w = OVERLAY_BODY_WEIGHT[body];
    for (const cat of CATEGORIES) {
      const v = bonus[cat];
      if (v) {
        raw[cat] += w * v;
        housePoints += w * v;
      }
    }
  }
  for (const [body, point] of Object.entries(pointsB)) {
    if (!OVERLAY_BODY_WEIGHT[body]) continue;
    const house = houseOf(point.longitude, a.houses);
    if (!house) continue;
    const bonus = HOUSE_OVERLAY[house];
    if (!bonus) continue;
    overlays.push({ source: "b", body, house });
    const w = OVERLAY_BODY_WEIGHT[body];
    for (const cat of CATEGORIES) {
      const v = bonus[cat];
      if (v) {
        raw[cat] += w * v;
        housePoints += w * v;
      }
    }
  }

  // ── 3. Element compatibility (Sun + Moon) ─────────────────────────
  const sunA = ELEMENT_BY_SIGN[a.bodies.sun?.signIndex ?? 0];
  const sunB = ELEMENT_BY_SIGN[b.bodies.sun?.signIndex ?? 0];
  const moonA = ELEMENT_BY_SIGN[a.bodies.moon?.signIndex ?? 0];
  const moonB = ELEMENT_BY_SIGN[b.bodies.moon?.signIndex ?? 0];

  const sunAffinity = ELEMENT_AFFINITY[sunA]?.[sunB] ?? 0;
  const moonAffinity = ELEMENT_AFFINITY[moonA]?.[moonB] ?? 0;

  // Sun affinity feeds love / friendship / communication.
  // Moon affinity feeds love / chemistry / growth (emotional resonance).
  for (const cat of CATEGORIES) {
    const sBoost =
      cat === "love" || cat === "friendship" || cat === "communication"
        ? sunAffinity * 0.85
        : sunAffinity * 0.4;
    const mBoost =
      cat === "love" || cat === "chemistry" || cat === "growth"
        ? moonAffinity * 0.85
        : moonAffinity * 0.4;
    raw[cat] += sBoost + mBoost;
    elementPoints += sBoost + mBoost;
  }

  // ── 4. Normalise to 12–95 % via tanh ──────────────────────────────
  // Center at 48 so a chart pair with no signal lands slightly below
  // neutral (real synastry is rarely "totally neutral" — absence of
  // resonance IS friction). Amplitude 44 with divisor 7 gives a wide
  // realistic spread: 12% for genuinely hostile pairs, 95% as the cap
  // (no chart is ever exactly perfect), and the typical pair lands
  // somewhere in 35–80 instead of clustering at the high end.
  const scores = {} as Record<SynastryCategory, number>;
  for (const cat of CATEGORIES) {
    const norm = 48 + 44 * Math.tanh(raw[cat] / 7);
    scores[cat] = Math.max(12, Math.min(95, Math.round(norm)));
  }

  const overall = Math.round(
    CATEGORIES.reduce((sum, c) => sum + scores[c] * CATEGORY_WEIGHT[c], 0)
  );

  // Pick the top overlays for storytelling: Sun/Moon/Venus/Mars first,
  // then by intrinsic body weight.
  overlays.sort(
    (x, y) =>
      (OVERLAY_BODY_WEIGHT[y.body] ?? 0) -
      (OVERLAY_BODY_WEIGHT[x.body] ?? 0)
  );

  return {
    scores,
    overall,
    topAspects: aspectsFound
      .sort((x, y) => y.tightness - x.tightness)
      .slice(0, 8),
    elements: { sunA, sunB, moonA, moonB },
    breakdown: {
      aspectPoints: Math.round(aspectPoints * 10) / 10,
      housePoints: Math.round(housePoints * 10) / 10,
      elementPoints: Math.round(elementPoints * 10) / 10,
      topOverlays: overlays.slice(0, 4),
    },
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

export const ELEMENT_LABEL_KA: Record<ChartElement, string> = {
  fire: "ცეცხლი",
  earth: "მიწა",
  air: "ჰაერი",
  water: "წყალი",
};

export const ELEMENT_EMOJI: Record<ChartElement, string> = {
  fire: "🔥",
  earth: "🪨",
  air: "🌬️",
  water: "💧",
};

export const HOUSE_LABEL_KA: Record<number, string> = {
  1: "1-ლი — პირადი იდენტობა",
  2: "მე-2 — ღირებულებები",
  3: "მე-3 — კომუნიკაცია",
  4: "მე-4 — სახლი, ფესვები",
  5: "მე-5 — რომანი, შემოქმედება",
  6: "მე-6 — ყოველდღიურობა",
  7: "მე-7 — პარტნიორობა",
  8: "მე-8 — სიღრმე, გარდასახვა",
  9: "მე-9 — ჰორიზონტები",
  10: "მე-10 — გზა, რეპუტაცია",
  11: "მე-11 — მეგობრები, ოცნებები",
  12: "მე-12 — შინაგანი სამყარო",
};

/** Human-friendly verdict for an overall percentage. Thresholds re-anchored
 *  around the new neutral=48 curve so each band reflects a real qualitative
 *  shift instead of stacking near the top. */
export function overallVerdict(percent: number): string {
  if (percent >= 88) return "ციური ბმა";
  if (percent >= 78) return "ძლიერი თავსებადობა";
  if (percent >= 66) return "ბუნებრივი ნაკადი";
  if (percent >= 55) return "კარგი პოტენციალი";
  if (percent >= 43) return "ცოცხალი დინამიკა";
  if (percent >= 30) return "გამოწვევა, რომელშიც ზრდაა";
  return "ხახუნიანი კავშირი";
}
