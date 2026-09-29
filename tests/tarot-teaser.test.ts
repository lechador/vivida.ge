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

import { drawSpread, performReading } from "@/lib/tarot/reading";

describe("seeded tarot draw", () => {
  it("draws the identical spread for the same seed", () => {
    const a = drawSpread("req-123");
    const b = drawSpread("req-123");
    expect(a.map((d) => [d.card.slug, d.reversed])).toEqual(
      b.map((d) => [d.card.slug, d.reversed]),
    );
  });

  it("draws 3 distinct cards", () => {
    const slugs = drawSpread("req-123").map((d) => d.card.slug);
    expect(slugs).toHaveLength(3);
    expect(new Set(slugs).size).toBe(3);
  });

  it("varies the draw across seeds", () => {
    const seen = new Set(
      Array.from({ length: 10 }, (_, i) =>
        drawSpread(`req-${i}`)
          .map((d) => d.card.slug)
          .join(","),
      ),
    );
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("tarot 402 teaser preview", () => {
  beforeEach(() => {
    mocks.countUnlocks.mockResolvedValue(1);
    mocks.getBalance.mockResolvedValue(0);
    mocks.getUnlockAmount.mockResolvedValue(null);
    mocks.getLibraryEntryBySource.mockResolvedValue(null);
    mocks.isPremiumUser.mockResolvedValue(false);
    mocks.generateTarotReading.mockResolvedValue({
      headline: "AI headline",
      cards: ["one", "two", "three"],
      reading: "AI reading",
      advice: "AI advice",
    });
    mocks.archiveLibraryEntry.mockResolvedValue({ id: "lib-1" });
  });

  it("attaches art-only preview cards on insufficient balance", async () => {
    mocks.spendOnce.mockResolvedValue("insufficient");
    const result = await performReading(
      "user-1",
      "რას მირჩევ?",
      "ka",
      "request-teaser-1",
      "situation",
    );
    expect(result.ok).toBe(false);
    if (result.ok || result.error !== "insufficient")
      throw new Error("expected insufficient");
    expect(result.preview?.cards).toHaveLength(3);
    for (const card of result.preview?.cards ?? []) {
      expect(card.slug.length).toBeGreaterThan(0);
      expect(card.name.length).toBeGreaterThan(0);
      expect(card.position.length).toBeGreaterThan(0);
      // No interpretation leaks into the free preview.
      expect("interpretation" in card).toBe(false);
    }
  });

  it("the paid retry interprets the exact previewed cards", async () => {
    mocks.spendOnce.mockResolvedValue("insufficient");
    const shorted = await performReading(
      "user-1",
      "რას მირჩევ?",
      "ka",
      "request-teaser-2",
      "situation",
    );
    expect(shorted.ok).toBe(false);
    if (shorted.ok || shorted.error !== "insufficient" || !shorted.preview)
      throw new Error("no preview");

    mocks.spendOnce.mockResolvedValue("unlocked");
    const paid = await performReading(
      "user-1",
      "რას მირჩევ?",
      "ka",
      "request-teaser-2",
      "situation",
    );
    expect(paid.ok).toBe(true);
    if (!paid.ok) return;
    expect(paid.reading.cards.map((c) => c.slug)).toEqual(
      shorted.preview.cards.map((c) => c.slug),
    );
    expect(paid.reading.cards.map((c) => c.reversed)).toEqual(
      shorted.preview.cards.map((c) => c.reversed),
    );
  });
});
