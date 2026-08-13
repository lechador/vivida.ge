import { describe, expect, it } from "vitest";

import { ALL_ELEMENT_SLUGS, SIGNS_BY_ELEMENT } from "@/lib/seo/zodiac-dates";
import { ELEMENT_ENGLISH } from "@/lib/zodiac-element-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English zodiac element content", () => {
  it("covers all four elements and all twelve signs", () => {
    const signs = new Set<string>();
    for (const element of ALL_ELEMENT_SLUGS) {
      const content = ELEMENT_ENGLISH[element];
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
      expect(content.intro.length).toBeGreaterThan(180);
      expect(content.strengths).toHaveLength(4);
      expect(content.challenges).toHaveLength(4);
      SIGNS_BY_ELEMENT[element].forEach((sign) => signs.add(sign));
    }
    expect(signs.size).toBe(12);
  });
});

