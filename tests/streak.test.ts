import { describe, expect, it } from "vitest";

import { calculateStreak } from "../lib/streak";
import { ritualCycleProgress } from "../lib/credits-config";

describe("daily ritual streak", () => {
  it("counts a run through a completed today", () => {
    expect(
      calculateStreak(
        ["2026-08-07", "2026-08-08", "2026-08-09"],
        "2026-08-09"
      )
    ).toEqual({ current: 3, longest: 3, todayComplete: true });
  });

  it("keeps yesterday's run alive until today's ritual is completed", () => {
    expect(
      calculateStreak(["2026-08-07", "2026-08-08"], "2026-08-09")
    ).toEqual({ current: 2, longest: 2, todayComplete: false });
  });

  it("resets the current run after a fully missed day", () => {
    expect(
      calculateStreak(["2026-08-05", "2026-08-06"], "2026-08-09")
    ).toEqual({ current: 0, longest: 2, todayComplete: false });
  });

  it("tracks the longest historical run separately", () => {
    expect(
      calculateStreak(
        ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-08"],
        "2026-08-09"
      )
    ).toEqual({ current: 1, longest: 3, todayComplete: false });
  });
});

describe("repeatable weekly ritual reward", () => {
  it("shows one day left at a six-day streak", () => {
    expect(ritualCycleProgress(6, true)).toEqual({
      completedDays: 6,
      daysLeft: 1,
      targetDays: 7,
      rewardEarnedToday: false,
    });
  });

  it("celebrates a reward earned today and starts the next target", () => {
    expect(ritualCycleProgress(7, true)).toEqual({
      completedDays: 7,
      daysLeft: 7,
      targetDays: 14,
      rewardEarnedToday: true,
    });
  });

  it("shows a fresh cycle after the reward day has passed", () => {
    expect(ritualCycleProgress(7, false)).toEqual({
      completedDays: 0,
      daysLeft: 7,
      targetDays: 14,
      rewardEarnedToday: false,
    });
  });
});
