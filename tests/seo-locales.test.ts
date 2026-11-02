import { describe, expect, it } from "vitest";

import {
  ENGLISH_SITE_URL,
  ENGLISH_PUBLIC_ROUTES,
  GEORGIAN_SITE_URL,
  POLISH_SITE_URL,
  isEnglishHost,
  localizedAlternates,
  polishSiteHref,
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
        "pl-PL": `${POLISH_SITE_URL}/horoskop-urodzeniowy`,
        "x-default": `${ENGLISH_SITE_URL}/natal-chart`,
      },
    });
  });

  it("connects Georgian pages to their global alternatives", () => {
    expect(localizedAlternates("/", "/en", "ka")).toEqual({
      canonical: GEORGIAN_SITE_URL,
      languages: {
        "ka-GE": GEORGIAN_SITE_URL,
        en: ENGLISH_SITE_URL,
        "pl-PL": POLISH_SITE_URL,
        "x-default": ENGLISH_SITE_URL,
      },
    });
  });

  it("publishes Polish pages on clean vividaastro.com/pl URLs with canonical pl", () => {
    expect(
      localizedAlternates("/nataluri-ruka", "/nataluri-ruka", "pl"),
    ).toEqual({
      canonical: `${POLISH_SITE_URL}/horoskop-urodzeniowy`,
      languages: {
        "ka-GE": `${GEORGIAN_SITE_URL}/nataluri-ruka`,
        en: `${ENGLISH_SITE_URL}/natal-chart`,
        "pl-PL": `${POLISH_SITE_URL}/horoskop-urodzeniowy`,
        "x-default": `${ENGLISH_SITE_URL}/natal-chart`,
      },
    });
  });

  it("resolves Polish site hrefs correctly", () => {
    expect(polishSiteHref("/nataluri-ruka", true)).toBe(
      "/pl/horoskop-urodzeniowy",
    );
    expect(polishSiteHref("/nataluri-ruka", false)).toBe(
      "https://www.vividaastro.com/pl/horoskop-urodzeniowy",
    );
  });

  it("upgrades detail slugs to English and Polish keyword slugs in localizedAlternates", () => {
    const expectedLanguages = {
      "ka-GE": `${GEORGIAN_SITE_URL}/sizmris-akhsna/gveli`,
      en: `${ENGLISH_SITE_URL}/dream-meanings/snake`,
      "pl-PL": `${POLISH_SITE_URL}/sennik/waz`,
      "x-default": `${ENGLISH_SITE_URL}/dream-meanings/snake`,
    };

    expect(
      localizedAlternates(
        "/sizmris-akhsna/gveli",
        "/sizmris-akhsna/gveli",
        "ka",
      ),
    ).toEqual({
      canonical: `${GEORGIAN_SITE_URL}/sizmris-akhsna/gveli`,
      languages: expectedLanguages,
    });

    expect(
      localizedAlternates(
        "/dream-meanings/snake",
        "/sizmris-akhsna/gveli",
        "en",
      ),
    ).toEqual({
      canonical: `${ENGLISH_SITE_URL}/dream-meanings/snake`,
      languages: expectedLanguages,
    });

    expect(
      localizedAlternates("/pl/sennik/waz", "/sizmris-akhsna/gveli", "pl"),
    ).toEqual({
      canonical: `${POLISH_SITE_URL}/sennik/waz`,
      languages: expectedLanguages,
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
