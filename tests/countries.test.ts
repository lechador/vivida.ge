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
    expect(countryOptions("en").find((country) => country.code === "GB")?.name)
      .toBe("United Kingdom");
  });
});
