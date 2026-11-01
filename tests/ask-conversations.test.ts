import { describe, expect, it } from "vitest";

import {
  CONVERSATION_TITLE_MAX,
  conversationTitle,
  conversationWhen,
  needsConversationTitle,
} from "@/lib/ask-conversations-pure";

describe("conversationTitle", () => {
  it("collapses whitespace and keeps short questions whole", () => {
    expect(conversationTitle("  როგორი ვარ   ურთიერთობებში? ")).toBe(
      "როგორი ვარ ურთიერთობებში?",
    );
  });

  it("truncates long questions on a word boundary with an ellipsis", () => {
    const long = "სიტყვა ".repeat(40);
    const title = conversationTitle(long);
    expect(title.length).toBeLessThanOrEqual(CONVERSATION_TITLE_MAX + 1);
    expect(title.endsWith("…")).toBe(true);
    expect(title.includes("სიტყ…")).toBe(false);
  });

  it("hard-cuts an unbroken blob", () => {
    const title = conversationTitle("x".repeat(200));
    expect(title.length).toBe(CONVERSATION_TITLE_MAX + 1);
  });
});

describe("needsConversationTitle", () => {
  it("treats null, empty and whitespace as untitled", () => {
    expect(needsConversationTitle(null)).toBe(true);
    expect(needsConversationTitle("")).toBe(true);
    expect(needsConversationTitle("   ")).toBe(true);
    expect(needsConversationTitle("კარიერა")).toBe(false);
  });
});

describe("conversationWhen", () => {
  const now = new Date(2026, 10, 2, 12, 0, 0);

  it("labels today and yesterday", () => {
    expect(conversationWhen(new Date(2026, 10, 2, 9, 0, 0), now)).toBe("დღეს");
    expect(conversationWhen(new Date(2026, 10, 1, 23, 0, 0), now)).toBe(
      "გუშინ",
    );
  });

  it("uses day counts inside the week and a date beyond it", () => {
    expect(conversationWhen(new Date(2026, 9, 30, 10, 0, 0), now)).toBe(
      "3 დღის წინ",
    );
    const older = conversationWhen(new Date(2026, 8, 14, 10, 0, 0), now);
    expect(older).toMatch(/14/);
  });

  it("returns an English label for the English locale", () => {
    expect(conversationWhen(new Date(2026, 10, 2, 9, 0, 0), now, "en")).toBe(
      "Today",
    );
  });

  it("never throws on an invalid date", () => {
    expect(conversationWhen("not-a-date", now)).toBe("");
  });
});
