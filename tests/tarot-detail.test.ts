import { describe, expect, it } from "vitest";

import { tarotDetailCard, tarotDetailSlugs } from "@/lib/tarot/detail";

process.env.R2_PUBLIC_URL = "https://example-r2.test";

describe("tarot detail catalog", () => {
  it("lists all 78 cards exactly once", () => {
    const slugs = tarotDetailSlugs();
    expect(slugs).toHaveLength(78);
    expect(new Set(slugs).size).toBe(78);
    expect(slugs).toContain("the-fool");
    expect(slugs).toContain("ace-of-cups");
    expect(slugs).toContain("king-of-pentacles");
  });

  it("resolves a minor card in Georgian", () => {
    const card = tarotDetailCard("ace-of-cups", "ka");

    expect(card).toMatchObject({
      slug: "ace-of-cups",
      name: "თასების ტუზი",
      arcana: "minor",
      suit: "cups",
      image: "https://example-r2.test/tarot/ace-of-cups.webp",
    });
    expect(card?.eyebrow).toMatch(/მცირე არკანა/);
    expect(card?.upright.length).toBeGreaterThan(40);
    expect(card?.keywords.length).toBeGreaterThanOrEqual(3);
  });

  it("resolves a minor card in English", () => {
    const card = tarotDetailCard("queen-of-swords", "en");

    expect(card).toMatchObject({
      slug: "queen-of-swords",
      name: "Queen of Swords",
      arcana: "minor",
    });
    expect(card?.eyebrow).toMatch(/Minor Arcana/);
    expect(JSON.stringify(card)).not.toMatch(/[ა-ჰ]/);
  });

  it("keeps resolving major cards as before", () => {
    const ka = tarotDetailCard("the-fool", "ka");
    const en = tarotDetailCard("the-fool", "en");

    expect(ka).toMatchObject({ name: "ბრიყვი", arcana: "major" });
    expect(ka?.eyebrow).toMatch(/დიდი არკანა/);
    expect(en?.name).toBe("The Fool");
    expect(ka?.image).toBe("/tarot/the-fool.webp");
  });

  it("returns undefined for unknown slugs", () => {
    expect(tarotDetailCard("nope", "ka")).toBeUndefined();
    expect(tarotDetailCard("nope", "en")).toBeUndefined();
  });
});
