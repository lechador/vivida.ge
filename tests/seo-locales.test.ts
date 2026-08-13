import { describe, expect, it } from "vitest";

import {
  ENGLISH_SITE_URL,
  ENGLISH_PUBLIC_ROUTES,
  GEORGIAN_SITE_URL,
  isEnglishHost,
  localizedAlternates,
  publicEnglishPath,
  siteOriginForHost,
} from "@/lib/seo/locales";

describe("international SEO locale helpers", () => {
  it("publishes English pages on clean vividaastro.com URLs", () => {
    expect(
      localizedAlternates("/en/natal-chart", "/nataluri-ruka", "en"),
    ).toEqual({
      canonical: `${ENGLISH_SITE_URL}/natal-chart`,
      languages: {
        "ka-GE": `${GEORGIAN_SITE_URL}/nataluri-ruka`,
        en: `${ENGLISH_SITE_URL}/natal-chart`,
        "x-default": `${ENGLISH_SITE_URL}/natal-chart`,
      },
    });
  });

  it("connects Georgian pages to their global English alternatives", () => {
    expect(localizedAlternates("/", "/en", "ka")).toEqual({
      canonical: GEORGIAN_SITE_URL,
      languages: {
        "ka-GE": GEORGIAN_SITE_URL,
        en: ENGLISH_SITE_URL,
        "x-default": ENGLISH_SITE_URL,
      },
    });
  });

  it("normalizes legacy internal English paths", () => {
    expect(publicEnglishPath("/en")).toBe("/");
    expect(publicEnglishPath("/en/privacy")).toBe("/privacy");
    expect(publicEnglishPath("/zodiac")).toBe("/zodiac");
  });

  it("includes English-only pages in global domain routing", () => {
    expect(ENGLISH_PUBLIC_ROUTES).toContainEqual({
      en: "/about",
      internalEn: "/en/about",
    });
  });

  it("recognizes both global hosts, including forwarded hosts with ports", () => {
    expect(isEnglishHost("vividaastro.com")).toBe(true);
    expect(isEnglishHost("www.vividaastro.com:443")).toBe(true);
    expect(isEnglishHost("www.vivida.ge")).toBe(false);
  });

  it("selects the correct trusted origin and falls back to Georgian", () => {
    expect(siteOriginForHost("www.vividaastro.com")).toBe(ENGLISH_SITE_URL);
    expect(siteOriginForHost("www.vivida.ge")).toBe(GEORGIAN_SITE_URL);
    expect(siteOriginForHost("unrecognized.example")).toBe(GEORGIAN_SITE_URL);
  });
});
