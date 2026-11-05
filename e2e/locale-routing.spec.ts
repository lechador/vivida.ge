import { expect, test } from "@playwright/test";

/**
 * Host-scoped locale routing: proxy.ts + next.config.ts redirects/rewrites.
 *
 * The suite runs against 127.0.0.1, which is neither the Georgian nor the
 * English host, so every case below pins the host explicitly via the Host
 * header (verified to reach the app through the request fixture). That is
 * what makes these assertions meaningful: without the override, the English
 * rewrite has no route (404) and the host-scoped redirects never fire.
 *
 * Regression coverage for:
 *  - the /en self-redirect loop on vividaastro.com (rewrites vs redirects),
 *  - Georgian slugs leaking onto the English host (duplicate content),
 *  - Armenian pages served from vivida.ge (duplicate content),
 *  - the conservative Armenian geo redirect (crawlers, cookies, country).
 */

const GE_HOST = "www.vivida.ge";
const GE_APEX_HOST = "vivida.ge";
const EN_HOST = "www.vividaastro.com";
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

test.describe("locale routing", () => {
  // The apex host is a permanent alias only. A 307 here made every crawler
  // re-check the redirect, and left robots.txt/sitemap.xml on an unstable
  // host. Assert the exact status and one-hop target for each public entry.
  for (const path of ["/", "/robots.txt", "/sitemap.xml"]) {
    test(`apex ${path} permanently redirects to www`, async ({ request }) => {
      const res = await request.get(path, {
        headers: { host: GE_APEX_HOST },
        maxRedirects: 0,
      });

      expect(res.status()).toBe(308);
      expect(res.headers()["location"]).toBe(
        `https://www.vivida.ge${path === "/" ? "" : path}`,
      );
    });
  }

  test("apex redirect preserves the path and query string", async ({
    request,
  }) => {
    const res = await request.get("/nataluri-ruka?utm_source=apex", {
      headers: { host: GE_APEX_HOST },
      maxRedirects: 0,
    });

    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe(
      "https://www.vivida.ge/nataluri-ruka?utm_source=apex",
    );
  });

  test("Georgian host serves the Georgian page in place", async ({
    request,
  }) => {
    const res = await request.get("/nataluri-ruka", {
      headers: { host: GE_HOST },
    });

    expect(res.status()).toBe(200);
    expect(res.url()).toMatch(/\/nataluri-ruka$/);
  });

  test("English host rewrites the clean URL with no redirect hop", async ({
    request,
  }) => {
    const res = await request.get("/natal-chart", {
      headers: { host: EN_HOST },
      maxRedirects: 0,
    });

    expect(res.status()).toBe(200);
  });

  test("clean English URL has no route off the English host", async ({
    request,
  }) => {
    const res = await request.get("/natal-chart", { maxRedirects: 0 });

    expect(res.status()).toBe(404);
  });

  test("internal /en path on the English host renders, not redirects", async ({
    request,
  }) => {
    // The rewrite destination must never redirect back to the clean URL,
    // that was the self-redirect loop on vividaastro.com/.
    const res = await request.get("/en/natal-chart", {
      headers: { host: EN_HOST },
      maxRedirects: 0,
    });

    expect(res.status()).toBe(200);
  });

  test("internal /en path on the Georgian host redirects to the clean English URL", async ({
    request,
  }) => {
    const res = await request.get("/en/natal-chart", {
      headers: { host: GE_HOST },
      maxRedirects: 0,
    });

    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe(
      "https://www.vividaastro.com/natal-chart",
    );
  });

  // Full duplicate-content matrix: every Georgian keyword URL that overlaps
  // an English page must 308 to its canonical on the English host while
  // staying a Georgian 200 on vivida.ge. Unit-level list consistency lives in
  // tests/seo-legacy-redirects.test.ts; this asserts live behavior per entry.
  const legacyMatrix = [
    {
      source: "/nataluri-ruka",
      destination: "https://www.vividaastro.com/natal-chart",
    },
    {
      source: "/piradi-ruka",
      destination: "https://www.vividaastro.com/natal-chart",
    },
    {
      source: "/piradi-ruka/rogor-shevadginot",
      destination: "https://www.vividaastro.com/natal-chart",
    },
    {
      source: "/piradi-horoskopi",
      destination: "https://www.vividaastro.com/horoscope",
    },
    { source: "/mkitxaoba", destination: "https://www.vividaastro.com/tarot" },
    {
      source: "/zodiac/tavsebadoba",
      destination: "https://www.vividaastro.com/compatibility",
    },
  ] as const;

  for (const { source, destination } of legacyMatrix) {
    test(`${source} consolidates on the English host, stays Georgian on .ge`, async ({
      request,
    }) => {
      const en = await request.get(source, {
        headers: { host: EN_HOST },
        maxRedirects: 0,
      });
      expect(en.status()).toBe(308);
      expect(en.headers()["location"]).toBe(destination);

      const ge = await request.get(source, {
        headers: { host: GE_HOST },
      });
      expect(ge.status()).toBe(200);
      // Georgian URL, Georgian copy, never an English duplicate.
      expect(await ge.text()).toMatch(/[ა-ჰ]/);
    });
  }

  test("retired Armenian URLs strip the /am prefix on the same host", async ({
    request,
  }) => {
    const ge = await request.get("/am", {
      headers: { host: GE_HOST },
      maxRedirects: 0,
    });
    expect(ge.status()).toBe(308);
    expect(ge.headers()["location"]).toMatch(/\/$/);

    const en = await request.get("/am/natal-chart", {
      headers: { host: EN_HOST },
      maxRedirects: 0,
    });
    expect(en.status()).toBe(308);
    expect(en.headers()["location"]).toMatch(/\/natal-chart$/);
  });

  test("English root declares the English content language", async ({
    request,
  }) => {
    const res = await request.get("/", { headers: { host: EN_HOST } });

    expect(res.status()).toBe(200);
    expect(res.headers()["content-language"]).toBe("en");
  });

  test("legacy /test redirects to the Georgian slug", async ({ request }) => {
    const res = await request.get("/test", { maxRedirects: 0 });

    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toMatch(/\/pirovnebis-testi$/);
  });

  test.describe("retired Armenian geo redirect", () => {
    const geoHeaders = {
      host: EN_HOST,
      accept: "text/html",
      "user-agent": BROWSER_UA,
      "x-vercel-ip-country": "AM",
    };

    test("Armenian visitors stay on the English page (no redirect)", async ({
      request,
    }) => {
      const res = await request.get("/horoscope", {
        headers: geoHeaders,
        maxRedirects: 0,
      });

      expect(res.status()).toBe(200);
    });

    test("crawlers are never geo-redirected", async ({ request }) => {
      const res = await request.get("/horoscope", {
        headers: {
          ...geoHeaders,
          "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
        },
        maxRedirects: 0,
      });

      expect(res.status()).toBe(200);
    });

    test("a stored language choice wins over geo", async ({ request }) => {
      const res = await request.get("/horoscope", {
        headers: { ...geoHeaders, cookie: "vivida_lang=en" },
        maxRedirects: 0,
      });

      expect(res.status()).toBe(200);
    });

    test("visitors outside Armenia stay put", async ({ request }) => {
      const res = await request.get("/horoscope", {
        headers: { ...geoHeaders, "x-vercel-ip-country": "US" },
        maxRedirects: 0,
      });

      expect(res.status()).toBe(200);
    });
  });
});
