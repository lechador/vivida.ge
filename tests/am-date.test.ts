import { describe, expect, it } from "vitest";

import { amLongDate, amShortDate } from "../lib/i18n/am-date";

describe("amLongDate", () => {
  it("formats dates with Armenian weekdays and genitive months", () => {
    expect(amLongDate("2026-08-09")).toBe("Կիրակի, 9 օգոստոսի");
    expect(amLongDate("2026-01-01")).toBe("Հինգշաբթի, 1 հունվարի");
    expect(amLongDate("2026-04-24")).toBe("Ուրբաթ, 24 ապրիլի");
  });

  it("returns invalid date inputs unchanged", () => {
    expect(amLongDate("")).toBe("");
    expect(amLongDate("invalid-date")).toBe("invalid-date");
    expect(amLongDate("2026-8-9")).toBe("2026-8-9");
  });
});

describe("amShortDate", () => {
  it("formats short Armenian dates", () => {
    const date = new Date(2026, 7, 15, 12);
    expect(amShortDate(date)).toBe("15 օգս");
  });
});
