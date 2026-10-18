import { describe, expect, it } from "vitest";

import {
  COUNTRY_CODES,
  countryFlagEmoji,
  countryOptions,
  isCountryCode,
} from "@/lib/countries";

describe("country catalogue", () => {
  it("contains unique ISO country codes including Georgia and the UK", () => {
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length);
    expect(isCountryCode("ge")).toBe(true);
    expect(isCountryCode("GB")).toBe(true);
    expect(isCountryCode("UK")).toBe(false);
  });

  it("creates country labels and flags", () => {
    expect(countryFlagEmoji("GE")).toBe("🇬🇪");
    expect(countryFlagEmoji("GB")).toBe("🇬🇧");
    expect(countryFlagEmoji("AM")).toBe("🇦🇲");
    expect(
      countryOptions("en").find((country) => country.code === "GB")?.name,
    ).toBe("United Kingdom");
    expect(
      countryOptions("ka").find((country) => country.code === "AM")?.name,
    ).toBe("სომხეთი");
    expect(
      countryOptions("ka").find((country) => country.code === "GE")?.name,
    ).toBe("საქართველო");
    expect(isCountryCode("AM")).toBe(true);
  });
});
