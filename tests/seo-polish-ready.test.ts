import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { localizedAlternates } from "@/lib/seo/locales";
import {
  POLISH_READY_EXACT,
  POLISH_READY_PREFIXES,
  isPolishReadyPath,
} from "@/lib/seo/polish-ready";

const request = { host: "www.vividaastro.com" };

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "host" ? request.host : null),
  }),
}));

// The real module opens a DB connection on import.
vi.mock("@/lib/articles", () => ({
  listPublishedArticleSitemapItems: async () => [],
  articleUrl: (locale: string, slug?: string) =>
    `${locale === "ka" ? "https://www.vivida.ge" : "https://www.vividaastro.com"}/articles${slug ? `/${slug}` : ""}`,
}));

vi.mock("@/auth.config", () => ({ authConfig: { providers: [] } }));
vi.mock("next-auth", () => ({
  default: () => ({ auth: (fn: unknown) => fn }),
}));

const { default: sitemap } = await import("@/app/sitemap");
const { default: proxy } = await import("@/proxy");

function run(path: string, host = "www.vividaastro.com") {
  const req = new NextRequest(`https://${host}${path}`, {
    headers: { host },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (proxy as any)(req, {}) as Response | undefined;
}

describe("Polish-ready allowlist", () => {
  it("matches the verified set size (26 exact + 3 prefixes)", () => {
    expect(POLISH_READY_EXACT.size).toBe(26);
    expect(POLISH_READY_PREFIXES).toHaveLength(3);
  });

  it("allows translated sections and rejects the rest", () => {
    expect(isPolishReadyPath("/pl")).toBe(true);
    expect(isPolishReadyPath("/pl/sennik/waz")).toBe(true);
    expect(isPolishReadyPath("/pl/znaki-zodiaku/aries")).toBe(true);
    expect(isPolishReadyPath("/pl/znaki-zodiaku")).toBe(false);
    expect(isPolishReadyPath("/pl/znaki-zodiaku/aries/horoskop-na-dzis")).toBe(
      false,
    );
    expect(isPolishReadyPath("/pl/planety-w-astrologii")).toBe(false);
    expect(isPolishReadyPath("/pl/about")).toBe(false);
    expect(isPolishReadyPath("/pl/sennikx")).toBe(false);
  });
});

describe("pl hreflang gating", () => {
  it("omits pl on pages without a Polish twin, in every locale", () => {
    for (const locale of ["ka", "en"] as const) {
      const langs = localizedAlternates(
        "/astrologiuri-saxlebi",
        "/astrologiuri-saxlebi",
        locale,
      ).languages as Record<string, string>;
      expect(Object.keys(langs).sort()).toEqual(["en", "ka", "x-default"]);
    }
  });

  it("keeps pl on ready pages and uses bare language codes", () => {
    const langs = localizedAlternates("/", "/en", "ka").languages as Record<
      string,
      string
    >;
    expect(Object.keys(langs).sort()).toEqual(["en", "ka", "pl", "x-default"]);
  });
});

describe("/pl proxy routing on vividaastro.com", () => {
  it("308-redirects a non-ready /pl path to its English twin", () => {
    const res = run("/pl/domy-astrologiczne/1")!;
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/astrology-houses/1",
    );
  });

  it("no longer bounces /pl/planety-w-astrologii to a 404 path", () => {
    const res = run("/pl/planety-w-astrologii")!;
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/astrology-planets",
    );
  });

  it("sends legal pages to the English pages", () => {
    for (const [pl, en] of [
      ["/pl/privacy", "/privacy"],
      ["/pl/terms", "/terms"],
      ["/pl/about", "/about"],
      ["/pl/readings", "/readings"],
    ]) {
      const res = run(pl)!;
      expect(res.status).toBe(308);
      expect(new URL(res.headers.get("location")!).pathname).toBe(en);
    }
  });

  it("falls back to the English home for unknown /pl paths", () => {
    const res = run("/pl/nie-ma-takiej-strony")!;
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });

  it("still rewrites ready /pl paths as Polish", () => {
    const res = run("/pl/sennik")!;
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-rewrite")).toContain(
      "/sizmris-akhsna",
    );
    expect(res.headers.get("location")).toBeNull();
  });
});

describe("sitemaps", () => {
  beforeEach(() => {
    request.host = "www.vividaastro.com";
  });

  it("English sitemap lists only Polish-ready /pl URLs", async () => {
    const entries = await sitemap();
    const pl = entries
      .map((e) => new URL(e.url))
      .filter((u) => u.pathname === "/pl" || u.pathname.startsWith("/pl/"));
    expect(pl.length).toBeGreaterThan(0);
    for (const u of pl) expect(isPolishReadyPath(u.pathname)).toBe(true);
    for (const e of entries) {
      for (const [lang, href] of Object.entries(
        e.alternates?.languages ?? {},
      )) {
        expect(lang).not.toMatch(/^(ka|pl)-/);
        if (lang === "pl") {
          expect(isPolishReadyPath(new URL(href as string).pathname)).toBe(
            true,
          );
        }
      }
    }
  });

  it("Georgian sitemap has no /login or /signup and no non-ready pl alternates", async () => {
    request.host = "www.vivida.ge";
    const entries = await sitemap();
    const paths = entries.map((e) => new URL(e.url).pathname);
    expect(paths).not.toContain("/login");
    expect(paths).not.toContain("/signup");
    for (const e of entries) {
      const pl = (e.alternates?.languages as Record<string, string> | undefined)
        ?.pl;
      if (pl) expect(isPolishReadyPath(new URL(pl).pathname)).toBe(true);
    }
  });
});
