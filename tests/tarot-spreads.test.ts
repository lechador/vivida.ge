import { describe, expect, it } from "vitest";

import {
  TAROT_SPREADS,
  tarotSpreadById,
  tarotSpreadCost,
} from "@/lib/tarot/spreads";

const GEORGIAN = /[ა-ჰ]/;

describe("tarot spreads", () => {
  it("offers the situation, relationship, choice, love and yes-no spreads", () => {
    expect(TAROT_SPREADS.map((spread) => spread.id)).toEqual([
      "situation",
      "relationship",
      "choice",
      "love_5",
      "yes_no",
    ]);
  });

  it("defines localized positions per spread", () => {
    const expectedLengths: Record<string, number> = {
      situation: 3,
      relationship: 3,
      choice: 3,
      love_5: 5,
      yes_no: 3,
    };
    for (const spread of TAROT_SPREADS) {
      for (const locale of ["ka", "en"] as const) {
        expect(spread.positions[locale]).toHaveLength(
          expectedLengths[spread.id],
        );
        for (const position of spread.positions[locale]) {
          expect(position.length).toBeGreaterThan(2);
        }
      }
      for (const position of spread.positions.en) {
        expect(position).not.toMatch(GEORGIAN);
      }
      for (const position of spread.positions.ka) {
        expect(position).toMatch(/[ა-ჰ]/);
      }
    }
  });

  it("prices the love spread above the standard spreads", () => {
    expect(tarotSpreadCost("love_5")).toBe(15);
    expect(tarotSpreadCost("yes_no")).toBe(5);
    expect(tarotSpreadCost("situation")).toBe(10);
    expect(tarotSpreadCost("relationship")).toBe(10);
    expect(tarotSpreadCost("choice")).toBe(10);
  });

  it("resolves known spreads and rejects unknown ids", () => {
    expect(tarotSpreadById("relationship")?.id).toBe("relationship");
    expect(tarotSpreadById("situation")?.id).toBe("situation");
    expect(tarotSpreadById("love_5")?.id).toBe("love_5");
    expect(tarotSpreadById("yes_no")?.id).toBe("yes_no");
    expect(tarotSpreadById("nope")).toBeUndefined();
    expect(tarotSpreadById(undefined)).toBeUndefined();
  });
});
