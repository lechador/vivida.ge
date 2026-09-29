import { describe, expect, it } from "vitest";

import { moonEventForDate, moonEvents } from "@/lib/seo/moon-events";

describe("moon event detail URLs", () => {
  it.each([
    ["full", "2026-07-29"],
    ["new", "2027-04-06"],
    ["new", "2027-05-06"],
    ["new", "2027-09-30"],
    ["full", "2027-07-18"],
    ["full", "2028-02-10"],
  ] as const)(
    "resolves the %s moon on %s independently of the rolling horizon",
    (kind, iso) => {
      const event = moonEventForDate(kind, iso);
      expect(event?.iso).toBe(iso);
      expect(event?.kind).toBe(kind);
    },
  );

  it("keeps the upcoming discovery list narrow", () => {
    const asOf = new Date("2026-09-29T12:00:00Z");
    expect(
      moonEvents("new", 210, asOf).some((event) => event.iso === "2027-09-30"),
    ).toBe(false);
    expect(moonEventForDate("new", "2027-09-30")?.iso).toBe("2027-09-30");
  });

  it.each(["not-a-date", "2027-02-30", "2027-04-07", "2027-09-29"])(
    "rejects invalid or non-event dates: %s",
    (iso) => expect(moonEventForDate("new", iso)).toBeNull(),
  );
});
