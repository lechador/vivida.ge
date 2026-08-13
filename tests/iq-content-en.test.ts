import { describe, expect, it } from "vitest";

import {
  DOMAIN_LABELS_EN,
  IQ_ITEMS,
  STEM_PROMPT_EN,
} from "@/lib/iq/items";
import { TESTS } from "@/lib/tests-catalog";

const GEORGIAN = /[ა-ჰ]/;

describe("English test content", () => {
  it("provides complete English IQ prompts and text answers", () => {
    const logicItems = IQ_ITEMS.filter((item) => item.stem.type === "logic");
    expect(logicItems.length).toBeGreaterThan(0);

    for (const item of logicItems) {
      if (item.stem.type !== "logic") continue;
      expect(item.stem.textEn).not.toMatch(GEORGIAN);
      expect(item.stem.textEn.length).toBeGreaterThan(12);
      for (const option of item.options) {
        if (option.kind !== "text") continue;
        expect(option.textEn).toBeTruthy();
        expect(option.textEn).not.toMatch(GEORGIAN);
      }
    }
  });

  it("keeps English IQ labels free of Georgian copy", () => {
    expect(JSON.stringify(DOMAIN_LABELS_EN)).not.toMatch(GEORGIAN);
    expect(JSON.stringify(STEM_PROMPT_EN)).not.toMatch(GEORGIAN);
  });

  it("provides English catalog copy for every test", () => {
    expect(TESTS).toHaveLength(6);
    for (const test of TESTS) {
      const copy = [test.titleEn, test.taglineEn, test.descEn, test.metaEn];
      expect(copy.every(Boolean)).toBe(true);
      expect(JSON.stringify(copy)).not.toMatch(GEORGIAN);
    }
  });
});
