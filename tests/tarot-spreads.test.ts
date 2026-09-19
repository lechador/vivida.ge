import { describe, expect, it } from "vitest";

import { TAROT_SPREADS, tarotSpreadById } from "@/lib/tarot/spreads";

const GEORGIAN = /[ა-ჰ]/;

describe("tarot spreads", () => {
  it("offers the situation, relationship and choice spreads", () => {
    expect(TAROT_SPREADS.map((spread) => spread.id)).toEqual([
      "situation",
      "relationship",
      "choice",
    ]);
  });

  it("defines three localized positions per spread", () => {
    for (const spread of TAROT_SPREADS) {
      for (const locale of ["ka", "en"] as const) {
        expect(spread.positions[locale]).toHaveLength(3);
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

  it("resolves known spreads and rejects unknown ids", () => {
    expect(tarotSpreadById("relationship")?.id).toBe("relationship");
    expect(tarotSpreadById("situation")?.id).toBe("situation");
    expect(tarotSpreadById("nope")).toBeUndefined();
    expect(tarotSpreadById(undefined)).toBeUndefined();
  });
});
