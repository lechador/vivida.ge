/**
 * Elemental balance, computes how strongly each of the four classical
 * elements (Fire, Earth, Air, Water) is represented in a natal chart.
 *
 * Each placement contributes a weighted point to the element of its sign:
 *  - Sun, Moon, Ascendant carry the most weight (the "big three").
 *  - Personal planets (Mercury, Venus, Mars) weight less.
 *  - Outer + transpersonal points (Jupiter→Pluto, MC) weight least.
 *
 * Used for the dashboard "ELEMENTS" panel and as another input we can
 * later feed into AI prompts.
 */

import type { NatalChartJson } from "@/db/schema";
import { signByIndex, type ZodiacSign } from "./zodiac";

export type Element = ZodiacSign["element"]; // "ცეცხლი" | "მიწა" | "ჰაერი" | "წყალი"

export const ELEMENT_ORDER: Element[] = [
  "ცეცხლი",
  "მიწა",
  "ჰაერი",
  "წყალი",
];

const POINT_WEIGHTS: Record<string, number> = {
  // Personality core, the big three carry the most signal
  sun: 3,
  moon: 3,
  ascendant: 3,
  // Personal planets
  mercury: 2,
  venus: 2,
  mars: 2,
  // Social planets
  jupiter: 1.5,
  saturn: 1.5,
  // Career angle
  midheaven: 1.5,
  // Generational planets, deliberately lower so they don't drown out personal placements
  uranus: 1,
  neptune: 1,
  pluto: 1,
};

export type ElementBalance = {
  scores: Record<Element, number>;
  /** Each element 0–100, summing to 100. */
  percentages: Record<Element, number>;
  /** Element keys present in the chart, sorted highest → lowest. */
  ranked: Element[];
  /** Highest-scoring element. */
  dominant: Element;
  /** Body keys (sun, moon, etc.) by element, ordered by descending weight. */
  planetsByElement: Record<Element, string[]>;
  totalWeight: number;
};

export function computeElementBalance(chart: NatalChartJson): ElementBalance {
  const scores: Record<Element, number> = {
    ცეცხლი: 0,
    მიწა: 0,
    ჰაერი: 0,
    წყალი: 0,
  };
  const planetsByElement: Record<Element, Array<{ key: string; weight: number }>> = {
    ცეცხლი: [],
    მიწა: [],
    ჰაერი: [],
    წყალი: [],
  };

  const visit = (key: string, signIndex: number) => {
    const weight = POINT_WEIGHTS[key] ?? 1;
    const sign = signByIndex(signIndex);
    scores[sign.element] += weight;
    planetsByElement[sign.element].push({ key, weight });
  };

  for (const [key, point] of Object.entries(chart.bodies)) {
    if (POINT_WEIGHTS[key] === undefined) continue; // skip Chiron, asteroids, etc.
    visit(key, point.signIndex);
  }
  visit("ascendant", chart.ascendant.signIndex);
  visit("midheaven", chart.midheaven.signIndex);

  const totalWeight = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const percentages: Record<Element, number> = {
    ცეცხლი: (scores["ცეცხლი"] / totalWeight) * 100,
    მიწა: (scores["მიწა"] / totalWeight) * 100,
    ჰაერი: (scores["ჰაერი"] / totalWeight) * 100,
    წყალი: (scores["წყალი"] / totalWeight) * 100,
  };

  const ranked = [...ELEMENT_ORDER].sort((a, b) => scores[b] - scores[a]);

  return {
    scores,
    percentages,
    ranked,
    dominant: ranked[0],
    planetsByElement: Object.fromEntries(
      ELEMENT_ORDER.map((el) => [
        el,
        planetsByElement[el]
          .sort((x, y) => y.weight - x.weight)
          .map((x) => x.key),
      ])
    ) as Record<Element, string[]>,
    totalWeight,
  };
}
