import { ASPECTS, angularDistance, type AspectKind } from "@/lib/aspects";
import type { HouseCusp } from "@/lib/astrology-local";

export type TransitBodyPosition = {
  longitude: number;
  speedDegPerHour: number;
  retrograde: boolean;
};

export type TransitPositions = Record<string, TransitBodyPosition>;

export type CrossAspect = {
  transit: string;
  natal: string;
  kind: AspectKind;
  angle: number;
  orb: number;
};

const BASE_LONGITUDES: Record<string, { base: number; speedPerDay: number }> = {
  sun: { base: 204, speedPerDay: 0.9856 },
  moon: { base: 82, speedPerDay: 13.176 },
  mercury: { base: 215, speedPerDay: 1.2 },
  venus: { base: 190, speedPerDay: 1.1 },
  mars: { base: 112, speedPerDay: 0.52 },
  jupiter: { base: 78, speedPerDay: 0.083 },
  saturn: { base: 348, speedPerDay: 0.033 },
  uranus: { base: 56, speedPerDay: 0.011 },
  neptune: { base: 359, speedPerDay: 0.006 },
  pluto: { base: 301, speedPerDay: 0.004 },
};

export function localDateString(date: Date = new Date(), timeZone: string = "UTC"): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value ?? "2026";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${d}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function computeTransits(
  date: Date = new Date(),
  _lat: number = 0,
  _lng: number = 0,
): TransitPositions {
  const daysSinceEpoch = (date.getTime() - Date.UTC(2026, 0, 1)) / 86_400_000;
  const out: TransitPositions = {};
  for (const [key, cfg] of Object.entries(BASE_LONGITUDES)) {
    const longitude = (((cfg.base + daysSinceEpoch * cfg.speedPerDay) % 360) + 360) % 360;
    out[key] = {
      longitude,
      speedDegPerHour: cfg.speedPerDay / 24,
      retrograde: false,
    };
  }
  return out;
}

export function houseOfLongitude(
  longitude: number,
  houses?: HouseCusp[] | null,
): number | null {
  if (!houses || houses.length < 12) return null;
  const sorted = [...houses].sort((a, b) => a.number - b.number);
  const norm = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = ((sorted[i].cuspLongitude % 360) + 360) % 360;
    const end = ((sorted[(i + 1) % 12].cuspLongitude % 360) + 360) % 360;
    if (start <= end) {
      if (norm >= start && norm < end) return sorted[i].number;
    } else {
      if (norm >= start || norm < end) return sorted[i].number;
    }
  }
  return sorted[0]?.number ?? 1;
}

export function detectCrossAspects(
  transits: TransitPositions,
  natalBodies: Record<string, { longitude: number }>,
): CrossAspect[] {
  const results: CrossAspect[] = [];
  for (const [tKey, tPos] of Object.entries(transits)) {
    for (const [nKey, nPos] of Object.entries(natalBodies)) {
      if (!nPos || typeof nPos.longitude !== "number") continue;
      const dist = angularDistance(tPos.longitude, nPos.longitude);
      for (const asp of ASPECTS) {
        const orb = Math.abs(dist - asp.angle);
        if (orb <= asp.orb) {
          results.push({
            transit: tKey,
            natal: nKey,
            kind: asp.kind,
            angle: asp.angle,
            orb: Math.round(orb * 100) / 100,
          });
        }
      }
    }
  }
  return results.sort((a, b) => a.orb - b.orb);
}
