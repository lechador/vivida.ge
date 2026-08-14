import { describe, expect, it } from "vitest";

import type { NatalChartJson } from "@/db/schema";
import { buildEnglishChartInterpretation } from "@/lib/report-content-en";
import { buildEnglishNatalReportContent } from "@/lib/report-content-pdf-en";
import { computeChartSalience } from "@/lib/report-salience";

const chart: NatalChartJson = {
  ascendant: { longitude: 180, signIndex: 6, signDegree: 0, house: 1 },
  midheaven: { longitude: 90, signIndex: 3, signDegree: 0, house: 10 },
  bodies: {
    sun: { longitude: 15, signIndex: 0, signDegree: 15, house: 7 },
    moon: { longitude: 75, signIndex: 2, signDegree: 15, house: 9 },
    mercury: { longitude: 25, signIndex: 0, signDegree: 25, house: 7 },
    venus: { longitude: 45, signIndex: 1, signDegree: 15, house: 8 },
    mars: { longitude: 105, signIndex: 3, signDegree: 15, house: 10 },
    jupiter: { longitude: 135, signIndex: 4, signDegree: 15, house: 11 },
    saturn: { longitude: 165, signIndex: 5, signDegree: 15, house: 12 },
    uranus: { longitude: 195, signIndex: 6, signDegree: 15, house: 1 },
    neptune: { longitude: 225, signIndex: 7, signDegree: 15, house: 2 },
    pluto: { longitude: 255, signIndex: 8, signDegree: 15, house: 3 },
  },
  houses: Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    cuspLongitude: index * 30,
    signIndex: index,
  })),
  aspects: [
    {
      a: "moon",
      b: "sun",
      kind: "sextile",
      family: "harmonic",
      orb: 0,
      intensity: 1,
    },
  ],
};

describe("buildEnglishChartInterpretation", () => {
  it("builds every report content section in English", () => {
    const result = buildEnglishChartInterpretation(chart);
    const serialized = JSON.stringify(result);

    expect(result.summary).toContain("Aries Sun");
    expect(result.bigThree?.moon).toContain("Moon in Gemini");
    expect(Object.keys(result.planets ?? {})).toHaveLength(8);
    expect(Object.keys(result.houses ?? {})).toHaveLength(12);
    expect(Object.keys(result.aspects ?? {})).toEqual(["moon-sun-sextile"]);
    expect(result.highlights?.length).toBeGreaterThanOrEqual(3);
    expect(serialized).not.toMatch(/[ა-ჰ]/);
  });

  it("builds the complete paid PDF narrative without Georgian prose", () => {
    const result = buildEnglishNatalReportContent(
      chart,
      computeChartSalience(chart),
      "Alex",
    );
    const serialized = JSON.stringify(result);

    expect(result.narrative).not.toBeNull();
    expect(result.narrative!.signature).toContain("Aries Sun");
    expect(result.narrative!.closing).toContain("Alex, your natal chart");
    expect(Object.keys(result.planets ?? {})).toHaveLength(11);
    expect(Object.keys(result.houses ?? {})).toHaveLength(12);
    expect(serialized).not.toMatch(/[ა-ჰ]/);
  });
});
