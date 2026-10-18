import { describe, expect, it } from "vitest";

import { nextMonthlyBonusDate, nextUnlockProgress } from "@/lib/credit-progress";

describe("credit progress", () => {
  it("uses the five and ten credit value tiers", () => {
    expect(nextUnlockProgress(3)).toMatchObject({ target: 5, missing: 2, complete: false });
    expect(nextUnlockProgress(7)).toMatchObject({ target: 10, missing: 3, complete: false });
    expect(nextUnlockProgress(10)).toMatchObject({ target: 10, missing: 0, complete: true });
  });

  it("shows the next Tbilisi monthly drop", () => {
    expect(nextMonthlyBonusDate(new Date("2026-12-31T20:30:00Z"))).toBe("2027-02-01");
    expect(nextMonthlyBonusDate(new Date("2026-08-26T00:00:00Z"))).toBe("2026-09-01");
  });
});
