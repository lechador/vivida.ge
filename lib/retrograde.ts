import { computeTransits } from "@/lib/transits";
import { signByIndex } from "@/lib/zodiac";

/**
 * Mercury-retrograde periods computed straight from the ephemeris — no
 * hardcoded date tables to go stale. Daily sampling is plenty: Mercury
 * stations are day-scale events, and the SEO page only needs dates.
 */

export type RetrogradePeriod = {
  /** ISO date (UTC) retrograde motion begins. */
  startIso: string;
  /** ISO date (UTC) direct motion resumes. */
  endIso: string;
  /** Georgian sign label where the retrograde starts (station retrograde). */
  startSignKa: string;
  /** Georgian sign label where it ends (station direct). */
  endSignKa: string;
  startSignEn: string;
  endSignEn: string;
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Signed daily motion a→b in degrees, wrap-safe (negative = retrograde). */
function signedMotion(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}

function signOf(longitude: number) {
  return signByIndex(Math.floor((((longitude % 360) + 360) % 360) / 30));
}

/**
 * All Mercury retrograde periods intersecting `year` (sampled daily, noon
 * UTC). Scans with a ±40d margin so periods straddling the year boundary
 * come back whole.
 */
export function mercuryRetrogradePeriods(year: number): RetrogradePeriod[] {
  const start = Date.UTC(year - 1, 11, 1); // Dec 1 prior year
  const end = Date.UTC(year + 1, 1, 10); // Feb 10 next year
  const DAY = 24 * 60 * 60 * 1000;

  const periods: RetrogradePeriod[] = [];
  let prevLon: number | null = null;
  let current: { start: Date; startLon: number } | null = null;

  for (let t = start; t <= end; t += DAY) {
    const date = new Date(t);
    const lon = computeTransits(date).mercury?.longitude;
    if (lon == null) continue;
    if (prevLon != null) {
      const retro = signedMotion(prevLon, lon) < 0;
      if (retro && !current) {
        current = { start: date, startLon: lon };
      } else if (!retro && current) {
        periods.push({
          startIso: iso(current.start),
          endIso: iso(new Date(t - DAY)),
          startSignKa: signOf(current.startLon).labelKa,
          endSignKa: signOf(prevLon).labelKa,
          startSignEn: signOf(current.startLon).labelEn,
          endSignEn: signOf(prevLon).labelEn,
        });
        current = null;
      }
    }
    prevLon = lon;
  }

  // Keep only periods that touch the requested year.
  return periods.filter(
    (p) =>
      p.startIso.startsWith(String(year)) || p.endIso.startsWith(String(year))
  );
}

/** Is Mercury retrograde right now (daily resolution)? */
export function isMercuryRetrogradeNow(now: Date = new Date()): boolean {
  const DAY = 24 * 60 * 60 * 1000;
  const a = computeTransits(new Date(now.getTime() - DAY)).mercury?.longitude;
  const b = computeTransits(now).mercury?.longitude;
  if (a == null || b == null) return false;
  return signedMotion(a, b) < 0;
}
