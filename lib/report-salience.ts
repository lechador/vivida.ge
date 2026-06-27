import type { NatalChartJson } from "@/db/schema";
import { bodyMeta, signByIndex } from "@/lib/zodiac";
import { computeElementBalance, ELEMENT_ORDER, type Element } from "@/lib/elements";

/**
 * Salience engine — before any prose is generated, compute what is genuinely
 * *prominent* about a specific chart so the report can LEAD with it instead of
 * walking every placement with equal weight. This is what makes a report feel
 * bespoke rather than a generic placement-by-placement dump.
 *
 * Outputs structured, ranked facts: elemental + modal balance (with the
 * weak/missing end), the tightest (= strongest) aspects, planets sitting on
 * the angles, sign/house stelliums, and retrogrades.
 */

export type Modality = "კარდინალური" | "ფიქსირებული" | "მუტაბელური";
const MODALITY_ORDER: Modality[] = [
  "კარდინალური",
  "ფიქსირებული",
  "მუტაბელური",
];

// Same weighting model as the element balance (big-three heaviest).
const POINT_WEIGHTS: Record<string, number> = {
  sun: 3,
  moon: 3,
  ascendant: 3,
  mercury: 2,
  venus: 2,
  mars: 2,
  jupiter: 1.5,
  saturn: 1.5,
  midheaven: 1.5,
  uranus: 1,
  neptune: 1,
  pluto: 1,
};

export type SalientAspect = {
  a: string;
  b: string;
  aLabel: string;
  bLabel: string;
  kind: string;
  family: "harmonic" | "tense" | "neutral";
  orb: number;
};

export type ChartSalience = {
  elements: {
    percentages: Record<Element, number>;
    dominant: Element;
    weakest: Element;
    ranked: Element[];
  };
  modality: {
    percentages: Record<Modality, number>;
    dominant: Modality;
    weakest: Modality;
  };
  /** Tightest cross-aspects, strongest first (orb = exactness = strength). */
  tightestAspects: SalientAspect[];
  /** Planets within orb of an angle (AC/MC/DC/IC) — loud, surface-level. */
  angularPlanets: Array<{ key: string; label: string; angle: string; orb: number }>;
  /** 3+ planets sharing a sign or a house. */
  stelliums: Array<{ label: string; planets: string[] }>;
  retrogrades: Array<{ key: string; label: string }>;
};

function angularDistance(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}

function label(key: string): string {
  return bodyMeta(key)?.labelKa ?? key;
}

function modalityBalance(chart: NatalChartJson) {
  const scores: Record<Modality, number> = {
    კარდინალური: 0,
    ფიქსირებული: 0,
    მუტაბელური: 0,
  };
  const visit = (key: string, signIndex: number) => {
    const w = POINT_WEIGHTS[key] ?? 1;
    scores[signByIndex(signIndex).modality] += w;
  };
  for (const [key, p] of Object.entries(chart.bodies)) {
    if (POINT_WEIGHTS[key] === undefined) continue;
    visit(key, p.signIndex);
  }
  visit("ascendant", chart.ascendant.signIndex);
  visit("midheaven", chart.midheaven.signIndex);
  const total = MODALITY_ORDER.reduce((s, m) => s + scores[m], 0) || 1;
  const percentages = Object.fromEntries(
    MODALITY_ORDER.map((m) => [m, (scores[m] / total) * 100])
  ) as Record<Modality, number>;
  const ranked = [...MODALITY_ORDER].sort((a, b) => scores[b] - scores[a]);
  return { percentages, dominant: ranked[0], weakest: ranked[ranked.length - 1] };
}

export function computeChartSalience(chart: NatalChartJson): ChartSalience {
  const eb = computeElementBalance(chart);
  const elements = {
    percentages: eb.percentages,
    dominant: eb.ranked[0],
    weakest: eb.ranked[ELEMENT_ORDER.length - 1],
    ranked: eb.ranked,
  };

  const modality = modalityBalance(chart);

  const tightestAspects: SalientAspect[] = [...(chart.aspects ?? [])]
    .sort((x, y) => x.orb - y.orb)
    .slice(0, 6)
    .map((a) => ({
      a: a.a,
      b: a.b,
      aLabel: label(a.a),
      bLabel: label(a.b),
      kind: a.kind,
      family: a.family,
      orb: a.orb,
    }));

  const angles: Array<{ name: string; lon: number }> = [
    { name: "ასცენდენტი", lon: chart.ascendant.longitude },
    { name: "ზენიტი (MC)", lon: chart.midheaven.longitude },
    { name: "დესცენდენტი", lon: (chart.ascendant.longitude + 180) % 360 },
    { name: "IC", lon: (chart.midheaven.longitude + 180) % 360 },
  ];
  const angularPlanets: ChartSalience["angularPlanets"] = [];
  for (const [key, p] of Object.entries(chart.bodies)) {
    if (POINT_WEIGHTS[key] === undefined) continue;
    for (const ang of angles) {
      const orb = angularDistance(p.longitude, ang.lon);
      if (orb <= 6) {
        angularPlanets.push({ key, label: label(key), angle: ang.name, orb });
      }
    }
  }
  angularPlanets.sort((a, b) => a.orb - b.orb);

  // Stelliums: 3+ weighted planets in one sign or one house.
  const bySign: Record<number, string[]> = {};
  const byHouse: Record<number, string[]> = {};
  for (const [key, p] of Object.entries(chart.bodies)) {
    if (POINT_WEIGHTS[key] === undefined) continue;
    (bySign[p.signIndex] ??= []).push(key);
    if (p.house) (byHouse[p.house] ??= []).push(key);
  }
  const stelliums: ChartSalience["stelliums"] = [];
  for (const [idx, keys] of Object.entries(bySign)) {
    if (keys.length >= 3) {
      stelliums.push({
        label: `${signByIndex(Number(idx)).labelKa}-ში`,
        planets: keys.map(label),
      });
    }
  }
  for (const [h, keys] of Object.entries(byHouse)) {
    if (keys.length >= 3) {
      stelliums.push({
        label: `მე-${h} სახლში`,
        planets: keys.map(label),
      });
    }
  }

  const retrogrades = Object.entries(chart.bodies)
    .filter(([key, p]) => POINT_WEIGHTS[key] !== undefined && p.retrograde)
    .map(([key]) => ({ key, label: label(key) }));

  return {
    elements,
    modality,
    tightestAspects,
    angularPlanets,
    stelliums,
    retrogrades,
  };
}
