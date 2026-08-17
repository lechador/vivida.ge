import { describe, expect, it } from "vitest";

import {
  ARMENIAN_PREFIX,
  countryFromGeoHeaders,
  hasArmenianVersion,
  isCrawler,
  isArmenianCoreRoute,
  localeHref,
  stripArmenianPrefix,
  withArmenianPrefix,
} from "@/lib/i18n/armenian-routes";
import {
  ENGLISH_SITE_URL,
  armenianSiteHref,
  localizedAlternates,
  resolveEnglishPath,
} from "@/lib/seo/locales";
import { localeForHost } from "@/lib/i18n/request-locale";
import { usesEnglishCopy } from "@/lib/i18n/locale";
import { articleLd } from "@/lib/seo/jsonld";
import {
  creditPacksForCountry,
  formatBillingAmount,
  premiumPlanForCountry,
} from "@/lib/billing-config";

describe("Armenian path prefix", () => {
  it("strips the prefix, mapping the Armenian home page to the root", () => {
    expect(stripArmenianPrefix("/am")).toBe("/");
    expect(stripArmenianPrefix("/am/")).toBe("/");
    expect(stripArmenianPrefix("/am/zodiac/vergo")).toBe("/zodiac/vergo");
  });

  it("returns null for paths that only look Armenian", () => {
    // The Georgian tree really does contain paths starting with "am" —
    // /zodiac/amomavali is the rising-sign cluster. A naive raw prefix check
    // would rewrite it into a nonexistent route.
    expect(stripArmenianPrefix("/zodiac/amomavali")).toBeNull();
    expect(stripArmenianPrefix("/amomavali")).toBeNull();
    expect(stripArmenianPrefix("/ambebi")).toBeNull();
    expect(stripArmenianPrefix("/")).toBeNull();
  });

  it("round-trips with withArmenianPrefix and is idempotent", () => {
    for (const path of ["/", "/zodiac", "/zodiac/vergo"]) {
      expect(stripArmenianPrefix(withArmenianPrefix(path))).toBe(path);
    }
    expect(withArmenianPrefix("/")).toBe(ARMENIAN_PREFIX);
    expect(withArmenianPrefix("/am/zodiac")).toBe("/am/zodiac");
  });

  it("treats only app/am routes as core, so the long tail gets rewritten", () => {
    expect(isArmenianCoreRoute("/natal-chart")).toBe(true);
    expect(isArmenianCoreRoute("/")).toBe(true);
    expect(isArmenianCoreRoute("/zodiac/vergo")).toBe(false);
  });
});

describe("Armenian hreflang gating", () => {
  it("claims an Armenian alternate only where the page exists", () => {
    expect(hasArmenianVersion("/natal-chart")).toBe(true);
    expect(hasArmenianVersion("/zodiac/virgo/dghes")).toBe(true);
    expect(hasArmenianVersion("/zodiac/virgo/2026")).toBe(true);
    expect(hasArmenianVersion("/zodiac/virgo/2027")).toBe(false);
    expect(hasArmenianVersion("/zodiac/mtvare")).toBe(true);
    expect(hasArmenianVersion("/zodiac/mtvare/virgo")).toBe(true);
    expect(hasArmenianVersion("/zodiac/amomavali/virgo")).toBe(true);
    expect(hasArmenianVersion("/zodiac/elementebi/fire")).toBe(true);
    expect(hasArmenianVersion("/zodiac/gzamkvlevi")).toBe(true);
    expect(hasArmenianVersion("/features")).toBe(true);
    expect(hasArmenianVersion("/how-it-works")).toBe(true);
    expect(hasArmenianVersion("/quiz/namdvili-nishani")).toBe(true);
    expect(hasArmenianVersion("/quiz/varskvlavebis-zodiaqo")).toBe(true);
    expect(hasArmenianVersion("/pirovnebis-testi")).toBe(true);
    expect(hasArmenianVersion("/iq-testi")).toBe(true);
    expect(hasArmenianVersion("/eq-testi")).toBe(true);
    expect(hasArmenianVersion("/big-five")).toBe(true);
    expect(hasArmenianVersion("/amomavali/verdzi")).toBe(false);
  });

  it("omits hy entirely on pages with no Armenian twin", () => {
    const alternates = localizedAlternates(
      "/amomavali/verdzi",
      "/amomavali/verdzi",
      "ka",
    );
    expect(alternates.languages).not.toHaveProperty("hy");
    expect(alternates.languages).not.toHaveProperty("hy-AM");
  });

  it("still emits hy on a translated page", () => {
    const alternates = localizedAlternates("/zodiac", "/zodiac", "en");
    expect(alternates.languages?.["hy-AM"]).toBe(
      `${ENGLISH_SITE_URL}/am/zodiac`,
    );
  });
});

