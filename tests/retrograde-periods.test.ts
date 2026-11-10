import { describe, expect, it } from "vitest";

import {
  computeMercuryRetrogradePeriods,
  mercuryRetrogradePeriods,
} from "@/lib/retrograde";

// Output of the original per-request algorithm (daily ephemeris scan),
// captured before the memoisation was added.
const EXPECTED: Record<number, string[][]> = {
  2026: [
    ["2026-02-27", "2026-03-20", "Pisces", "Pisces"],
    ["2026-06-30", "2026-07-23", "Cancer", "Cancer"],
    ["2026-10-25", "2026-11-13", "Scorpio", "Scorpio"],
  ],
  2027: [
    ["2027-02-10", "2027-03-03", "Pisces", "Aquarius"],
    ["2027-06-11", "2027-07-04", "Cancer", "Gemini"],
    ["2027-10-08", "2027-10-28", "Scorpio", "Libra"],
  ],
};

const flat = (periods: ReturnType<typeof mercuryRetrogradePeriods>) =>
  periods.map((p) => [p.startIso, p.endIso, p.startSignEn, p.endSignEn]);

describe("mercuryRetrogradePeriods", () => {
  for (const year of [2026, 2027]) {
    it(`matches the original algorithm for ${year}`, () => {
      expect(flat(computeMercuryRetrogradePeriods(year))).toEqual(
        EXPECTED[year],
      );
      expect(flat(mercuryRetrogradePeriods(year))).toEqual(EXPECTED[year]);
    });
  }

  it("memoises per year (same reference on repeat calls)", () => {
    expect(mercuryRetrogradePeriods(2026)).toBe(mercuryRetrogradePeriods(2026));
  });
});
