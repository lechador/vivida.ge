import { beforeEach, describe, expect, it, vi } from "vitest";

import { englishSiteHref } from "@/lib/seo/locales";

const request = { host: "www.vivida.ge" };

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "host" ? request.host : null),
  }),
  // Locale must never depend on a cookie: a cookie-varying locale made the
  // SAME Georgian URL render English for some visitors and advertise
  // `canonical: https://www.vividaastro.com/...`, pointing a Georgian money
  // page at the other domain. Reading a cookie here is therefore a hard error.
  cookies: async () => {
    throw new Error("cookies() must not be consulted when resolving locale");
  },
}));

const { getRequestLocale, localeForHost, requestIsEnglishHost } = await import(
  "@/lib/i18n/request-locale"
);

beforeEach(() => {
  request.host = "www.vivida.ge";
});

describe("localeForHost", () => {
  it("always serves English on the international domain", () => {
    expect(localeForHost("vividaastro.com", "ka")).toBe("en");
    expect(localeForHost("www.vividaastro.com:443", "ka")).toBe("en");
  });

  it("retains an explicit preference on non-English hosts", () => {
    expect(localeForHost("www.vivida.ge", "en")).toBe("en");
    expect(localeForHost("www.vivida.ge", "ka")).toBe("ka");
  });

  it("defaults unknown and missing preferences to Georgian", () => {
    expect(localeForHost("localhost:3000")).toBe("ka");
    expect(localeForHost(null, "fr")).toBe("ka");
  });
});

describe("getRequestLocale", () => {
  it("serves Georgian for anonymous requests on the Georgian host", async () => {
    // The public/indexable case: no preference is passed, and the throwing
    // cookies() mock proves no cookie can override the host.
    await expect(getRequestLocale()).resolves.toBe("ka");
  });

  it("serves English on the international host regardless of preference", async () => {
    request.host = "www.vividaastro.com";
    await expect(getRequestLocale()).resolves.toBe("en");
    await expect(getRequestLocale("ka")).resolves.toBe("en");
  });

  it("honours a signed-in user's preference on the Georgian host", async () => {
    // /dashboard, /account and /report pass users.interfaceLanguage through.
    // These routes are robots-disallowed, so no indexable URL varies by user.
    await expect(getRequestLocale("en")).resolves.toBe("en");
    await expect(getRequestLocale("ka")).resolves.toBe("ka");
  });
});

describe("requestIsEnglishHost", () => {
  it("tracks the serving domain, not the rendered language", async () => {
    await expect(requestIsEnglishHost()).resolves.toBe(false);
    request.host = "www.vividaastro.com";
    await expect(requestIsEnglishHost()).resolves.toBe(true);
  });
});

describe("englishSiteHref", () => {
  it("keeps links relative on the English host", () => {
    expect(englishSiteHref("/natal-chart", true)).toBe("/natal-chart");
    expect(englishSiteHref("/", true)).toBe("/");
  });

  it("crosses to the English domain everywhere else", () => {
    // /natal-chart, /horoscope, /compatibility and /about are host-scoped
    // rewrites, so a bare path is a hard 404 on vivida.ge.
    expect(englishSiteHref("/natal-chart", false)).toBe(
      "https://www.vividaastro.com/natal-chart",
    );
    expect(englishSiteHref("/compatibility", false)).toBe(
      "https://www.vividaastro.com/compatibility",
    );
    // Paths that do resolve on vivida.ge would render Georgian, so they cross
    // over too rather than dropping an English reader into Georgian content.
    expect(englishSiteHref("/zodiac", false)).toBe(
      "https://www.vividaastro.com/zodiac",
    );
    expect(englishSiteHref("/", false)).toBe("https://www.vividaastro.com");
  });
});