describe("Armenian billing", () => {
  it("prices Armenia in dram rather than falling back to lari", () => {
    const plan = premiumPlanForCountry("AM");
    expect(plan?.currency).toBe("amd");
    // ֏2,990/month expressed in luma — AMD is two-decimal to Stripe.
    expect(plan?.amountMinor).toBe(299_000);

    const packs = creditPacksForCountry("AM");
    expect(packs.map((pack) => pack.amountMinor)).toEqual([
      99_000, 219_000, 429_000,
    ]);
    expect(packs.every((pack) => pack.currency === "amd")).toBe(true);
  });

  it("keeps credits-per-dram rising with pack size, as GE and GB do", () => {
    const packs = creditPacksForCountry("AM");
    const perDram = packs.map((pack) => pack.credits / pack.amountMinor);
    expect(perDram[1]).toBeGreaterThan(perDram[0]!);
    expect(perDram[2]).toBeGreaterThan(perDram[1]!);
  });

  it("undercuts the largest credit pack with PRO", () => {
    const largest = creditPacksForCountry("AM").at(-1)!;
    expect(premiumPlanForCountry("AM")!.amountMinor).toBeLessThan(
      largest.amountMinor,
    );
  });

  it("writes dram without decimals and with a trailing sign", () => {
    expect(formatBillingAmount(299_000, "amd", "am")).toBe("2,990 ֏");
    expect(formatBillingAmount(99_000, "amd", "am")).toBe("990 ֏");
  });

  it("does not disturb Georgian or English formatting", () => {
    expect(formatBillingAmount(1990, "gel", "ka")).toBe("₾19.90");
    expect(formatBillingAmount(999, "gbp", "en")).toBe("£9.99");
  });
});

describe("localeHref internal linking", () => {
  it("prefixes content paths for Armenian locale only", () => {
    expect(localeHref("/zodiac", "am")).toBe("/am/zodiac");
    expect(localeHref("/zodiac/vergo", "am")).toBe("/am/zodiac/vergo");
    expect(localeHref("/natal-chart", "am")).toBe("/am/natal-chart");
    expect(localeHref("/", "am")).toBe("/am");
    expect(localeHref("/zodiac", "ka")).toBe("/zodiac");
    expect(localeHref("/zodiac", "en")).toBe("/zodiac");
  });

  it("does not prefix auth, API, or authed app surfaces", () => {
    expect(localeHref("/dashboard", "am")).toBe("/dashboard");
    expect(localeHref("/account", "am")).toBe("/account");
    expect(localeHref("/login", "am")).toBe("/login");
    expect(localeHref("/signup", "am")).toBe("/signup");
    expect(localeHref("/api/tarot/reading", "am")).toBe("/api/tarot/reading");
    expect(localeHref("https://vivida.ge", "am")).toBe("https://vivida.ge");
  });
});

describe("JSON-LD inLanguage for Armenian URLs", () => {
  it("emits hy-AM for /am URLs and preserves en and ka-GE for others", () => {
    expect(
      articleLd({
        url: "https://www.vividaastro.com/am/zodiac/virgo",
        headline: "Virgo",
        description: "Desc",
      }).inLanguage,
    ).toBe("hy-AM");

    expect(
      articleLd({
        url: "https://www.vividaastro.com/zodiac/virgo",
        headline: "Virgo",
        description: "Desc",
      }).inLanguage,
    ).toBe("en");

    expect(
      articleLd({
        url: "https://www.vivida.ge/zodiac/kalwuli",
        headline: "ქალწული",
        description: "Desc",
      }).inLanguage,
    ).toBe("ka-GE");
  });
});

describe("geo-redirect guards", () => {
  it("reads the viewer country from either edge geo header", () => {
    expect(
      countryFromGeoHeaders(new Headers({ "x-vercel-ip-country": "am" })),
    ).toBe("AM");
    expect(countryFromGeoHeaders(new Headers({ "cf-ipcountry": "AM" }))).toBe(
      "AM",
    );
    expect(countryFromGeoHeaders(new Headers())).toBeNull();
    // Vercel sends XX when it cannot resolve the IP.
    expect(
      countryFromGeoHeaders(new Headers({ "x-vercel-ip-country": "" })),
    ).toBeNull();
  });

  it("never redirects a crawler, so the index is built from real URLs", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (compatible; YandexBot/3.0)",
      "facebookexternalhit/1.1",
      "GPTBot/1.0",
    ]) {
      expect(isCrawler(ua)).toBe(true);
    }
    expect(
      isCrawler(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      ),
    ).toBe(false);
    expect(isCrawler(null)).toBe(false);
  });

  it("only targets paths that have an Armenian page, never the authed app", () => {
    // The redirect is gated on hasArmenianVersion, so these can never be hit.
    expect(hasArmenianVersion("/dashboard")).toBe(false);
    expect(hasArmenianVersion("/credits")).toBe(false);
    expect(hasArmenianVersion("/account")).toBe(false);
    expect(hasArmenianVersion("/api/credits/checkout")).toBe(false);
    // …while the public entry points are eligible.
    expect(hasArmenianVersion("/")).toBe(true);
    expect(hasArmenianVersion("/zodiac/virgo")).toBe(true);
  });
});

