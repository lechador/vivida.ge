import { describe, expect, it } from "vitest";

import {
  ASPECT_LABELS_PL,
  bodyLabel,
  bodyName,
  elementLabel,
  modalityLabel,
  plSignGenitive,
  plSignLocative,
  signGenitive,
  signLabel,
  signLocative,
  signName,
  SIGNS,
} from "@/lib/zodiac";
import { polishMoonPhaseReading } from "@/lib/moon-phase-pl";
import type { MoonPhaseSnapshot } from "@/lib/moon-phase";
import { detectDistress, buildMemoryBlock } from "@/lib/ask-memory-pure";
import { mbtiArchetypePl, AXIS_LABEL_PL } from "@/lib/mbti-questions";
import { buildChartChatSystem } from "@/lib/chart-chat";
import { computeChartSalience } from "@/lib/report-salience";
import type { NatalChartJson } from "@/db/schema";

describe("Stage 3 Polish Astrological Core", () => {
  it("translates and inflects all 12 zodiac signs in Polish correctly", () => {
    expect(SIGNS).toHaveLength(12);
    for (const sign of SIGNS) {
      expect(sign.labelPl).toBeTruthy();
      expect(signLabel(sign, "pl")).toBe(sign.labelPl);
      expect(plSignGenitive(sign.key)).toBeTruthy();
      expect(plSignLocative(sign.key)).toBeTruthy();
      expect(signGenitive(sign.key, "pl")).toBe(plSignGenitive(sign.key));
      expect(signLocative(sign.key, "pl")).toBe(plSignLocative(sign.key));
    }

    expect(signName(0, "pl")).toBe("Baran");
    expect(signName(7, "pl")).toBe("Skorpion");
    expect(signGenitive("scorpio", "pl")).toBe("Skorpiona");
    expect(signLocative("scorpio", "pl")).toBe("w Skorpionie");
    expect(signLocative("taurus", "pl")).toBe("w Byku");
    expect(signLocative("gemini", "pl")).toBe("w Bliźniętach");
    expect(signLocative("cancer", "pl")).toBe("w Raku");
    expect(signLocative("leo", "pl")).toBe("w Lwie");
    expect(signLocative("virgo", "pl")).toBe("w Pannie");
    expect(signLocative("libra", "pl")).toBe("w Wadze");
    expect(signLocative("sagittarius", "pl")).toBe("w Strzelcu");
    expect(signLocative("capricorn", "pl")).toBe("w Koziorożcu");
    expect(signLocative("aquarius", "pl")).toBe("w Wodniku");
    expect(signLocative("pisces", "pl")).toBe("w Rybach");
  });

  it("translates celestial bodies, elements, modalities, and aspects in Polish", () => {
    expect(bodyLabel("sun", "pl")).toBe("Słońce");
    expect(bodyLabel("moon", "pl")).toBe("Księżyc");
    expect(bodyLabel("ascendant", "pl")).toBe("Ascendent");
    expect(bodyName("venus", "pl")).toBe("Wenus");

    expect(elementLabel("fire", "pl")).toBe("Ogień");
    expect(elementLabel("water", "pl")).toBe("Woda");
    expect(modalityLabel("cardinal", "pl")).toBe("Kardynalny");
    expect(modalityLabel("fixed", "pl")).toBe("Stały");

    expect(ASPECT_LABELS_PL.conjunction).toBe("koniunkcja");
    expect(ASPECT_LABELS_PL.trine).toBe("trygon");
    expect(ASPECT_LABELS_PL.square).toBe("kwadratura");
    expect(ASPECT_LABELS_PL.opposition).toBe("opozycja");
  });

  it("generates deterministic Polish moon phase readings without other-script copy", () => {
    const snapshot: MoonPhaseSnapshot = {
      phaseKey: "full_moon",
      phaseLabelKa: "სავსე მთვარე",
      phaseLabelPl: "Pełnia Księżyca",
      phaseAngle: 180,
      moonLongitude: 120,
      sunLongitude: 300,
      illumination: 1,
      ageDays: 14.8,
      signIndex: 4,
      signKa: "ლომი",
      signEn: "Leo",
      signPl: "Lew",
      signSymbol: "♌",
    };

    const reading = polishMoonPhaseReading(snapshot);
    expect(reading.headline).toBe("Pełnia Księżyca w Lwie");
    expect(reading.themes.length).toBeGreaterThanOrEqual(3);
    expect(reading.body.length).toBeGreaterThan(50);
    const serialized = JSON.stringify(reading);
    expect(serialized).not.toMatch(/[ა-ჰ]/);
  });

  it("detects emotional distress keywords in Polish", () => {
    expect(detectDistress("Nie mam już siły żyć, chcę umrzeć")).toBe("crisis");
    expect(detectDistress("Czuję myśli samobójcze i bezsens")).toBe("crisis");
    expect(detectDistress("Jakie mam dziś tranzyty Wenus?")).toBe("none");
  });

  it("builds Polish memory block for AI astrologer", () => {
    const memoryBlock = buildMemoryBlock(
      {
        userId: "user-123",
        summary: "Użytkownik interesuje się relacjami i pracą.",
        traits: {
          tone: "Ciepły i dociekliwy.",
          topics: ["kariera", "partnerstwo"],
          notes: "Urodzony z Księżycem w Rybach.",
        },
        turnsSeen: 2,
        nudgesEnabled: true,
        updatedAt: new Date(),
      },
      "pl",
    );
    expect(memoryBlock).toContain("Co pamiętasz o tej osobie");
    expect(memoryBlock).toContain(
      "Użytkownik interesuje się relacjami i pracą.",
    );
    expect(memoryBlock).not.toMatch(/[ა-ჰ]/);
  });

  it("returns Polish MBTI archetypes and axis labels", () => {
    expect(AXIS_LABEL_PL.EI).toEqual(["Ekstrawersja", "Introwersja"]);
    expect(mbtiArchetypePl("INFJ")).toBe("Rzecznik");
    expect(mbtiArchetypePl("INTJ")).toBe("Architekt");
    expect(mbtiArchetypePl("ENFP")).toBe("Działacz");
    expect(mbtiArchetypePl("ESTP")).toBe("Przedsiębiorca");
  });

  it("builds Polish system prompt for chart chat with 'Ty' form and no other-script copy", () => {
    const mockChart: NatalChartJson = {
      ascendant: { signIndex: 0, signDegree: 15.0, longitude: 15.0 },
      midheaven: { signIndex: 9, signDegree: 10.0, longitude: 280.0 },
      houses: [],
      bodies: {
        sun: { signIndex: 0, signDegree: 10.5, longitude: 10.5, house: 1 },
        moon: { signIndex: 3, signDegree: 22.1, longitude: 112.1, house: 4 },
      },
    };

    const salience = computeChartSalience(mockChart);
    const system = buildChartChatSystem("Kamil", mockChart, salience, "pl", "");

    expect(system).toContain(
      "Jesteś osobistym astrologiem Kamil na platformie Vivida",
    );
    expect(system).toContain("Zwracaj się bezpośrednio na «Ty»");
    expect(system).toContain("Kamil");
    expect(system).toContain("Baran");
    expect(system).not.toMatch(/[ა-ჰ]/);
  });
});
