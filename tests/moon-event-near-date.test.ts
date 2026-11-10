import { describe, expect, it } from "vitest";

import { ECLIPSES, moonEventNearDate, moonEvents } from "@/lib/seo/moon-events";

describe("moonEventNearDate", () => {
  it("matches the old 1,000-day scan lookup for every future eclipse", () => {
    const asOf = new Date("2026-08-01T08:00:00Z");
    for (const eclipse of ECLIPSES) {
      const date = new Date(`${eclipse.date}T12:00:00Z`);
      if (date < asOf) continue;
      const kind = eclipse.type === "solar" ? "new" : "full";
      const old = moonEvents(kind, 1000, asOf).find(
        (e) => Math.abs(e.date.getTime() - date.getTime()) < 3 * 86400000,
      );
      const fresh = moonEventNearDate(kind, date);
      expect(fresh?.iso).toBe(old?.iso);
      expect(fresh?.snapshot.signKa).toBe(old?.snapshot.signKa);
    }
  }, 60_000); // runs the old 1,000-day scan as the oracle: slow by design
});
