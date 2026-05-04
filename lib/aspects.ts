/**
 * Major-aspect detection between two ecliptic longitudes.
 * Used to render aspect lines on the natal chart wheel.
 */

export type AspectKind =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export type AspectFamily = "harmonic" | "tense" | "neutral";

/**
 * Orb tolerances per aspect. We use the same default values as astro-seek
 * and most modern Western astrology software so users can sanity-check
 * against external tools.
 *  - Conjunction / Opposition: 10° (the strongest aspects, widest tolerance)
 *  - Square / Trine: 8° (major tension/harmony)
 *  - Sextile: 6° (gentler, narrower)
 */
export const ASPECTS: Array<{
  kind: AspectKind;
  angle: number;
  orb: number;
  family: AspectFamily;
}> = [
  { kind: "conjunction", angle: 0,   orb: 10, family: "neutral"  },
  { kind: "sextile",     angle: 60,  orb: 6,  family: "harmonic" },
  { kind: "square",      angle: 90,  orb: 8,  family: "tense"    },
  { kind: "trine",       angle: 120, orb: 8,  family: "harmonic" },
  { kind: "opposition",  angle: 180, orb: 10, family: "tense"    },
];

export type DetectedAspect = {
  a: string;            // body key
  b: string;            // body key
  kind: AspectKind;
  family: AspectFamily;
  /** Distance from exact, in degrees. Smaller = tighter. */
  orb: number;
  /** Tightness 0–1 (1 = exact). Useful for line weight. */
  intensity: number;
};

/** Smaller of the two arcs between two longitudes (0–180). */
export function angularDistance(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

/**
 * Canonical ID for an aspect — alphabetically sorted body keys + kind so the
 * same aspect always serializes identically (used as the AI dictionary key).
 */
export function aspectKey(a: string, b: string, kind: AspectKind): string {
  const [first, second] = [a, b].sort();
  return `${first}-${second}-${kind}`;
}

/**
 * Find aspects among a set of named longitudes. Skips weaker matches when
 * a tighter aspect already covers the same pair.
 */
export function detectAspects(
  bodies: Record<string, { longitude: number }>
): DetectedAspect[] {
  const keys = Object.keys(bodies);
  const out: DetectedAspect[] = [];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      // Alphabetical order so aspectKey(...) generates stable IDs
      const [a, b] = [keys[i], keys[j]].sort();
      const d = angularDistance(bodies[a].longitude, bodies[b].longitude);

      let best: DetectedAspect | null = null;
      for (const aspect of ASPECTS) {
        const orb = Math.abs(d - aspect.angle);
        if (orb <= aspect.orb) {
          const intensity = 1 - orb / aspect.orb;
          if (!best || intensity > best.intensity) {
            best = {
              a,
              b,
              kind: aspect.kind,
              family: aspect.family,
              orb,
              intensity,
            };
          }
        }
      }

      if (best) out.push(best);
    }
  }

  return out;
}
