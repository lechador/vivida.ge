import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isUnlocked: vi.fn(),
  spendOnce: vi.fn(),
  timezone: "UTC",
}));

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ timezone: mocks.timezone }],
        }),
      }),
    }),
  },
}));
vi.mock("@/lib/credits", async () => {
  const config = await vi.importActual<typeof import("@/lib/credits-config")>(
    "@/lib/credits-config",
  );
  return {
    CREDIT_COST: config.CREDIT_COST,
    isUnlocked: mocks.isUnlocked,
    spendOnce: mocks.spendOnce,
  };
});

import { unlockForUser } from "@/lib/credits-unlock-core";
import {
  isWeeklyUnlocked,
  isoWeekKeyOfDate,
  weeklyUnlockRef,
} from "@/lib/weekly-unlock";

describe("weekly forecast ref", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timezone = "UTC";
    mocks.spendOnce.mockResolvedValue("unlocked");
  });

  it("computes ISO week keys", () => {
    expect(isoWeekKeyOfDate("2026-11-09")).toBe("2026-W46");
    expect(isoWeekKeyOfDate("2026-11-15")).toBe("2026-W46");
    expect(isoWeekKeyOfDate("2026-11-16")).toBe("2026-W47");
    expect(isoWeekKeyOfDate("2027-01-01")).toBe("2026-W53");
  });

  it("uses the user's local date to pick the week", () => {
    const sundayNightUtc = new Date("2026-11-15T22:00:00Z");
    expect(weeklyUnlockRef(sundayNightUtc, "UTC")).toBe("weekly:2026-W46");
    expect(weeklyUnlockRef(sundayNightUtc, "Asia/Tbilisi")).toBe(
      "weekly:2026-W47",
    );
  });

  it("charges with a per-week ref, not the lifetime one", async () => {
    mocks.isUnlocked.mockResolvedValue(false);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T10:00:00Z"));
    try {
      await unlockForUser("user-1", "weekly");
    } finally {
      vi.useRealTimers();
    }
    expect(mocks.spendOnce).toHaveBeenCalledWith(
      "user-1",
      10,
      "spend_weekly",
      "weekly:2026-W47",
    );
  });

  it("grandfathers the legacy lifetime row for the shipping week only", async () => {
    mocks.isUnlocked.mockImplementation(
      async (_u: string, ref: string) => ref === "weekly",
    );
    expect(await isWeeklyUnlocked("u", new Date("2026-11-12T10:00:00Z"))).toBe(
      true,
    );
    expect(await isWeeklyUnlocked("u", new Date("2026-11-17T10:00:00Z"))).toBe(
      false,
    );
  });

  it("does not charge again while grandfathered", async () => {
    mocks.isUnlocked.mockImplementation(
      async (_u: string, ref: string) => ref === "weekly",
    );
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-12T10:00:00Z"));
    try {
      const out = await unlockForUser("user-1", "weekly");
      expect(out).toEqual({ ok: true, status: "already" });
    } finally {
      vi.useRealTimers();
    }
    expect(mocks.spendOnce).not.toHaveBeenCalled();
  });

  it("honours a current-week payment", async () => {
    mocks.isUnlocked.mockImplementation(
      async (_u: string, ref: string) => ref === "weekly:2026-W47",
    );
    expect(await isWeeklyUnlocked("u", new Date("2026-11-18T10:00:00Z"))).toBe(
      true,
    );
    expect(await isWeeklyUnlocked("u", new Date("2026-11-25T10:00:00Z"))).toBe(
      false,
    );
  });
});
