import { describe, expect, it, vi } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { ALL_MBTI_SLUGS } from "@/lib/seo/mbti-seo";
import { tarotDetailSlugs } from "@/lib/tarot/detail";

const state = vi.hoisted(() => ({ host: "www.vivida.ge" }));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "host" ? state.host : null),
  }),
}));

vi.mock("@/lib/articles", () => ({
  listPublishedArticleSitemapItems: async () => [],
  articleUrl: (locale: "ka" | "en", slug?: string) =>
    `${locale === "ka" ? "https://www.vivida.ge" : "https://www.vividaastro.com"}/articles${slug ? `/${slug}` : ""}`,
}));

import sitemap from "@/app/sitemap";

function entryFor(entries: Awaited<ReturnType<typeof sitemap>>, path: string) {
  return entries.find((entry) => new URL(entry.url).pathname === path);
}

describe("sitemap hreflang coverage", () => {
  it("pairs the Georgian ad landing with its same-path English twin", async () => {
    state.host = "www.vivida.ge";
    const entries = await sitemap();

    expect(entryFor(entries, "/tavsebadoba")?.alternates).toEqual({
      languages: {
        "ka-GE": "https://www.vivida.ge/tavsebadoba",
        en: "https://www.vividaastro.com/tavsebadoba",
        "x-default": "https://www.vivida.ge/tavsebadoba",
      },
    });
  });

  it("mirrors English pairing onto long-tail Georgian pages", async () => {
    state.host = "www.vivida.ge";
    const entries = await sitemap();

    for (const path of [
      `/zodiac/${ALL_SLUGS[0]}`,
      `/mbti/${ALL_MBTI_SLUGS[0]}`,
      `/taro/${tarotDetailSlugs()[0]}`,
      "/horoskopi",
    ]) {
      const entry = entryFor(entries, path);
      expect(entry, path).toBeDefined();
      expect(entry?.alternates?.languages?.["ka-GE"], path).toBe(
        `https://www.vivida.ge${path}`,
      );
      expect(entry?.alternates?.languages?.en, path).toBeTruthy();
      expect(entry?.alternates?.languages?.["x-default"], path).toBe(
        `https://www.vivida.ge${path}`,
      );
    }
  });

  it("does not invent an English twin for Georgian-only pages", async () => {
    state.host = "www.vivida.ge";
    const entries = await sitemap();

    expect(
      entryFor(entries, "/tvit-shepasebis-testi")?.alternates,
    ).toBeUndefined();
  });
});
