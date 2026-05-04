/**
 * Daily transit computation. Given a date, returns today's planet positions
 * (using the same circular-natal-horoscope-js engine as natal charts) and
 * the cross-aspects between transits and the user's natal bodies.
 */

import { Origin, Horoscope } from "circular-natal-horoscope-js";

import { ASPECTS, angularDistance, type AspectKind } from "./aspects";
import type { HouseJson } from "@/db/schema";

export type TransitPositions = Record<string, { longitude: number }>;

const TRANSIT_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

/**
 * Compute today's transit positions at noon UTC. Lat/lng matters only for
 * the Asc/MC, which we don't use here, so we pass safe defaults.
 */
export function computeTransits(
  date: Date,
  latitude = 0,
  longitude = 0
): TransitPositions {
  const origin = new Origin({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(), // library uses 0-indexed months
    date: date.getUTCDate(),
    hour: 12,
    minute: 0,
    latitude,
    longitude,
  });
  const horoscope = new Horoscope({
    origin,
    language: "en",
    zodiac: "tropical",
    houseSystem: "placidus",
    aspectPoints: [],
    aspectWithPoints: [],
    aspectTypes: [],
  });

  const out: TransitPositions = {};
  for (const key of TRANSIT_BODIES) {
    const body = horoscope.CelestialBodies?.[key];
    const deg = body?.ChartPosition?.Ecliptic?.DecimalDegrees;
    if (typeof deg === "number") {
      out[key] = { longitude: ((deg % 360) + 360) % 360 };
    }
  }
  return out;
}

export type CrossAspect = {
  transit: string;       // transiting body key
  natal: string;         // natal body key
  kind: AspectKind;
  orb: number;
  intensity: number;     // 0..1, 1 = exact
};

/**
 * Detect aspects between transit positions and a natal body set.
 * Returns the strongest aspect found per (transit, natal) pair, sorted
 * by intensity descending.
 */
export function detectCrossAspects(
  transit: TransitPositions,
  natal: Record<string, { longitude: number }>
): CrossAspect[] {
  const out: CrossAspect[] = [];

  for (const [tKey, tBody] of Object.entries(transit)) {
    for (const [nKey, nBody] of Object.entries(natal)) {
      const d = angularDistance(tBody.longitude, nBody.longitude);

      let best: CrossAspect | null = null;
      for (const aspect of ASPECTS) {
        const orb = Math.abs(d - aspect.angle);
        if (orb <= aspect.orb) {
          const intensity = 1 - orb / aspect.orb;
          if (!best || intensity > best.intensity) {
            best = {
              transit: tKey,
              natal: nKey,
              kind: aspect.kind,
              orb,
              intensity,
            };
          }
        }
      }
      if (best) out.push(best);
    }
  }

  return out.sort((a, b) => b.intensity - a.intensity);
}

/**
 * Which natal house contains the given longitude? Walks each pair of
 * adjacent house cusps and checks whether the longitude falls inside
 * the arc, handling the 0°/360° wrap.
 */
export function houseOfLongitude(
  longitude: number,
  houses: HouseJson[]
): number | null {
  if (houses.length < 12) return null;
  const sorted = [...houses].sort((a, b) => a.number - b.number);
  for (let i = 0; i < 12; i++) {
    const start = sorted[i].cuspLongitude;
    const end = sorted[(i + 1) % 12].cuspLongitude;
    if (isLongitudeInArc(longitude, start, end)) {
      return sorted[i].number;
    }
  }
  return null;
}

/** Is `lng` within the arc going CCW from `start` to `end` (with wrap)? */
function isLongitudeInArc(lng: number, start: number, end: number): boolean {
  const norm = (x: number) => ((x % 360) + 360) % 360;
  const a = norm(start);
  const b = norm(end);
  const x = norm(lng);
  if (a <= b) return x >= a && x < b;
  return x >= a || x < b; // wraps past 360°
}

/**
 * Format a Date as "YYYY-MM-DD" in the given IANA timezone. Used as the
 * cache key for daily horoscopes — defining "today" by the user's local
 * calendar, not UTC.
 */
export function localDateString(date: Date, timezone: string): string {
  try {
    // en-CA → ISO-like "YYYY-MM-DD"
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
