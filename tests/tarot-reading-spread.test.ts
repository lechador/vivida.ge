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

describe("performReading spread selection", () => {
  beforeEach(() => {
    mocks.countUnlocks.mockResolvedValue(0);
    mocks.getBalance.mockResolvedValue(20);
    mocks.getUnlockAmount.mockResolvedValue(null);
    mocks.recordFreeUse.mockResolvedValue(undefined);
    mocks.spendCredits.mockResolvedValue(true);
    mocks.spendOnce.mockResolvedValue("unlocked");
    mocks.generateTarotReading.mockResolvedValue({
      headline: "AI headline",
      cards: ["one", "two", "three"],
      reading: "AI reading",
      advice: "AI advice",
    });
    mocks.archiveLibraryEntry.mockResolvedValue({ id: "lib-1" });
    mocks.getLibraryEntryBySource.mockResolvedValue(null);
    mocks.isPremiumUser.mockResolvedValue(false);
  });

  it("rejects an unknown spread before charging", async () => {
    const result = await performReading(
      "user-1",
      "რა უნდა დავინახო?",
      "ka",
      "req-spread-bad",
      "nope",
    );

    expect(result).toEqual({ ok: false, error: "bad_request" });
    expect(mocks.spendOnce).not.toHaveBeenCalled();
    expect(mocks.recordFreeUse).not.toHaveBeenCalled();
    expect(mocks.generateTarotReading).not.toHaveBeenCalled();
  });

  it("draws the relationship positions for the relationship spread", async () => {
    const result = await performReading(
      "user-1",
      "რა უნდა დავინახო?",
      "ka",
      "req-spread-rel",
      "relationship",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reading.spreadId).toBe("relationship");
    expect(result.reading.cards.map((card) => card.position)).toEqual([
      "ჩემი საჭიროება",
      "დაძაბულობა",
      "შესაძლო ნაბიჯი",
    ]);
    expect(mocks.generateTarotReading).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadLogic:
          "ურთიერთობის დინამიკა: ჩემი საჭიროება, დაძაბულობა, შესაძლო ნაბიჯი",
      }),
    );
    expect(mocks.archiveLibraryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ spreadId: "relationship" }),
      }),
    );
  });

  it("passes the compared options to the AI for the choice spread", async () => {
    const result = await performReading(
      "user-1",
      "რომელი გზა ავირჩიო?",
      "ka",
      "req-spread-choice",
      "choice",
      { a: "დარჩენა", b: "წასვლა" },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reading.spreadId).toBe("choice");
    expect(mocks.generateTarotReading).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadOptions: { a: "დარჩენა", b: "წასვლა" },
      }),
    );
  });

  it("draws five love positions and charges the love spread cost", async () => {
    mocks.generateTarotReading.mockResolvedValueOnce({
      headline: "AI headline",
      cards: ["one", "two", "three", "four", "five"],
      reading: "AI reading",
      advice: "AI advice",
    });
    const result = await performReading(
      "user-1",
      "რას გრძნობს ჩემ მიმართ?",
      "ka",
      "req-spread-love",
      "love_5",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reading.spreadId).toBe("love_5");
    expect(result.reading.cards).toHaveLength(5);
    expect(result.reading.cards.map((card) => card.position)).toEqual([
      "რას გრძნობს",
      "რას მალავს",
      "რას აპირებს",
      "შენი პოზიცია",
      "ურთიერთობის გამოსავალი",
    ]);
    expect(result.reading.charged).toBe(15);
    expect(result.reading.free).toBe(false);
    expect(mocks.generateTarotReading).toHaveBeenCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({ position: "რას გრძნობს" }),
        ]),
      }),
    );
    const aiCards = mocks.generateTarotReading.mock.calls.at(-1)?.[0].cards;
    expect(aiCards).toHaveLength(5);
  });

  it("charges the yes-no spread without consuming the love premium", async () => {
    const result = await performReading(
      "user-1",
      "დავრეკო თუ არა?",
      "ka",
      "req-spread-yesno",
      "yes_no",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reading.spreadId).toBe("yes_no");
    expect(result.reading.cards.map((card) => card.position)).toEqual([
      "მთავარი პასუხი (კი/არა)",
      "ფარული ფაქტორი",
      "დროის პროგნოზი",
    ]);
  });
});
