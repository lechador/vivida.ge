import { describe, expect, it } from "vitest";
import { localizedHref, polishPublicPath } from "@/lib/seo/public-paths";
import { localizedAlternates } from "@/lib/seo/locales";
import { moonCalendarPlCopy } from "@/lib/seo/moon-calendar-pl-copy";

describe("Stage 5A: Polish Public Routes & SEO Invariants", () => {
  it("resolves clean Polish public URLs across all Stage 5A hubs", () => {
    expect(localizedHref("/", "pl")).toBe("/pl");
    expect(localizedHref("/nataluri-ruka", "pl")).toBe(
      "/pl/horoskop-urodzeniowy",
    );
    expect(localizedHref("/taro", "pl")).toBe("/pl/tarot");
    expect(localizedHref("/zodiac/tavsebadoba", "pl")).toBe(
      "/pl/horoskop-partnerski",
    );
    expect(localizedHref("/compatibility", "pl")).toBe(
      "/pl/horoskop-partnerski",
    );
    expect(localizedHref("/mtvaris-kalendari", "pl")).toBe(
      "/pl/kalendarz-ksiezycowy",
    );
    expect(localizedHref("/horoskopi", "pl")).toBe("/pl/horoskop-dzienny");
    expect(localizedHref("/horoskopi/kvireuli", "pl")).toBe(
      "/pl/horoskop-tygodniowy",
    );
    expect(localizedHref("/horoskopi/tviuri", "pl")).toBe(
      "/pl/horoskop-miesieczny",
    );
    expect(localizedHref("/akhali-mtvare", "pl")).toBe("/pl/now-ksiezyca");
    expect(localizedHref("/savse-mtvare", "pl")).toBe("/pl/pelnia-ksiezyca");
  });

  it("builds correct SEO alternates with /pl prefixes", () => {
    const alternates = localizedAlternates(
      "/pl/horoskop-urodzeniowy",
      "/nataluri-ruka",
      "pl",
    );
    expect(alternates.canonical).toBe(
      "https://www.vividaastro.com/pl/horoskop-urodzeniowy",
    );
    expect(alternates.languages?.pl).toBe(
      "https://www.vividaastro.com/pl/horoskop-urodzeniowy",
    );
    expect(alternates.languages?.ka).toBe(
      "https://www.vivida.ge/nataluri-ruka",
    );
  });

  it("generates Polish moon calendar metadata copy", () => {
    const copy = moonCalendarPlCopy(2026);
    expect(copy.title).toContain("Kalendarz Księżycowy 2026");
    expect(copy.description).toContain("2026");
    expect(copy.description).toContain("faza księżyca");
  });

  it("preserves internal mappings via polishPublicPath", () => {
    expect(polishPublicPath("/horoskopi")).toBe("/pl/horoskop-dzienny");
    expect(polishPublicPath("/taro")).toBe("/pl/tarot");
    expect(polishPublicPath("/mtvaris-kalendari")).toBe(
      "/pl/kalendarz-ksiezycowy",
    );
  });
});
