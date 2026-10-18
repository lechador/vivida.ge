import { describe, expect, it } from "vitest";

import {
  CALENDAR_DAYS,
  SITEMAP_CALENDAR_DAYS,
  calendarWindow,
} from "@/lib/seo/astrology-calendar";
import {
  MOON_EVENT_DAYS,
  SITEMAP_MOON_EVENT_DAYS,
  moonEvents,
} from "@/lib/seo/moon-events";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("SEO date-page horizons", () => {
  it("keeps the public calendar to one month and the sitemap to two weeks", () => {
    const start = new Date("2026-08-24T12:00:00Z");
    const publicDays = calendarWindow(CALENDAR_DAYS, start);
    const sitemapDays = calendarWindow(SITEMAP_CALENDAR_DAYS, start);

    expect(publicDays).toHaveLength(30);
    expect(publicDays.at(-1)?.iso).toBe("2026-09-22");
    expect(sitemapDays).toHaveLength(14);
    expect(sitemapDays.at(-1)?.iso).toBe("2026-09-06");
  });

  it("does not generate or submit distant-future lunar detail pages", () => {
    const now = Date.now();
    const publicEvents = moonEvents("new", MOON_EVENT_DAYS);
    const sitemapEvents = moonEvents("new", SITEMAP_MOON_EVENT_DAYS);

    expect(publicEvents.length).toBeGreaterThan(0);
    expect(sitemapEvents.length).toBeGreaterThan(0);
    expect(
      publicEvents.every(
        (event) => event.date.getTime() - now <= (MOON_EVENT_DAYS + 4) * DAY_MS,
      ),
    ).toBe(true);
    expect(
      sitemapEvents.every(
        (event) =>
          event.date.getTime() - now <=
          (SITEMAP_MOON_EVENT_DAYS + 4) * DAY_MS,
      ),
    ).toBe(true);
  });
});
