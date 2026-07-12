import { ASPECTS, angularDistance, type AspectFamily, type AspectKind } from "@/lib/aspects";
import { computeTransits } from "@/lib/transits";
import { BODIES, signByIndex } from "@/lib/zodiac";

/**
 * Mundane (no-natal) sky snapshot for the public horoscope SEO pages — which
 * sign every planet occupies today and the day's tightest planet-to-planet
 * aspects, all Georgian-labelled. Pure ephemeris math, no DB/AI, so the hubs
 * get genuinely fresh transit-based content on every ISR revalidation.
 */

export type MundanePlanet = {
  key: string;
  labelKa: string; // "მთვარე"
  symbol: string; // "☽"
  signKa: string; // "ლომი"
  signSymbol: string; // "♌"
  signIndex: number;
};

export type MundaneAspect = {
  aKa: string; // "ვენერა"
  bKa: string; // "სატურნი"
  aSymbol: string;
  bSymbol: string;
  kindKa: string; // "ტრიგონი"
  family: AspectFamily;
  orb: number;
};

export type MundaneSky = {
  planets: MundanePlanet[];
  aspects: MundaneAspect[];
};

export const ASPECT_KA: Record<AspectKind, string> = {
  conjunction: "შეერთება",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრიგონი",
  opposition: "ოპოზიცია",
};

/** Display order — luminaries and fast movers first (they change the most). */
const ORDER = [
  "moon",
  "sun",
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
 * Compute the sky for a date (noon UTC — matches the daily horoscope
 * generators). `maxAspects` keeps the aspect list to the genuinely notable
 * ones: pairs are deduped, sorted tightest-first, and slow-vs-slow pairs
 * (which barely move day to day) are skipped so the list actually changes
 * with the date.
 */
export function computeMundaneSky(
  date: Date = new Date(),
  maxAspects = 5
): MundaneSky {
  const positions = computeTransits(date);

  const planets: MundanePlanet[] = [];
  for (const key of ORDER) {
    const pos = positions[key];
    const body = BODIES[key];
    if (!pos || !body) continue;
    const signIndex = Math.floor((((pos.longitude % 360) + 360) % 360) / 30);
    const sign = signByIndex(signIndex);
    planets.push({
      key,
      labelKa: body.labelKa,
      symbol: body.symbol,
      signKa: sign.labelKa,
      signSymbol: sign.symbol,
      signIndex,
    });
  }

  // Mundane aspects: every unordered planet pair, best aspect per pair. Skip
  // outer-vs-outer pairs — Jupiter..Pluto aspects stay in orb for months and
  // would crowd out the fast, day-defining contacts.
  const SLOW = new Set(["jupiter", "saturn", "uranus", "neptune", "pluto"]);
  const aspects: MundaneAspect[] = [];
  for (let i = 0; i < ORDER.length; i++) {
    for (let j = i + 1; j < ORDER.length; j++) {
      const aKey = ORDER[i];
      const bKey = ORDER[j];
      if (SLOW.has(aKey) && SLOW.has(bKey)) continue;
      const a = positions[aKey];
      const b = positions[bKey];
      if (!a || !b) continue;
      const d = angularDistance(a.longitude, b.longitude);
      let best: { kind: AspectKind; family: AspectFamily; orb: number } | null =
        null;
      for (const asp of ASPECTS) {
        const orb = Math.abs(d - asp.angle);
        if (orb <= asp.orb && (!best || orb < best.orb)) {
          best = { kind: asp.kind, family: asp.family, orb };
        }
      }
      if (best) {
        aspects.push({
          aKa: BODIES[aKey].labelKa,
          bKa: BODIES[bKey].labelKa,
          aSymbol: BODIES[aKey].symbol,
          bSymbol: BODIES[bKey].symbol,
          kindKa: ASPECT_KA[best.kind],
          family: best.family,
          orb: best.orb,
        });
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  return { planets, aspects: aspects.slice(0, maxAspects) };
}
