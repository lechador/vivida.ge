/**
 * Reputation tiers. Pure cosmetic — picking a tier doesn't unlock any
 * feature, the value comes from social signaling alone.
 *
 * Thresholds were chosen so the first three tiers feel reachable in a
 * casual week (~3 posts/day at +3 + a handful of reactions ≈ 50 pts/week),
 * and the top tier takes meaningful sustained contribution.
 */

export type TierKey =
  | "nova"
  | "bright"
  | "star"
  | "celestial"
  | "cosmos"
  | "supernova";

export type Tier = {
  key: TierKey;
  labelKa: string;
  min: number;
  hue: string;
  /** Short evocative tagline used in /leaderboard + profile tier panel. */
  taglineKa: string;
};

export const TIERS: Tier[] = [
  {
    key: "nova",
    labelKa: "ნოვა",
    min: 0,
    hue: "oklch(0.72 0.08 280)",
    taglineKa: "ახალი ვარსკვლავი — ცა გელოდება.",
  },
  {
    key: "bright",
    labelKa: "ნათელი",
    min: 51,
    hue: "oklch(0.80 0.14 200)",
    taglineKa: "შენი შუქი უკვე ჩანს.",
  },
  {
    key: "star",
    labelKa: "ვარსკვლავი",
    min: 201,
    hue: "oklch(0.85 0.16 85)",
    taglineKa: "ცის რუკაში მტკიცე წერტილი.",
  },
  {
    key: "celestial",
    labelKa: "ცის სხეული",
    min: 501,
    hue: "oklch(0.78 0.18 350)",
    taglineKa: "შენი ენერგია სხვებსაც გადასცემს.",
  },
  {
    key: "cosmos",
    labelKa: "კოსმოსი",
    min: 1501,
    hue: "oklch(0.72 0.22 0)",
    taglineKa: "მთელი თანავარსკვლავედის ცენტრი.",
  },
  {
    key: "supernova",
    labelKa: "სუპერ-ნოვა",
    min: 5001,
    hue: "oklch(0.78 0.18 305)",
    taglineKa: "ცაში არ ვერ შეგამჩნევენ.",
  },
];

/** Highest tier whose `min` ≤ total. Always returns nova as the floor. */
export function tierFor(total: number): Tier {
  const t = total ?? 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (t >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

/** Points needed to reach the next tier; null when already at the top. */
export function pointsToNextTier(total: number): number | null {
  const current = tierFor(total);
  const idx = TIERS.findIndex((t) => t.key === current.key);
  const next = TIERS[idx + 1];
  return next ? next.min - total : null;
}
