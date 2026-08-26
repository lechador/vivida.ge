import { describe, expect, it } from "vitest";

import { calculateStreak } from "@/lib/streak";

describe("daily ritual streak", () => {
  it("keeps yesterday's streak open before today's completion", () => {
    expect(calculateStreak(["2026-08-24", "2026-08-25"], "2026-08-26")).toEqual({
      current: 2,
      longest: 2,
      todayComplete: false,
    });
  });

  it("counts today after completion and preserves the longest run", () => {
    expect(calculateStreak(["2026-08-20", "2026-08-24", "2026-08-25", "2026-08-26"], "2026-08-26")).toEqual({
      current: 3,
      longest: 3,
      todayComplete: true,
    });
  });
});
