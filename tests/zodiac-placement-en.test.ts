import { describe, expect, it } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { placementEnglish } from "@/lib/zodiac-placement-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English zodiac placement content", () => {
  it.each(["moon", "rising"] as const)(
    "provides complete, English-only %s content for all signs",
    (kind) => {
      const titles = new Set<string>();

      for (const sign of ALL_SLUGS) {
        const content = placementEnglish(kind, sign);
        const serialized = JSON.stringify(content);

        expect(content.title.length).toBeGreaterThan(30);
        expect(content.description.length).toBeGreaterThan(70);
        expect(content.intro.length).toBeGreaterThan(180);
        expect(content.sections).toHaveLength(4);
        expect(content.sections.every((section) => section.body.length > 120)).toBe(true);
        expect(serialized).not.toMatch(GEORGIAN);
        titles.add(content.title);
      }

      expect(titles.size).toBe(ALL_SLUGS.length);
    },
  );
});
