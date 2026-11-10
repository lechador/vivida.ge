import { describe, expect, it } from "vitest";

import {
  computeTransits,
  localDateString,
  transitInstantForLocalDate,
} from "@/lib/transits";

/**
 * computeTransits reads the UTC calendar date of its input (noon UTC). The
 * daily cache is keyed by the user's LOCAL date, so the sky must be computed
 * from that key, not from `now`.
 */
describe("transitInstantForLocalDate", () => {
  it("returns noon UTC of the local date, with optional day offset", () => {
    expect(transitInstantForLocalDate("2026-11-11").toISOString()).toBe(
      "2026-11-11T12:00:00.000Z",
    );
    expect(transitInstantForLocalDate("2026-11-30", 1).toISOString()).toBe(
      "2026-12-01T12:00:00.000Z",
    );
  });

  it("Asia/Tbilisi 21:30Z is already the next local day", () => {
    const now = new Date("2026-11-10T21:30:00Z");
    const key = localDateString(now, "Asia/Tbilisi");
    expect(key).toBe("2026-11-11");
    const instant = transitInstantForLocalDate(key);
    expect(instant.getUTCDate()).toBe(11);
    // Different sky than computing from `now` (UTC Nov 10).
    const fixed = computeTransits(instant).moon!.longitude;
    const buggy = computeTransits(now).moon!.longitude;
    expect(fixed).toBeGreaterThan(buggy + 5);
    expect(fixed).toBe(
      computeTransits(new Date("2026-11-11T12:00:00Z")).moon!.longitude,
    );
    expect(buggy).toBe(
      computeTransits(new Date("2026-11-10T12:00:00Z")).moon!.longitude,
    );
  });

  it("America/New_York 03:00Z is still the previous local day", () => {
    const now = new Date("2026-11-10T03:00:00Z");
    const key = localDateString(now, "America/New_York");
    expect(key).toBe("2026-11-09");
    expect(transitInstantForLocalDate(key).getUTCDate()).toBe(9);
  });

  it("Europe/Warsaw: local date key drives the instant", () => {
    const late = new Date("2026-11-10T23:30:00Z"); // 00:30 Nov 11 in Warsaw
    expect(localDateString(late, "Europe/Warsaw")).toBe("2026-11-11");
    expect(
      transitInstantForLocalDate(localDateString(late, "Europe/Warsaw"))
        .toISOString()
        .slice(0, 10),
    ).toBe("2026-11-11");
    const mid = new Date("2026-11-10T12:00:00Z");
    expect(localDateString(mid, "Europe/Warsaw")).toBe("2026-11-10");
  });
});
