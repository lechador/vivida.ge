/**
 * 7-day forecast scoring. Computes transit-to-natal aspects for each of the
 * next 7 calendar days (in the user's timezone) and turns them into two
 * scores: how harmonic vs. how challenging the day looks. The Gemini prompt
 * downstream reads the same drivers list to write its narratives, so the
 * UI bars and the AI text always agree on which aspects mattered.
 */

import type { NatalChartJson } from "@/db/schema";
import {
  computeTransits,
  detectCrossAspects,
  type CrossAspect,
} from "./transits";
import { signByIndex } from "./zodiac";
import { ASPECTS, type AspectFamily } from "./aspects";

const FORECAST_DAYS = 7;
const ASPECT_FAMILY: Record<string, AspectFamily> = Object.fromEntries(
  ASPECTS.map((a) => [a.kind, a.family])
);

/**
 * Conjunctions are technically "neutral" by family but the felt quality
 * depends on which planets join. Saturn/Mars/Pluto bring friction; Venus/
 * Jupiter/Sun/Moon bring ease. Anything else stays neutral and contributes
 * half-and-half so it's still visible in the bar.
 */
const TENSE_PLANETS = new Set(["mars", "saturn", "pluto"]);
const HARMONIC_PLANETS = new Set(["venus", "jupiter", "sun", "moon"]);

export type WeeklyDayContext = {
  dateIso: string;       // YYYY-MM-DD in user's TZ
  weekdayKa: string;     // "ორშაბათი", ..
  /** Date label used inside the prompt — "ორშაბათი, 5 მაისი". */
  promptLabel: string;
  moonSignKa: string;
  moonSignEn: string;
  harmonyScore: number;  // 0..100
  challengeScore: number;
  drivers: Array<{
    transit: string;
    natal: string;
    kind: string;
    family: AspectFamily;
    orb: number;
    intensity: number;
  }>;
};

/**
 * Build the 7-day window starting from `startDate` interpreted in `timezone`.
 * Each day is computed at noon UTC for stability — same convention as
 * computeTransits used elsewhere — but date labels are rendered in the
 * user's timezone so "today" matches what they see on a wall calendar.
 */
export function computeWeeklyForecast(
  natal: NatalChartJson,
  startDate: Date,
  timezone: string
): WeeklyDayContext[] {
  const natalBodies = Object.fromEntries(
    Object.entries(natal.bodies).map(([k, v]) => [k, { longitude: v.longitude }])
  );

  const out: WeeklyDayContext[] = [];

  for (let i = 0; i < FORECAST_DAYS; i++) {
    // Step day-by-day from startDate at UTC noon. We don't want DST edge
    // cases — the transit positions move slowly enough that a few hours
    // of TZ drift doesn't change the qualitative picture.
    const at = new Date(startDate);
    at.setUTCHours(12, 0, 0, 0);
    at.setUTCDate(at.getUTCDate() + i);

    const transits = computeTransits(at);
    const aspects = detectCrossAspects(transits, natalBodies)
      .filter((a) => a.orb <= 5);

    const { harmonyScore, challengeScore, drivers } = scoreDay(aspects);

    const moonLong = transits.moon?.longitude;
    const moonSign =
      typeof moonLong === "number"
        ? signByIndex(Math.floor(moonLong / 30))
        : signByIndex(0);

    const dateIso = localDateIsoForOffset(startDate, timezone, i);
    const weekdayKa = formatWeekdayKa(at, timezone);
    const promptLabel = formatPromptLabel(at, timezone);

    out.push({
      dateIso,
      weekdayKa,
      promptLabel,
      moonSignKa: moonSign.labelKa,
      moonSignEn: moonSign.labelEn,
      harmonyScore,
      challengeScore,
      drivers,
    });
  }

  return out;
}

function scoreDay(aspects: CrossAspect[]) {
  let harmony = 0;
  let challenge = 0;
  // Sorted-by-intensity drivers we'll show in the breakdown
  const drivers = aspects
    .slice(0, 12) // upstream is sorted by intensity desc; cap before scoring noise
    .map((a) => {
      const family = familyOf(a);
      const weight = a.intensity * planetWeight(a);
      if (family === "harmonic") harmony += weight;
      else if (family === "tense") challenge += weight;
      else {
        // "neutral" conjunction with neither side dominating — split.
        harmony += weight * 0.5;
        challenge += weight * 0.5;
      }
      return {
        transit: a.transit,
        natal: a.natal,
        kind: a.kind,
        family,
        orb: a.orb,
        intensity: a.intensity,
      };
    });

  // Tilt amplification: preserve the day's total energy but sharpen which
  // side dominates. A day that's 60/40 raw becomes ~75/25 here — tilted
  // days feel decisively tilted. Truly balanced days (50/50) stay 50/50.
  // tanh keeps the response bounded and symmetric.
  const total = harmony + challenge;
  if (total > 0.01) {
    const tilt = (harmony - challenge) / total; // -1..1
    const sharpened = Math.tanh(2 * tilt);
    harmony = total * (0.5 + 0.5 * sharpened);
    challenge = total * (0.5 - 0.5 * sharpened);
  }

  // Calibrate to 0-100. Weighted intensity sum of ~3 saturates the bar —
  // keeps typical days landing in the visually interesting middle range.
  const harmonyScore = Math.min(100, Math.round((harmony / 3) * 100));
  const challengeScore = Math.min(100, Math.round((challenge / 3) * 100));

  return { harmonyScore, challengeScore, drivers };
}

function familyOf(a: CrossAspect): AspectFamily {
  const base = ASPECT_FAMILY[a.kind] ?? "neutral";
  if (a.kind !== "conjunction") return base;
  // Conjunction tilt by participating planets
  if (TENSE_PLANETS.has(a.transit) || TENSE_PLANETS.has(a.natal)) return "tense";
  if (HARMONIC_PLANETS.has(a.transit) || HARMONIC_PLANETS.has(a.natal)) return "harmonic";
  return "neutral";
}

/**
 * Which transiting bodies "feel" the strongest. Moon is fast and dominates
 * day-flavor; outer planets move slowly so we shrink them so they don't
 * make every single day look the same as the rest of the week.
 */
function planetWeight(a: CrossAspect): number {
  const t = a.transit;
  if (t === "moon") return 1.0;
  if (t === "sun" || t === "mercury" || t === "venus" || t === "mars") return 0.85;
  if (t === "jupiter" || t === "saturn") return 0.6;
  return 0.4; // uranus, neptune, pluto — generational
}

/** YYYY-MM-DD in `timezone` for the day `offsetDays` after `startDate`. */
function localDateIsoForOffset(
  startDate: Date,
  timezone: string,
  offsetDays: number
): string {
  // Shift the start by N days, then format in TZ. Using en-CA gives us
  // ISO-like "YYYY-MM-DD" without manual padding.
  const shifted = new Date(startDate);
  shifted.setUTCHours(12, 0, 0, 0);
  shifted.setUTCDate(shifted.getUTCDate() + offsetDays);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(shifted);
  } catch {
    return shifted.toISOString().slice(0, 10);
  }
}

function formatWeekdayKa(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      timeZone: timezone,
      weekday: "long",
    }).format(date);
  } catch {
    return "";
  }
}

function formatPromptLabel(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      timeZone: timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
