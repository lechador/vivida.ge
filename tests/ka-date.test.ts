import { describe, expect, it } from "vitest";

import { kaLongDate, kaShortDate } from "../lib/i18n/ka-date";

/**
 * Vitest runs on Node, which ships full ICU — so ICU is the oracle here. The
 * point of the hand-written tables is to give browsers *without* Georgian
 * locale data the same output, which means any drift from ICU is a bug.
 */
const icuLong = new Intl.DateTimeFormat("ka-GE", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});
const icuShort = new Intl.DateTimeFormat("ka-GE", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

describe("kaLongDate", () => {
  it("matches ICU for every month", () => {
    for (let month = 1; month <= 12; month++) {
      const date = ymd(2026, month, 15);
      expect(kaLongDate(date)).toBe(
        icuLong.format(new Date(`${date}T00:00:00Z`))
      );
    }
  });

  it("matches ICU for every weekday", () => {
    // 2026-02-01 is a Sunday, so this walks the full cycle.
    for (let day = 1; day <= 7; day++) {
      const date = ymd(2026, 2, day);
      expect(kaLongDate(date)).toBe(
        icuLong.format(new Date(`${date}T00:00:00Z`))
      );
    }
  });

  it("renders the stored date verbatim, with no timezone shift", () => {
    expect(kaLongDate("2026-08-09")).toBe("კვირა, 9 აგვისტო");
  });

  it("returns anything that isn't a calendar date unchanged", () => {
    expect(kaLongDate("")).toBe("");
    expect(kaLongDate("2026-8-9")).toBe("2026-8-9");
    expect(kaLongDate("tomorrow")).toBe("tomorrow");
  });
});

describe("kaShortDate", () => {
  it("matches ICU for every month", () => {
    for (let month = 0; month < 12; month++) {
      // Built in local time because kaShortDate reads local getters, matching
      // the ICU default of formatting in the runtime's own timezone.
      const date = new Date(2026, month, 15, 12);
      expect(kaShortDate(date)).toBe(
        icuShort.format(new Date(Date.UTC(2026, month, 15)))
      );
    }
  });
});
