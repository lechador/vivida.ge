import { describe, expect, it } from "vitest";

import { buildCalculatorData } from "@/lib/compatibility-calculator-data";

const GEORGIAN = /[ა-ჰ]/;

describe("English compatibility calculator data", () => {
  it("provides all signs and pairs without Georgian copy", () => {
    const data = buildCalculatorData("en");
    expect(data.signs).toHaveLength(12);
    expect(Object.keys(data.pairs)).toHaveLength(78);
    expect(JSON.stringify(data)).not.toMatch(GEORGIAN);
  });
});
