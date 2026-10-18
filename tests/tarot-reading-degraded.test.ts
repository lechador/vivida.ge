import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  countUnlocks: vi.fn(),
  getBalance: vi.fn(),
  getUnlockAmount: vi.fn(),
  recordFreeUse: vi.fn(),
  spendCredits: vi.fn(),
  spendOnce: vi.fn(),
  generateTarotReading: vi.fn(),
  archiveLibraryEntry: vi.fn(),
  getLibraryEntryBySource: vi.fn(),
  isPremiumUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/credits", () => ({
  CREDIT_COST: { tarot: 10 },
  FREE_ALLOWANCE: { tarot: 1 },
  countUnlocks: mocks.countUnlocks,
  getBalance: mocks.getBalance,
  getUnlockAmount: mocks.getUnlockAmount,
  recordFreeUse: mocks.recordFreeUse,
  spendCredits: mocks.spendCredits,
  spendOnce: mocks.spendOnce,
}));
vi.mock("@/lib/openrouter", () => ({
  generateTarotReading: mocks.generateTarotReading,
}));
vi.mock("@/lib/library", () => ({
  archiveLibraryEntry: mocks.archiveLibraryEntry,
  getLibraryEntryBySource: mocks.getLibraryEntryBySource,
}));
vi.mock("@/lib/premium", () => ({
  isPremiumUser: mocks.isPremiumUser,
}));

import { performReading } from "@/lib/tarot/reading";

describe("performReading AI degradation", () => {
  beforeEach(() => {
    mocks.countUnlocks.mockResolvedValue(0);
    mocks.getBalance.mockResolvedValue(20);
    mocks.getUnlockAmount.mockResolvedValue(null);
    mocks.recordFreeUse.mockResolvedValue(undefined);
    mocks.spendCredits.mockResolvedValue(true);
    mocks.spendOnce.mockResolvedValue("unlocked");
    mocks.archiveLibraryEntry.mockResolvedValue({ id: "lib-1" });
    mocks.getLibraryEntryBySource.mockResolvedValue(null);
    mocks.isPremiumUser.mockResolvedValue(false);
  });

  it("marks the reading degraded when the AI call fails", async () => {
    mocks.generateTarotReading.mockRejectedValue(new Error("upstream down"));

    const result = await performReading(
      "user-1",
      "რა უნდა დავინახო?",
      "ka",
      "req-degraded-1",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reading.degraded).toBe(true);
    expect(mocks.archiveLibraryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ degraded: true }),
      }),
    );
  });

  it("marks the reading fresh when the AI call succeeds", async () => {
    mocks.generateTarotReading.mockResolvedValue({
      headline: "AI headline",
      cards: ["one", "two", "three"],
      reading: "AI reading",
      advice: "AI advice",
    });

    const result = await performReading(
      "user-1",
      "რა უნდა დავინახო?",
      "ka",
      "req-fresh-1",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reading.degraded).toBe(false);
    expect(result.reading.headline).toBe("AI headline");
  });
});
