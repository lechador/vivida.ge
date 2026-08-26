import { describe, expect, it } from "vitest";

import type { NatalChartJson } from "@/db/schema";
import {
  computeRelationshipWeekly,
  relationshipWeekStart,
} from "@/lib/relationship-weekly";

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
  aspects: [],
};

describe("recurring relationship weekly update", () => {
  it("anchors every date in a timezone to Monday", () => {
    expect(relationshipWeekStart(new Date("2026-08-26T20:30:00Z"), "Asia/Tbilisi")).toBe("2026-08-24");
    expect(relationshipWeekStart(new Date("2026-08-23T20:30:00Z"), "Asia/Tbilisi")).toBe("2026-08-24");
  });

  it("is deterministic, seven days long, and keeps the scores balanced", () => {
    const at = new Date("2026-08-26T10:00:00Z");
    const first = computeRelationshipWeekly(chart, chart, at, "Asia/Tbilisi", "ka");
    const second = computeRelationshipWeekly(chart, chart, at, "Asia/Tbilisi", "ka");
    expect(first).toEqual(second);
    expect(first.weekStart).toBe("2026-08-24");
    expect(first.days).toHaveLength(7);
    expect(first.questions).toHaveLength(3);
    expect(first.harmonyScore + first.challengeScore).toBe(100);
    expect(new Set(first.questions.map((question) => question.key)).size).toBe(3);
  });

  it("renders Armenian recurring copy without Georgian text", () => {
    const result = computeRelationshipWeekly(chart, chart, new Date("2026-08-26T10:00:00Z"), "Asia/Yerevan", "am");
    expect(JSON.stringify(result)).not.toMatch(/[ა-ჰ]/);
  });
});
