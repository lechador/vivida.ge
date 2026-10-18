import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBalance: vi.fn(),
  spendOnce: vi.fn(),
  generateTarotFollowup: vi.fn(),
  getLibraryEntry: vi.fn(),
  archiveLibraryEntry: vi.fn(),
  isPremiumUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/credits", () => ({
  CREDIT_COST: { tarot: 10, tarotFollowup: 5 },
  getBalance: mocks.getBalance,
  spendOnce: mocks.spendOnce,
}));
vi.mock("@/lib/openrouter", () => ({
  generateTarotFollowup: mocks.generateTarotFollowup,
}));
vi.mock("@/lib/library", () => ({
  getLibraryEntry: mocks.getLibraryEntry,
  archiveLibraryEntry: mocks.archiveLibraryEntry,
}));
vi.mock("@/lib/premium", () => ({
  isPremiumUser: mocks.isPremiumUser,
}));

import { performFollowup } from "@/lib/tarot/followup";

function storedEntry(followups: unknown[] = []) {
  return {
    id: "lib-1",
    userId: "user-1",
    kind: "tarot",
    sourceId: "src-1",
    title: "Stored headline",
    summary: "Stored question",
    href: null,
    language: "ka",
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
      degraded: false,
      followups,
    },
  };
}

describe("performFollowup", () => {
  beforeEach(() => {
    mocks.getBalance.mockResolvedValue(20);
    mocks.spendOnce.mockResolvedValue("unlocked");
    mocks.generateTarotFollowup.mockResolvedValue({
      answer: "AI answer",
      followupSuggestions: [
        "What should I notice?",
        "What can I clarify?",
        "What step can I take?",
      ],
    });
    mocks.getLibraryEntry.mockResolvedValue(storedEntry());
    mocks.archiveLibraryEntry.mockResolvedValue({ id: "lib-1" });
    mocks.isPremiumUser.mockResolvedValue(false);
  });

  it("rejects a reading that is not the user's without charging", async () => {
    mocks.getLibraryEntry.mockResolvedValue(null);

    const result = await performFollowup(
      "user-1",
      "lib-other",
      "What does this mean?",
      "ka",
    );

    expect(result).toEqual({ ok: false, error: "not_found" });
    expect(mocks.spendOnce).not.toHaveBeenCalled();
    expect(mocks.generateTarotFollowup).not.toHaveBeenCalled();
    expect(mocks.archiveLibraryEntry).not.toHaveBeenCalled();
  });

  it("makes the first follow-up per reading free", async () => {
    const result = await performFollowup(
      "user-1",
      "lib-1",
      "Explain more simply",
      "ka",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.followup.free).toBe(true);
    expect(result.followup.charged).toBe(0);
    expect(mocks.spendOnce).toHaveBeenCalledWith(
      "user-1",
      0,
      "spend_tarot_followup",
      "tarot-followup:src-1:1",
    );
    expect(mocks.archiveLibraryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: "src-1",
        content: expect.objectContaining({ followups: expect.any(Array) }),
      }),
    );
    expect(result.followup.followups).toHaveLength(1);
    expect(result.followup.followupSuggestions).toEqual([
      "What should I notice?",
      "What can I clarify?",
      "What step can I take?",
    ]);
    expect(mocks.archiveLibraryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          followupSuggestions: [
            "What should I notice?",
            "What can I clarify?",
            "What step can I take?",
          ],
        }),
      }),
    );
  });

  it("charges the follow-up price from the second follow-up on", async () => {
    mocks.getLibraryEntry.mockResolvedValue(
      storedEntry([
        {
          question: "First",
          answer: "First answer",
          degraded: false,
          charged: 0,
          free: true,
        },
      ]),
    );

    const result = await performFollowup(
      "user-1",
      "lib-1",
      "And what about work?",
      "ka",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.followup.free).toBe(false);
    expect(result.followup.charged).toBe(5);
    expect(mocks.spendOnce).toHaveBeenCalledWith(
      "user-1",
      5,
      "spend_tarot_followup",
      "tarot-followup:src-1:2",
    );
  });

  it("reports a short balance instead of generating", async () => {
    mocks.getLibraryEntry.mockResolvedValue(
      storedEntry([
        {
          question: "First",
          answer: "First answer",
          degraded: false,
          charged: 0,
          free: true,
        },
      ]),
    );
    mocks.spendOnce.mockResolvedValue("insufficient");
    mocks.getBalance.mockResolvedValue(2);

    const result = await performFollowup(
      "user-1",
      "lib-1",
      "And what about work?",
      "ka",
    );

    expect(result).toEqual({
      ok: false,
      error: "insufficient",
      cost: 5,
      balance: 2,
    });
    expect(mocks.generateTarotFollowup).not.toHaveBeenCalled();
  });

  it("stores a degraded fallback when the AI call fails", async () => {
    mocks.generateTarotFollowup.mockRejectedValue(new Error("upstream down"));

    const result = await performFollowup(
      "user-1",
      "lib-1",
      "Explain more simply",
      "ka",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.followup.degraded).toBe(true);
    expect(result.followup.answer.length).toBeGreaterThan(20);
  });
});