describe("locale precedence on the international host", () => {
  const EN_HOST = "www.vividaastro.com";
  const KA_HOST = "www.vivida.ge";

  it("lets a stored Armenian preference through, since /am owns no host", () => {
    expect(localeForHost(EN_HOST, "am")).toBe("am");
    expect(localeForHost(EN_HOST, "hy")).toBe("am");
  });

  it("never lets a stored Georgian preference hijack the English domain", () => {
    // Every user defaults to "ka", so honouring it here would serve Georgian
    // to the entire international audience.
    expect(localeForHost(EN_HOST, "ka")).toBe("en");
    expect(localeForHost(EN_HOST, null)).toBe("en");
    expect(localeForHost(EN_HOST, undefined)).toBe("en");
    expect(localeForHost(EN_HOST, "nonsense")).toBe("en");
  });

  it("keeps the Georgian host Georgian, whatever the preference says", () => {
    expect(localeForHost(KA_HOST, "ka")).toBe("ka");
    expect(localeForHost(KA_HOST, "en")).toBe("ka");
    expect(localeForHost(KA_HOST, "am")).toBe("ka");
    expect(localeForHost(KA_HOST, null)).toBe("ka");
  });
});

describe("Armenian falls back to English, never Georgian", () => {
  it("treats Armenian as an English-copy locale on untranslated surfaces", () => {
    // The `const en = locale !== "ka"` idiom applied across 121 files.
    expect(usesEnglishCopy("en")).toBe(true);
    expect(usesEnglishCopy("am")).toBe(true);
    expect(usesEnglishCopy("ka")).toBe(false);
  });
});

/**
 * The language switches in ArmenianHeader and EnglishHeader both derive their
 * target from the one prop every caller already threads through — the page's
 * Georgian slug. Both derivations were silently wrong before: ArmenianHeader
 * read a separate `englishPath` prop that SmartHeader never passed, so "EN"
 * went to the homepage from ~590 of the ~599 Armenian pages, and the English
 * chrome had no Armenian switch at all.
 */
describe("language-switch targets are page-accurate", () => {
  const armenianTargetFor = (georgianPath: string) =>
    armenianSiteHref(resolveEnglishPath(georgianPath), true);

  it("keeps the long tail on the same page across all three locales", () => {
    // These slugs are shared verbatim by ka, en and am, so the derivation is
    // an identity and the switch must land on the same article.
    for (const path of [
      "/mtvaris-kalendari",
      "/sizmris-akhsna/gveli",
      "/zodiac/tavsebadoba/aries-leo",
      "/big-five",
      "/taro/the-fool",
    ]) {
      expect(resolveEnglishPath(path)).toBe(path);
      expect(armenianTargetFor(path)).toBe(`/am${path}`);
    }
  });

  it("maps the core routes onto their English slugs, not their Georgian ones", () => {
    // The ~9 core routes are the only ones whose slug differs per locale.
    expect(resolveEnglishPath("/nataluri-ruka")).toBe("/natal-chart");
    expect(resolveEnglishPath("/zodiac/tavsebadoba")).toBe("/compatibility");
    expect(armenianTargetFor("/nataluri-ruka")).toBe("/am/natal-chart");
    expect(armenianTargetFor("/zodiac/tavsebadoba")).toBe("/am/compatibility");
  });

  it("sends the home page to the locale root rather than a bare prefix", () => {
    expect(resolveEnglishPath("/")).toBe("/");
    expect(armenianTargetFor("/")).toBe("/am");
  });

  it("crosses to the international domain when rendered on the Georgian host", () => {
    expect(armenianSiteHref("/mtvaris-kalendari", false)).toBe(
      `${ENGLISH_SITE_URL}/am/mtvaris-kalendari`,
    );
  });

  it("documents the two pages whose Armenian target must be passed explicitly", () => {
    // /en/about has no Georgian counterpart (georgianPath="/"), and
    // /en/horoscope is paired with the Georgian daily hub /horoskopi for
    // hreflang reasons. Both would derive to the wrong Armenian page, which
    // is why EnglishHeader takes an `armenianPath` override — if either of
    // these assertions starts failing, the override is no longer needed.
    expect(armenianTargetFor("/")).not.toBe("/am/about");
    expect(armenianTargetFor("/horoskopi")).not.toBe("/am/horoscope");
  });
});
