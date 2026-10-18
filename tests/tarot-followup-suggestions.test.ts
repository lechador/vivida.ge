import { describe, expect, it } from "vitest";

import { normalizeTarotFollowupSuggestions } from "@/lib/tarot/followup-suggestions";

describe("normalizeTarotFollowupSuggestions", () => {
  it("keeps three unique generated questions", () => {
    expect(
      normalizeTarotFollowupSuggestions(
        ["პირველი კითხვა?", "მეორე კითხვა?", "მესამე კითხვა?"],
        "ka",
      ),
    ).toEqual(["პირველი კითხვა?", "მეორე კითხვა?", "მესამე კითხვა?"]);
  });

  it("replaces duplicates and questions that were already asked", () => {
    const suggestions = normalizeTarotFollowupSuggestions(
      ["უკვე დავსვი?", "უკვე დავსვი?", "ახალი კითხვა?"],
      "ka",
      ["უკვე დავსვი?"],
    );

    expect(suggestions).toHaveLength(3);
    expect(suggestions).not.toContain("უკვე დავსვი?");
    expect(new Set(suggestions).size).toBe(3);
  });
});
