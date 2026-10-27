import { describe, expect, it } from "vitest";

import {
  maxLifetimeRitualReward,
  nextRitualMilestone,
  rewardWeekKey,
  ritualMilestoneAt,
} from "@/lib/credit-economy";
import {
  BIRTHDAY_CREDITS,
  CREDIT_REWARD,
  MONTHLY_BONUS,
  SIGNUP_BONUS,
} from "@/lib/credits-config";

describe("credit economy guardrails", () => {
  it("caps repeatable feed earning at one credit per week", () => {
    expect(CREDIT_REWARD.feedPost).toBe(1);
    expect(rewardWeekKey(new Date("2026-08-30T23:59:59Z"))).toBe("2026-08-24");
    expect(rewardWeekKey(new Date("2026-08-31T00:00:00Z"))).toBe("2026-08-31");
  });

  it("limits ritual rewards to eight lifetime credits", () => {
    expect(ritualMilestoneAt(7)).toEqual({ days: 7, credits: 1 });
    expect(ritualMilestoneAt(14)).toBeNull();
    expect(nextRitualMilestone(7)).toEqual({ days: 30, credits: 2 });
    expect(maxLifetimeRitualReward()).toBe(8);
  });

  it("does not increase the monthly recurring grant", () => {
    // Reduced 5 -> 3 on 2026-10-17 and re-targeted at recently active accounts,
    // because it was 43.4% of free issuance and reached 281 accounts that had
    // never been active. The guard intent is unchanged: this must never go up
    // without an explicit economy decision.
    expect(MONTHLY_BONUS).toBe(3);
    expect(MONTHLY_BONUS).toBeLessThanOrEqual(3);
  });

  it("keeps signup and birthday grants calibrated to the 2.5x free/spend guardrail", () => {
    expect(SIGNUP_BONUS).toBe(3);
    expect(BIRTHDAY_CREDITS).toBe(10);
  });
});
