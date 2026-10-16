import { describe, expect, it } from "vitest";

import { monthlyBonusEligible } from "@/lib/monthly-bonus-eligibility";

describe("monthlyBonusEligible", () => {
  it("pauses the drop when the welcome bonus was received and never paid", () => {
    expect(
      monthlyBonusEligible({ receivedWelcomeBonus: true, hasEverPaid: false }),
    ).toBe(false);
  });

  it("resumes after the first paid action", () => {
    expect(
      monthlyBonusEligible({ receivedWelcomeBonus: true, hasEverPaid: true }),
    ).toBe(true);
  });

  it("keeps legacy accounts without a welcome bonus eligible", () => {
    expect(
      monthlyBonusEligible({ receivedWelcomeBonus: false, hasEverPaid: false }),
    ).toBe(true);
  });

  it("keeps payers without a welcome bonus eligible", () => {
    expect(
      monthlyBonusEligible({ receivedWelcomeBonus: false, hasEverPaid: true }),
    ).toBe(true);
  });
});
