import { describe, expect, it } from "vitest";

import { validateCoordinates } from "@/lib/geocoding";

/**
 * The manual coordinate fallback exists because the geocoded birthplace search
 * is a network dependency, and a birthplace missing from the geocoder used to be
 * a hard dead end on the last onboarding step — after the user had already given
 * their birth date and time.
 *
 * These tests pin the input validation, which is pure and runs on every submit.
 */

describe("validateCoordinates", () => {
  it("accepts ordinary decimal coordinates", () => {
    expect(validateCoordinates("41.6938", "44.8015")).toEqual({
      ok: true,
      latitude: 41.6938,
      longitude: 44.8015,
    });
  });

  it("accepts a comma decimal separator", () => {
    // Georgian/European users type "41,69" by habit.
    expect(validateCoordinates("41,69", "44,80")).toEqual({
      ok: true,
      latitude: 41.69,
      longitude: 44.8,
    });
  });

  it("accepts negative coordinates for the southern and western hemispheres", () => {
    expect(validateCoordinates("-33.8688", "-151.2093")).toEqual({
      ok: true,
      latitude: -33.8688,
      longitude: -151.2093,
    });
  });

  it("accepts the boundary values", () => {
    expect(validateCoordinates("90", "180").ok).toBe(true);
    expect(validateCoordinates("-90", "-180").ok).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    expect(validateCoordinates("  41.69  ", " 44.80 ")).toEqual({
      ok: true,
      latitude: 41.69,
      longitude: 44.8,
    });
  });

  it("rejects empty input", () => {
    expect(validateCoordinates("", "44.80")).toEqual({
      ok: false,
      reason: "empty",
    });
    expect(validateCoordinates("41.69", "   ")).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("rejects non-numeric input", () => {
    expect(validateCoordinates("tbilisi", "44.80")).toEqual({
      ok: false,
      reason: "not_a_number",
    });
    expect(validateCoordinates("41.69", "east")).toEqual({
      ok: false,
      reason: "not_a_number",
    });
  });

  it("rejects out-of-range values rather than clamping them", () => {
    // Clamping would silently place the user somewhere they were not born.
    expect(validateCoordinates("91", "44.80")).toEqual({
      ok: false,
      reason: "out_of_range",
    });
    expect(validateCoordinates("41.69", "181")).toEqual({
      ok: false,
      reason: "out_of_range",
    });
    expect(validateCoordinates("-90.5", "0")).toEqual({
      ok: false,
      reason: "out_of_range",
    });
  });

  it("rejects infinities and NaN spellings", () => {
    expect(validateCoordinates("Infinity", "0").ok).toBe(false);
    expect(validateCoordinates("NaN", "0").ok).toBe(false);
  });

  it("accepts zero, which is a real coordinate", () => {
    // Null Island is a legitimate (if unlikely) birth location, and a falsy
    // check would wrongly reject it.
    expect(validateCoordinates("0", "0")).toEqual({
      ok: true,
      latitude: 0,
      longitude: 0,
    });
  });
});
