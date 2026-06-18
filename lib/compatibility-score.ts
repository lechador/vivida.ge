/**
 * Turns the editorial compatibility *category* (ძლიერი / ჰარმონიული /
 * გამომწვევი) into a precise-feeling percentage for the interactive
 * calculator. The number is deterministic per pair slug — same couple
 * always gets the same score — so a shared result stays trustworthy and
 * reproducible, while still landing inside the band the curated content
 * already assigns. It is intentionally NOT random.
 */

import type { CompatibilityScore } from "@/lib/seo/zodiac-content";

const BANDS: Record<CompatibilityScore, [number, number]> = {
  ძლიერი: [84, 97],
  ჰარმონიული: [71, 85],
  გამომწვევი: [54, 70],
};

/** Stable, well-spread percentage in the band for `score`, keyed by slug. */
export function pairPercent(slug: string, score: CompatibilityScore): number {
  const [lo, hi] = BANDS[score];
  // FNV-ish rolling hash → deterministic offset within the band.
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const span = hi - lo + 1;
  return lo + (((h >>> 0) % span));
}
