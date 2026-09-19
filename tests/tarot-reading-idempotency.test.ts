import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  countUnlocks: vi.fn(),
  getBalance: vi.fn(),
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

describe("performReading request idempotency", () => {
  beforeEach(() => {
    mocks.countUnlocks.mockResolvedValue(5);
    mocks.getBalance.mockResolvedValue(5);
    mocks.recordFreeUse.mockResolvedValue(undefined);
    mocks.spendCredits.mockResolvedValue(true);
    mocks.spendOnce.mockResolvedValue("unlocked");
    mocks.generateTarotReading.mockResolvedValue(null);
    mocks.archiveLibraryEntry.mockResolvedValue({ id: "lib-new" });
    mocks.isPremiumUser.mockResolvedValue(false);
    mocks.getLibraryEntryBySource.mockResolvedValue({
      id: "lib-stored",
      userId: "user-1",
      kind: "tarot",
      sourceId: "req-12345678",
      title: "Stored headline",
      summary: "Stored question",
      content: {
        type: "tarot",
        question: "Stored question",
        cards: [
          {
            slug: "the-fool",
            name: "Fool",
            glyph: "🃏",
            reversed: false,
            position: "Past / root",
            interpretation: "Stored interpretation",
          },
        ],
        reading: "Stored reading",
        advice: "Stored advice",
        charged: 0,
        free: true,
      },
    });
  });

  it("replays a completed reading without charging or regenerating", async () => {
    const result = await performReading(
      "user-1",
      "Stored question",
      "ka",
      "req-12345678",
    );

    expect(result).toEqual({
      ok: true,
      reading: {
        headline: "Stored headline",
        cards: [
          {
            slug: "the-fool",
            name: "Fool",
            glyph: "🃏",
            image: "/tarot/the-fool.webp",
            reversed: false,
            position: "Past / root",
            interpretation: "Stored interpretation",
          },
        ],
        reading: "Stored reading",
        advice: "Stored advice",
        charged: 0,
        free: true,
        balance: 5,
        libraryId: "lib-stored",
        degraded: false,
        followups: [],
        spreadId: "situation",
      },
    });
    expect(mocks.countUnlocks).not.toHaveBeenCalled();
    expect(mocks.recordFreeUse).not.toHaveBeenCalled();
    expect(mocks.spendCredits).not.toHaveBeenCalled();
    expect(mocks.spendOnce).not.toHaveBeenCalled();
    expect(mocks.generateTarotReading).not.toHaveBeenCalled();
    expect(mocks.archiveLibraryEntry).not.toHaveBeenCalled();
  });
});
