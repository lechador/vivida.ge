import { describe, expect, it } from "vitest";

import { ALL_RANKING_SLUGS } from "@/lib/seo/rankings";
import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import {
  RANKING_TOPICS_AM,
  RANKINGS_HUB_AM,
  SIGN_REASON_AM,
  rankingTopicAmBySlug,
} from "@/lib/seo/rankings-am";

describe("Armenian Zodiac Rankings localization", () => {
  it("translates all 24 ranking topics into Armenian", () => {
    expect(RANKING_TOPICS_AM.length).toBe(ALL_RANKING_SLUGS.length);
    for (const slug of ALL_RANKING_SLUGS) {
      const topic = rankingTopicAmBySlug(slug);
      expect(topic).toBeDefined();
      expect(topic?.title.length).toBeGreaterThan(5);
      expect(topic?.short.length).toBeGreaterThan(0);
      expect(topic?.trait.length).toBeGreaterThan(5);
      expect(topic?.order.length).toBe(12);
    }
  });

  it("provides Armenian sign reasons for all 12 zodiac signs", () => {
    for (const slug of ALL_SLUGS) {
      const reason = SIGN_REASON_AM[slug];
      expect(reason).toBeDefined();
      expect(reason.length).toBeGreaterThan(10);
    }
  });

  it("has valid hub metadata", () => {
    expect(RANKINGS_HUB_AM.title).toContain("Կենդանակերպի");
    expect(RANKINGS_HUB_AM.description.length).toBeGreaterThan(10);
  });
});
