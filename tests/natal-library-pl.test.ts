import { describe, expect, it } from "vitest";

import {
  getLibraryEntryPl,
  getHouseLibraryEntryPl,
  getAspectLibraryEntryPl,
  interpPl,
  housePl,
  aspectPl,
} from "@/lib/natal-library-pl";
import {
  getLibraryEntry,
  getHouseLibraryEntry,
  getAspectLibraryEntry,
} from "@/lib/natal-library-en";
import {
  getSynastryInterpretationsFor,
  synastryLibPl,
} from "@/lib/synastry-library";
import { aspectDetailContent } from "@/lib/synastry-aspects-content";
import { buildPolishChartInterpretation } from "@/lib/report-content-pl";
import type { NatalChartJson } from "@/db/schema";

import interpEn from "@/lib/seo/interpretation-library-en.json";
import houseEn from "@/lib/seo/house-library-en.json";
import aspectEn from "@/lib/seo/aspect-library-en.json";
import synastryLibEn from "@/lib/seo/synastry-library-en.json";
import synastryAspectsEn from "@/lib/seo/synastry-aspects-en.json";
import synastryAspectsPl from "@/lib/seo/synastry-aspects-pl.json";

describe("Polish Static Astrology Libraries", () => {
  it("has 100% key parity for interpretation-library (132 keys)", () => {
    const enKeys = Object.keys(interpEn);
    const plKeys = Object.keys(interpPl);
    expect(enKeys.length).toBe(132);
    expect(plKeys.length).toBe(132);
    for (const key of enKeys) {
      const val = (interpPl as Record<string, string>)[key];
      expect(typeof val).toBe("string");
      expect(val.trim().length).toBeGreaterThan(20);
    }
  });

  it("has 100% key parity for house-library (276 keys)", () => {
    const enKeys = Object.keys(houseEn);
    const plKeys = Object.keys(housePl);
    expect(enKeys.length).toBe(276);
    expect(plKeys.length).toBe(276);
    for (const key of enKeys) {
      const val = (housePl as Record<string, string>)[key];
      expect(typeof val).toBe("string");
      expect(val.trim().length).toBeGreaterThan(20);
    }
  });

  it("has 100% key parity for aspect-library (390 keys)", () => {
    const enKeys = Object.keys(aspectEn);
    const plKeys = Object.keys(aspectPl);
    expect(enKeys.length).toBe(390);
    expect(plKeys.length).toBe(390);
    for (const key of enKeys) {
      const val = (aspectPl as Record<string, string>)[key];
      expect(typeof val).toBe("string");
      expect(val.trim().length).toBeGreaterThan(20);
    }
  });

  it("has 100% key parity for synastry-library (611 keys)", () => {
    const enKeys = Object.keys(synastryLibEn);
    const plKeys = Object.keys(synastryLibPl);
    expect(enKeys.length).toBe(611);
    expect(plKeys.length).toBe(611);
    for (const key of enKeys) {
      const val = (synastryLibPl as Record<string, string>)[key];
      expect(typeof val).toBe("string");
      expect(val.trim().length).toBeGreaterThan(20);
    }
  });

  it("has 100% key parity for synastry-aspects (455 keys)", () => {
    const enKeys = Object.keys(synastryAspectsEn);
    const plKeys = Object.keys(synastryAspectsPl);
    expect(enKeys.length).toBe(455);
    expect(plKeys.length).toBe(455);
    for (const key of enKeys) {
      const val = (
        synastryAspectsPl as Record<
          string,
          { positive: string; negative: string; takeaway: string }
        >
      )[key];
      expect(typeof val).toBe("object");
      expect(val.positive.trim().length).toBeGreaterThan(20);
      expect(val.negative.trim().length).toBeGreaterThan(20);
      expect(val.takeaway.trim().length).toBeGreaterThan(20);
    }
  });

  it("retrieves individual Polish library entries via getters", () => {
    const sunCap = getLibraryEntryPl("sun", "capricorn");
    expect(sunCap).toBeDefined();
    expect(sunCap).toContain("Twoja energia życiowa");

    const cusp1Scorpio = getHouseLibraryEntryPl("cusp", 1, "scorpio");
    expect(cusp1Scorpio).toBeDefined();
    expect(cusp1Scorpio).toContain("Twoja obecność");

    const occ1Sun = getHouseLibraryEntryPl("occupant", 1, "sun");
    expect(occ1Sun).toBeDefined();
    expect(occ1Sun).toContain("Twoja siła życiowa");

    const aspectSquare = getAspectLibraryEntryPl("jupiter", "sun", "square");
    expect(aspectSquare).toBeDefined();
    expect(typeof aspectSquare).toBe("string");
  });

  it("supports unified locale-aware getters in natal-library", () => {
    const plEntry = getLibraryEntry("sun", "capricorn", "pl");
    const enEntry = getLibraryEntry("sun", "capricorn", "en");
    expect(plEntry).toBeDefined();
    expect(enEntry).toBeDefined();
    expect(plEntry).not.toBe(enEntry);
    expect(plEntry).toContain("Twoja energia życiowa");

    const plHouse = getHouseLibraryEntry("cusp", 1, "scorpio", "pl");
    const enHouse = getHouseLibraryEntry("cusp", 1, "scorpio", "en");
    expect(plHouse).toBeDefined();
    expect(enHouse).toBeDefined();
    expect(plHouse).not.toBe(enHouse);

    const plAspect = getAspectLibraryEntry("jupiter", "sun", "square", "pl");
    const enAspect = getAspectLibraryEntry("jupiter", "sun", "square", "en");
    expect(plAspect).toBeDefined();
    expect(enAspect).toBeDefined();
    expect(plAspect).not.toBe(enAspect);
  });

  it("retrieves synastry interpretations in Polish", async () => {
    const result = {
      topAspects: [
        { a: "sun", b: "sun", kind: "trine" as const },
        { a: "moon", b: "venus", kind: "conjunction" as const },
      ],
      breakdown: {
        topOverlays: [{ body: "sun", house: 5 }],
      },
    };

    const interpretations = await getSynastryInterpretationsFor(result, "pl");
    expect(interpretations["aspect:sun-sun-trine"]).toBeDefined();
    expect(interpretations["aspect:sun-sun-trine"]).toContain(
      "Trygon Słońc w parze",
    );
    expect(interpretations["overlay:sun-5"]).toBeDefined();
    expect(interpretations["overlay:sun-5"]).toContain("Piąty Dom");
  });

  it("returns Polish synastry aspect detail modal content", () => {
    const content = aspectDetailContent("conjunction", "moon", "venus", "pl");
    expect(content).not.toBeNull();
    expect(content?.positive).toContain("koniunkcj");
    expect(content?.takeaway).toBeDefined();
  });

  it("builds a full Polish chart interpretation", () => {
    const mockChart: NatalChartJson = {
      ascendant: { longitude: 135.5, signIndex: 4, signDegree: 15.5 }, // Leo
      midheaven: { longitude: 40.2, signIndex: 1, signDegree: 10.2 }, // Taurus
      houses: [
        { number: 1, cuspLongitude: 135.5, signIndex: 4 },
        { number: 2, cuspLongitude: 160.0, signIndex: 5 },
        { number: 3, cuspLongitude: 188.0, signIndex: 6 },
        { number: 4, cuspLongitude: 220.2, signIndex: 7 },
        { number: 5, cuspLongitude: 255.0, signIndex: 8 },
        { number: 6, cuspLongitude: 290.0, signIndex: 9 },
        { number: 7, cuspLongitude: 315.5, signIndex: 10 },
        { number: 8, cuspLongitude: 340.0, signIndex: 11 },
        { number: 9, cuspLongitude: 8.0, signIndex: 0 },
        { number: 10, cuspLongitude: 40.2, signIndex: 1 },
        { number: 11, cuspLongitude: 75.0, signIndex: 2 },
        { number: 12, cuspLongitude: 110.0, signIndex: 3 },
      ],
      bodies: {
        sun: { longitude: 54.3, signIndex: 1, signDegree: 24.3, house: 10 }, // Taurus
        moon: { longitude: 282.1, signIndex: 9, signDegree: 12.1, house: 6 }, // Capricorn
        mercury: { longitude: 45.0, signIndex: 1, signDegree: 15.0, house: 10 },
        venus: { longitude: 8.5, signIndex: 0, signDegree: 8.5, house: 9 },
        mars: { longitude: 350.0, signIndex: 11, signDegree: 20.0, house: 8 },
        jupiter: {
          longitude: 100.0,
          signIndex: 3,
          signDegree: 10.0,
          house: 11,
        },
        saturn: { longitude: 295.0, signIndex: 9, signDegree: 25.0, house: 6 },
        uranus: { longitude: 279.0, signIndex: 9, signDegree: 9.0, house: 5 },
        neptune: { longitude: 284.0, signIndex: 9, signDegree: 14.0, house: 6 },
        pluto: { longitude: 226.5, signIndex: 7, signDegree: 16.5, house: 4 },
      },
      aspects: [
        {
          a: "sun",
          b: "moon",
          kind: "trine",
          orb: 1.2,
          intensity: 0.85,
          family: "harmonic",
        },
      ],
    };

    const interp = buildPolishChartInterpretation(mockChart);
    expect(interp.summary).toBeDefined();
    expect(interp.summary).toContain("Twój horoskop łączy");
    expect(interp.bigThree?.sun).toBeDefined();
    expect(interp.bigThree?.moon).toBeDefined();
    expect(interp.bigThree?.ascendant).toBeDefined();
    expect(interp.planets?.mercury).toBeDefined();
    expect(interp.houses?.["1"]).toBeDefined();
    expect(interp.aspects?.["moon-sun-trine"]).toBeDefined();
    expect(interp.highlights?.length).toBeGreaterThan(0);
  });
});
