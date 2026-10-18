import { describe, expect, it } from "vitest";

import { englishMoonPhaseReading } from "@/lib/moon-phase-en";
import type { MoonPhaseSnapshot } from "@/lib/moon-phase";

describe("englishMoonPhaseReading", () => {
  it("returns a complete English reading", () => {
    const snapshot: MoonPhaseSnapshot = {
      phaseKey: "full_moon",
      phaseLabelKa: "სავსე მთვარე",
      phaseAngle: 180,
      moonLongitude: 120,
      sunLongitude: 300,
      illumination: 1,
      ageDays: 14.8,
      signIndex: 4,
      signKa: "ლომი",
      signEn: "Leo",
      signSymbol: "♌",
    };

    const result = englishMoonPhaseReading(snapshot);
    const serialized = JSON.stringify(result);

    expect(result.headline).toBe("Full Moon in Leo");
    expect(result.themes).toHaveLength(3);
    expect(serialized).not.toMatch(/[ა-ჰ]/);
  });
});
