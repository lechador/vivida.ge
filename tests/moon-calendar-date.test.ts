import { describe, expect, it } from "vitest";

import { tbilisiCalendarParts, tbilisiNoonUtc } from "@/lib/moon-calendar-date";

describe("Tbilisi calendar date", () => {
  it("rolls over at Tbilisi midnight, including month and year", () => {
    expect(
      tbilisiCalendarParts(new Date("2026-12-31T19:59:00Z")),
    ).toMatchObject({
      year: 2026,
      month: 11,
      day: 31,
      hour: 23,
      minute: 59,
    });
    expect(
      tbilisiCalendarParts(new Date("2026-12-31T20:01:00Z")),
    ).toMatchObject({
      year: 2027,
      month: 0,
      day: 1,
      hour: 0,
      minute: 1,
    });
  });

  it("starts the 30-day samples at the new local day's noon", () => {
    expect(tbilisiNoonUtc(new Date("2026-09-30T19:59:00Z")).toISOString()).toBe(
      "2026-09-30T08:00:00.000Z",
    );
    expect(tbilisiNoonUtc(new Date("2026-09-30T20:01:00Z")).toISOString()).toBe(
      "2026-10-01T08:00:00.000Z",
    );
  });
});
