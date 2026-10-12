/**
 * Moon phase computation. Reuses the same `circular-natal-horoscope-js`
 * engine the daily horoscope uses (via `computeTransits`) to derive sun
 * and moon ecliptic longitudes, then turns the angular separation into
 * one of the eight canonical phases plus illumination + age.
 *
 * The result is universal, same for everyone on a given UTC day, so
 * it's cached globally in the `moon_phases` table by date alone.
 */

import { computeTransits } from "./transits";
import { signFromLongitude } from "./zodiac";

const SYNODIC_MONTH_DAYS = 29.530588853;

export const PHASE_KEYS = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
] as const;

export type PhaseKey = (typeof PHASE_KEYS)[number];

export const PHASE_LABEL_KA: Record<PhaseKey, string> = {
  new_moon: "ახალი მთვარე",
  waxing_crescent: "მზარდი ნამგალი",
  first_quarter: "პირველი მეოთხედი",
  waxing_gibbous: "მზარდი გიბუსი",
  full_moon: "სავსე მთვარე",
  waning_gibbous: "კლებადი გიბუსი",
  last_quarter: "ბოლო მეოთხედი",
  waning_crescent: "კლებადი ნამგალი",
};

export const PHASE_LABEL_EN: Record<PhaseKey, string> = {
  new_moon: "New Moon",
  waxing_crescent: "Waxing Crescent",
  first_quarter: "First Quarter",
  waxing_gibbous: "Waxing Gibbous",
  full_moon: "Full Moon",
  waning_gibbous: "Waning Gibbous",
  last_quarter: "Last Quarter",
  waning_crescent: "Waning Crescent",
};

export type MoonPhaseSnapshot = {
  /** 0..360, sun→moon angular separation. */
  phaseAngle: number;
  /** Moon's tropical ecliptic longitude (0..360). */
  moonLongitude: number;
  /** Sun's tropical ecliptic longitude (0..360). */
  sunLongitude: number;
  signEn: string;
  signKa: string;
  signIndex: number;
  signSymbol: string;
  phaseKey: PhaseKey;
  phaseLabelKa: string;
  /** 0..1, fraction of disk illuminated. */
  illumination: number;
  /** 0..29.53, days since previous new moon. */
  ageDays: number;
};

/** Bucket a sun-moon separation angle into one of the eight named phases. */
export function phaseKeyFromAngle(angle: number): PhaseKey {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return "new_moon";
  if (a < 67.5) return "waxing_crescent";
  if (a < 112.5) return "first_quarter";
  if (a < 157.5) return "waxing_gibbous";
  if (a < 202.5) return "full_moon";
  if (a < 247.5) return "waning_gibbous";
  if (a < 292.5) return "last_quarter";
  return "waning_crescent";
}

export function illuminationFromAngle(angle: number): number {
  return (1 - Math.cos((angle * Math.PI) / 180)) / 2;
}

export function ageDaysFromAngle(angle: number): number {
  return (angle / 360) * SYNODIC_MONTH_DAYS;
}

/**
 * Compute the universal moon phase for a given moment. Lat/lng aren't
 * passed because the moon's ecliptic longitude is geocentric, it's the
 * same from anywhere on Earth (parallax is sub-arcminute and ignored
 * here).
 */
export function computeMoonPhase(date: Date): MoonPhaseSnapshot | null {
  const transits = computeTransits(date);
  const sun = transits.sun;
  const moon = transits.moon;
  if (!sun || !moon) return null;

  const phaseAngle = (((moon.longitude - sun.longitude) % 360) + 360) % 360;
  const sign = signFromLongitude(moon.longitude);
  const phaseKey = phaseKeyFromAngle(phaseAngle);

  return {
    phaseAngle,
    moonLongitude: moon.longitude,
    sunLongitude: sun.longitude,
    signEn: sign.labelEn,
    signKa: sign.labelKa,
    signIndex: sign.index,
    signSymbol: sign.symbol,
    phaseKey,
    phaseLabelKa: PHASE_LABEL_KA[phaseKey],
    illumination: illuminationFromAngle(phaseAngle),
    ageDays: ageDaysFromAngle(phaseAngle),
  };
}

/** UTC date string (YYYY-MM-DD), moon phase cache key. */
export function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}
