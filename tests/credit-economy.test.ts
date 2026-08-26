import { describe, expect, it } from "vitest";

import { maxLifetimeRitualReward, nextRitualMilestone, rewardWeekKey, ritualMilestoneAt } from "@/lib/credit-economy";
import { CREDIT_REWARD, MONTHLY_BONUS } from "@/lib/credits-config";

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
    expect(MONTHLY_BONUS).toBe(5);
  });
});
