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
import {
  getSynastryLibraryEntriesEn,
  getSynastryInterpretationsFor,
} from "@/lib/synastry-library";
import {
  aspectBreakdown,
  describeAspect,
  narrateCategory,
  overallNarrative,
  synastryAspectKey,
  synastryOverlayKey,
} from "@/lib/synastry-interpretation";
import { aspectDetailContent } from "@/lib/synastry-aspects-content";

const GEORGIAN = /[ა-ჰ]/;

describe("English synastry content", () => {
  it("covers every compatibility category without Georgian copy", () => {
    expect(Object.keys(CATEGORY_LABEL_EN)).toEqual(CATEGORIES);
    expect(Object.keys(CATEGORY_DESCRIPTOR_EN)).toEqual(CATEGORIES);
    for (const category of CATEGORIES) {
      expect(categoryNarrativeEn(category, 72)).not.toMatch(GEORGIAN);
      expect(narrateCategory(category, 72, "en")).not.toMatch(GEORGIAN);
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
      overallNarr: overallNarrative(85, "en"),
      aspect: describeAspectEn({
        a: "moon",
        b: "venus",
        kind: "trine",
        orb: 1.2,
        tightness: 0.9,
      }),
      aspectDesc: describeAspect(
        {
          a: "moon",
          b: "venus",
          kind: "trine",
          orb: 1.2,
          tightness: 0.9,
        },
        "en"
      ),
      overlay: describeOverlayEn("sun", 7),
    };
    expect(JSON.stringify(copy)).not.toMatch(GEORGIAN);
  });

  it("provides full English translations for all 611 library entries", () => {
    const entries = getSynastryLibraryEntriesEn([
      synastryAspectKey("sun", "moon", "trine"),
      synastryAspectKey("venus", "mars", "conjunction"),
      synastryOverlayKey("venus", 7),
      synastryOverlayKey("sun", 1),
    ]);

    expect(entries.size).toBe(4);
    for (const text of entries.values()) {
      expect(text.length).toBeGreaterThan(80);
      expect(text).not.toMatch(GEORGIAN);
    }
  });

  it("provides full English aspect details with positive, negative, and takeaway", () => {
    const detail = aspectDetailContent("trine", "sun", "moon", "en");
    expect(detail).not.toBeNull();
    expect(detail!.positive.length).toBeGreaterThan(80);
    expect(detail!.negative.length).toBeGreaterThan(80);
    expect(detail!.takeaway.length).toBeGreaterThan(30);
    expect(JSON.stringify(detail)).not.toMatch(GEORGIAN);

    const breakdown = aspectBreakdown(
      {
        a: "sun",
        b: "moon",
        kind: "trine",
        orb: 0.5,
        tightness: 0.95,
      },
      "en"
    );

    expect(breakdown.title).toBe("Sun △ Moon");
    expect(breakdown.tightnessNote).toContain("Very exact aspect");
    expect(breakdown.aspectMeaning).toContain("natural flow");
    expect(breakdown.bodyADescription).toContain("core identity");
    expect(breakdown.bodyBDescription).toContain("emotional world");
    expect(JSON.stringify(breakdown)).not.toMatch(GEORGIAN);
  });

  it("asynchronously returns English interpretations for synastry results", async () => {
    const texts = await getSynastryInterpretationsFor(
      {
        topAspects: [{ a: "sun", b: "moon", kind: "trine" }],
        breakdown: { topOverlays: [{ body: "venus", house: 7 }] },
      },
      "en"
    );

    expect(Object.keys(texts)).toEqual([
      "aspect:moon-sun-trine",
      "overlay:venus-7",
    ]);
    expect(texts["aspect:moon-sun-trine"].length).toBeGreaterThan(100);
    expect(texts["overlay:venus-7"].length).toBeGreaterThan(80);
    expect(JSON.stringify(texts)).not.toMatch(GEORGIAN);
  });
});
