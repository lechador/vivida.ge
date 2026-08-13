import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/synastry";
import {
  ASPECT_LABEL_EN,
  BODY_LABEL_EN,
  CATEGORY_DESCRIPTOR_EN,
  CATEGORY_LABEL_EN,
  ELEMENT_LABEL_EN,
  HOUSE_LABEL_EN,
  categoryNarrativeEn,
  describeAspectEn,
  describeOverlayEn,
  overallNarrativeEn,
  overallVerdictEn,
} from "@/lib/synastry-en";

const GEORGIAN = /[ა-ჰ]/;

describe("English synastry content", () => {
  it("covers every compatibility category without Georgian copy", () => {
    expect(Object.keys(CATEGORY_LABEL_EN)).toEqual(CATEGORIES);
    expect(Object.keys(CATEGORY_DESCRIPTOR_EN)).toEqual(CATEGORIES);
    for (const category of CATEGORIES) {
      expect(categoryNarrativeEn(category, 72)).not.toMatch(GEORGIAN);
    }
  });

  it("keeps every deterministic English label and narrative in English", () => {
    const copy = {
      aspects: ASPECT_LABEL_EN,
      bodies: BODY_LABEL_EN,
      elements: ELEMENT_LABEL_EN,
      houses: HOUSE_LABEL_EN,
      verdicts: [24, 35, 47, 58, 70, 82, 92].map(overallVerdictEn),
      narratives: [30, 50, 65, 85].map(overallNarrativeEn),
      aspect: describeAspectEn({
        a: "moon",
        b: "venus",
        kind: "trine",
        orb: 1.2,
        tightness: 0.9,
      }),
      overlay: describeOverlayEn("sun", 7),
    };
    expect(JSON.stringify(copy)).not.toMatch(GEORGIAN);
  });
});
