import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import {
  ALL_ELEMENT_SLUGS,
  ALL_PAIR_SLUGS,
  ALL_SLUGS,
} from "@/lib/seo/zodiac-dates";
import {
  ALL_YEARLY_YEARS,
  yearlyContentFor,
} from "@/lib/seo/zodiac-content";
import { ALL_HOROSCOPE_VIEWS, VIEW_PATH } from "@/lib/sign-horoscope";
import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import { ALL_RANKING_SLUGS } from "@/lib/seo/rankings";
import { ALL_CHINESE_SLUGS } from "@/lib/seo/chinese-zodiac";
import { ALL_MBTI_SLUGS } from "@/lib/seo/mbti-seo";
import { TAROT_CARDS } from "@/lib/tarot/deck";
import { EQ_ARTICLE_SLUGS } from "@/lib/seo/eq-articles";
import {
  ALL_HOROSCOPE_THEMES,
  themeUrl,
} from "@/lib/seo/thematic-horoscope";
import { calendarWindow } from "@/lib/seo/astrology-calendar";
import { ECLIPSES, moonEvents } from "@/lib/seo/moon-events";
import {
  CORE_LANGUAGE_PAIRS,
  ENGLISH_ONLY_ROUTES,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  isEnglishHost,
} from "@/lib/seo/locales";
import {
  ARMENIAN_CORE_ROUTES,
  hasArmenianVersion,
  withArmenianPrefix,
} from "@/lib/i18n/armenian-routes";
import { HOUSE_NUMBERS, PLANET_SLUGS } from "@/lib/seo/astrology-guides";
import { ALL_DREAM_SLUGS } from "@/lib/seo/dreams";
import { ALL_ANGEL_SLUGS } from "@/lib/seo/angel-numbers";

/**
 * Public-page sitemap. Authed surfaces (dashboard, report, friends,
 * profile editing, etc.) are excluded — they're either not crawlable
 * or behind the proxy redirect. Public profiles at /u/[username] would
 * benefit from inclusion but require enumerating the profiles table at
 * build time; punting that to a follow-up dynamic sitemap if SEO needs it.
 */
const BASE = GEORGIAN_SITE_URL;

/**
 * lastModified strategy: only pages whose CONTENT actually changes with time
 * (daily/weekly horoscope surfaces, moon calendar, retrograde tracker) get a
 * live `NOW` stamp. Evergreen pages get a stable stamp bumped manually on
 * real content overhauls — stamping everything NOW on every crawl teaches
 * Google the lastmod is meaningless and slows recrawl of the fresh pages.
 */
const NOW = new Date();
/** Bump when evergreen cluster content meaningfully changes. */
const EVERGREEN = new Date("2026-07-13");
const CONTENT_PUBLISHED = new Date("2026-07-20");
const ENGLISH_PUBLISHED = new Date("2026-07-27");
const ENGLISH_ASTROLOGY_PUBLISHED = new Date("2026-08-13");
const ASTROLOGY_GUIDES_PUBLISHED = new Date("2026-07-27");
/** Armenian launch — bump as translated clusters land. */
const ARMENIAN_PUBLISHED = new Date("2026-08-17");
/** მკითხაობა / სიზმრის ახსნა / ანგელოზური რიცხვები clusters. */
const NEW_CLUSTERS_PUBLISHED = new Date("2026-07-29");

const VIEW_CHANGE_FREQ: Record<
  (typeof ALL_HOROSCOPE_VIEWS)[number],
  MetadataRoute.Sitemap[number]["changeFrequency"]
> = {
  today: "daily",
  tomorrow: "daily",
  week: "weekly",
  month: "monthly",
  nextWeek: "weekly",
  nextMonth: "monthly",
};

const VIEW_PRIORITY: Record<(typeof ALL_HOROSCOPE_VIEWS)[number], number> = {
  today: 0.9,
  tomorrow: 0.8,
  week: 0.85,
  month: 0.85,
  nextWeek: 0.75,
  nextMonth: 0.75,
};

/**
 * Language alternates for one page, with Armenian included only where it
 * exists. Shared by the English and Armenian sections so the two can never
 * disagree about whether a page has an Armenian twin — a one-way annotation
 * is discarded by Google, which is the failure mode /features hit in Aug 2026.
 */
function alternatesFor(
  kaPath: string | null,
  enPath: string,
): NonNullable<MetadataRoute.Sitemap[number]["alternates"]> {
  const englishUrl = `${ENGLISH_SITE_URL}${enPath === "/" ? "" : enPath}`;
  const languages: Record<string, string> = {};
  if (kaPath) {
    languages["ka-GE"] = `${GEORGIAN_SITE_URL}${kaPath === "/" ? "" : kaPath}`;
  }
  languages.en = englishUrl;
  if (hasArmenianVersion(enPath)) {
    languages["hy-AM"] =
      `${ENGLISH_SITE_URL}${withArmenianPrefix(enPath)}`;
  }
  languages["x-default"] = englishUrl;
  return { languages };
}

/**
 * The Armenian URLs themselves.
 *
 * They live on the international host, so they belong in *that* host's
 * sitemap — there is one sitemap.xml per domain, and vividaastro.com serves
 * English at the root and Armenian under /am.
 */
function armenianSitemap(): MetadataRoute.Sitemap {
  const coreEntries = ARMENIAN_CORE_ROUTES.map((path) => ({
    url: `${ENGLISH_SITE_URL}${withArmenianPrefix(path)}`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: (path === "/about" ? "yearly" : "monthly") as
      | "yearly"
      | "monthly",
    priority: path === "/" ? 0.9 : path === "/about" ? 0.5 : 0.7,
    alternates: alternatesFor(
      CORE_LANGUAGE_PAIRS.find((pair) => pair.en === path)?.ka ?? null,
      path,
    ),
  }));

  const signEntries = ALL_SLUGS.map((slug) => ({
    url: `${ENGLISH_SITE_URL}/am/zodiac/${slug}`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "monthly" as const,
    priority: 0.78,
    alternates: alternatesFor(`/zodiac/${slug}`, `/zodiac/${slug}`),
  }));

  const periodEntries = (["/horoskopi/kvireuli", "/horoskopi/tviuri"] as const).map((path) => ({
    url: `${ENGLISH_SITE_URL}/am${path}`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "weekly" as const,
    priority: 0.75,
    alternates: alternatesFor(path, path),
  }));

  const thematicHubEntries = ALL_HOROSCOPE_THEMES.map((theme) => ({
    url: `${ENGLISH_SITE_URL}/am${themeUrl(theme)}`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "monthly" as const,
    priority: 0.78,
    alternates: alternatesFor(themeUrl(theme), themeUrl(theme)),
  }));

  const thematicSignEntries = ALL_HOROSCOPE_THEMES.flatMap((theme) =>
    ALL_SLUGS.map((sign) => ({
      url: `${ENGLISH_SITE_URL}/am${themeUrl(theme, sign)}`,
      lastModified: ARMENIAN_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.68,
      alternates: alternatesFor(themeUrl(theme, sign), themeUrl(theme, sign)),
    })),
  );

  const pairEntries = ALL_PAIR_SLUGS.map((pair) => ({
    url: `${ENGLISH_SITE_URL}/am/zodiac/tavsebadoba/${pair}`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "monthly" as const,
    priority: 0.72,
    alternates: alternatesFor(
      `/zodiac/tavsebadoba/${pair}`,
      `/zodiac/tavsebadoba/${pair}`,
    ),
  }));

  const tavsebadobaEntry = {
    url: `${ENGLISH_SITE_URL}/am/tavsebadoba`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: alternatesFor("/tavsebadoba", "/tavsebadoba"),
  };

  const taroHubEntry = {
    url: `${ENGLISH_SITE_URL}/am/taro`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: alternatesFor("/taro", "/taro"),
  };

  const tarotCardEntries = TAROT_CARDS.map((card) => ({
    url: `${ENGLISH_SITE_URL}/am/taro/${card.slug}`,
    lastModified: ARMENIAN_PUBLISHED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: alternatesFor(`/taro/${card.slug}`, `/taro/${card.slug}`),
  }));

  return [
    ...coreEntries,
    ...signEntries,
    ...periodEntries,
    ...thematicHubEntries,
    ...thematicSignEntries,
    ...pairEntries,
    tavsebadobaEntry,
    taroHubEntry,
    ...tarotCardEntries,
  ];
}

function englishSitemap(): MetadataRoute.Sitemap {
  const samePathEntry = (
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number,
    lastModified: Date = ENGLISH_ASTROLOGY_PUBLISHED,
  ): MetadataRoute.Sitemap[number] => ({
    url: `${ENGLISH_SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: alternatesFor(path, path),
  });

  const signPages = ALL_SLUGS.map((slug) =>
    samePathEntry(`/zodiac/${slug}`, "monthly", 0.78),
  );
  const moonPages = ALL_SLUGS.map((slug) =>
    samePathEntry(`/zodiac/mtvare/${slug}`, "monthly", 0.72),
  );
  const risingPages = ALL_SLUGS.map((slug) =>
    samePathEntry(`/zodiac/amomavali/${slug}`, "monthly", 0.72),
  );
  const elementPages = ALL_ELEMENT_SLUGS.map((element) =>
    samePathEntry(`/zodiac/elementebi/${element}`, "monthly", 0.68),
  );
  const pairPages = ALL_PAIR_SLUGS.map((pair) =>
    samePathEntry(`/zodiac/tavsebadoba/${pair}`, "monthly", 0.7),
  );
  const thematicPages = ALL_HOROSCOPE_THEMES.flatMap((theme) => [
    samePathEntry(themeUrl(theme), "monthly", 0.78),
    ...ALL_SLUGS.map((sign) =>
      samePathEntry(themeUrl(theme, sign), "monthly", 0.68),
    ),
  ]);
  const yearlyPages = ALL_YEARLY_YEARS.flatMap((year) =>
    ALL_SLUGS.filter((slug) => yearlyContentFor(slug, year)).map((slug) =>
      samePathEntry(`/zodiac/${slug}/${year}`, "monthly", 0.76),
    ),
  );
  const signHoroscopePages = ALL_SLUGS.flatMap((slug) =>
    ALL_HOROSCOPE_VIEWS.map((view) =>
      samePathEntry(
        `/zodiac/${slug}/${VIEW_PATH[view]}`,
        VIEW_CHANGE_FREQ[view],
        VIEW_PRIORITY[view],
        NOW,
      ),
    ),
  );
  const housePages = HOUSE_NUMBERS.map((number) =>
    samePathEntry(`/astrologiuri-saxlebi/${number}`, "monthly", 0.68),
  );
  const planetPages = PLANET_SLUGS.map((planet) =>
    samePathEntry(`/planetebi/${planet}`, "monthly", 0.68),
  );
  const astrologyCalendarPages = calendarWindow().map((day) =>
    samePathEntry(`/astrologiuri-kalendari/${day.iso}`, "daily", 0.65, NOW),
  );
  const moonEventPages = (["full", "new"] as const).flatMap((kind) =>
    moonEvents(kind).map((event) =>
      samePathEntry(`/${kind === "full" ? "savse-mtvare" : "akhali-mtvare"}/${event.iso}`, "monthly", 0.7),
    ),
  );
  const eclipsePages = ECLIPSES.map((eclipse) =>
    samePathEntry(`/dabnelebebi/${eclipse.slug}`, "monthly", 0.7),
  );
  const tarotPages = TAROT_CARDS.map((card) =>
    samePathEntry(`/taro/${card.slug}`, "monthly", 0.7),
  );
  const mbtiPages = ALL_MBTI_SLUGS.map((type) =>
    samePathEntry(`/mbti/${type}`, "monthly", 0.7),
  );
  const rankingPages = ALL_RANKING_SLUGS.map((slug) =>
    samePathEntry(`/zodiac/reitingebi/${slug}`, "monthly", 0.7),
  );
  const chinesePages = ALL_CHINESE_SLUGS.map((slug) =>
    samePathEntry(`/chinuri-horoskopi/${slug}`, "monthly", 0.7),
  );
  const dreamPages = ALL_DREAM_SLUGS.map((slug) =>
    samePathEntry(`/sizmris-akhsna/${slug}`, "monthly", 0.68),
  );
  const numerologyPages = LIFE_PATH_NUMBERS.map((number) =>
    samePathEntry(`/numerologia/${number}`, "monthly", 0.7),
  );
  const angelNumberPages = ALL_ANGEL_SLUGS.map((number) =>
    samePathEntry(`/angeluri-ricxvebi/${number}`, "monthly", 0.68),
  );
  const eqArticlePages = EQ_ARTICLE_SLUGS.map((slug) =>
    samePathEntry(`/emociuri-inteleqti/${slug}`, "monthly", 0.68),
  );

  return [
    ...CORE_LANGUAGE_PAIRS.map((pair) => ({
      url: `${ENGLISH_SITE_URL}${pair.en === "/" ? "" : pair.en}`,
      lastModified: ENGLISH_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: pair.en === "/" ? 0.9 : 0.7,
      alternates: alternatesFor(pair.ka, pair.en),
    })),
    // English-only pages (no Georgian equivalent, so no ka-GE alternate).
    // Driven off the shared table rather than hardcoded, so moving a route
    // into ENGLISH_ONLY_ROUTES can't silently drop it from this sitemap.
    ...ENGLISH_ONLY_ROUTES.map((route) => ({
      url: `${ENGLISH_SITE_URL}${route.en}`,
      lastModified: ENGLISH_PUBLISHED,
      changeFrequency: (route.en === "/about" ? "yearly" : "monthly") as
        | "yearly"
        | "monthly",
      priority: route.en === "/about" ? 0.5 : 0.7,
      // No Georgian twin, but /about and /horoscope do have Armenian ones.
      alternates: alternatesFor(null, route.en),
    })),
    // Tests and quizzes. These render fully in English at their Georgian
    // slugs and are linked from the English /tests hub, but were missing
    // from this sitemap — the strongest English commercial queries we have
    // ("free personality test", "online IQ test") had no declared URL.
    samePathEntry("/pirovnebis-testi", "monthly", 0.9, ENGLISH_PUBLISHED),
    samePathEntry("/iq-testi", "monthly", 0.9, ENGLISH_PUBLISHED),
    samePathEntry("/eq-testi", "monthly", 0.9, ENGLISH_PUBLISHED),
    samePathEntry("/big-five", "monthly", 0.9, ENGLISH_PUBLISHED),
    samePathEntry("/quiz/namdvili-nishani", "monthly", 0.8, ENGLISH_PUBLISHED),
    samePathEntry(
      "/quiz/varskvlavebis-zodiaqo",
      "monthly",
      0.75,
      ENGLISH_PUBLISHED,
    ),
    // The English daily-horoscope hub — same-path pair with the Georgian
    // daily hub, matching its /kvireuli and /tviuri siblings below.
    samePathEntry("/horoskopi", "daily", 0.95, NOW),
    // NOTE: /tavsebadoba is deliberately absent here. It is a paid-ad landing
    // page with no internal link from any English surface, so submitting the
    // vividaastro.com URL advertises an orphan. It stays in the Georgian
    // sitemap below, where it is linked.
    samePathEntry("/features", "monthly", 0.85, ENGLISH_PUBLISHED),
    samePathEntry("/how-it-works", "monthly", 0.85, ENGLISH_PUBLISHED),
    samePathEntry("/zodiac/mtvare", "monthly", 0.78),
    samePathEntry("/zodiac/amomavali", "monthly", 0.78),
    samePathEntry("/zodiac/elementebi", "monthly", 0.74),
    samePathEntry("/horoskopi/kvireuli", "weekly", 0.86, NOW),
    samePathEntry("/horoskopi/tviuri", "monthly", 0.84, NOW),
    samePathEntry("/zodiac/datit", "monthly", 0.74),
    samePathEntry("/zodiac/gzamkvlevi", "monthly", 0.72),
    samePathEntry("/astrologiuri-saxlebi", "monthly", 0.76),
    samePathEntry("/planetebi", "monthly", 0.76),
    samePathEntry("/astrologiuri-kalendari", "daily", 0.84, NOW),
    samePathEntry("/ighbliani-dgheebi", "daily", 0.76, NOW),
    samePathEntry("/frtxili-dgheebi", "daily", 0.72, NOW),
    samePathEntry("/mtvaris-kalendari", "daily", 0.82, NOW),
    samePathEntry("/savse-mtvare", "daily", 0.82, NOW),
    samePathEntry("/akhali-mtvare", "daily", 0.82, NOW),
    samePathEntry("/dabnelebebi", "monthly", 0.78),
    samePathEntry("/merkuri-retrogradi", "weekly", 0.78, NOW),
    samePathEntry("/taro", "weekly", 0.78),
    samePathEntry("/mbti", "monthly", 0.78),
    samePathEntry("/zodiac/reitingebi", "monthly", 0.78),
    samePathEntry("/chinuri-horoskopi", "monthly", 0.78),
    samePathEntry("/sizmris-akhsna", "weekly", 0.76),
    samePathEntry("/numerologia", "monthly", 0.78),
    samePathEntry("/angeluri-ricxvebi", "monthly", 0.76),
    samePathEntry("/emociuri-inteleqti", "monthly", 0.76),
    ...signPages,
    ...moonPages,
    ...risingPages,
    ...elementPages,
    ...pairPages,
    ...thematicPages,
    ...yearlyPages,
    ...signHoroscopePages,
    ...housePages,
    ...planetPages,
    ...astrologyCalendarPages,
    ...moonEventPages,
    ...eclipsePages,
    ...tarotPages,
    ...mbtiPages,
    ...rankingPages,
    ...chinesePages,
    ...dreamPages,
    ...numerologyPages,
    ...angelNumberPages,
    ...eqArticlePages,
    // Armenian shares this domain, so its URLs are declared here rather than
    // in a sitemap of their own.
    ...armenianSitemap(),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (isEnglishHost(host)) return englishSitemap();

  const zodiacSignPages: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Psychology tests: the 16 MBTI type landing pages.
  const mbtiTypePages: MetadataRoute.Sitemap = ALL_MBTI_SLUGS.map((slug) => ({
    url: `${BASE}/mbti/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const elementPages: MetadataRoute.Sitemap = ALL_ELEMENT_SLUGS.map((el) => ({
    url: `${BASE}/zodiac/elementebi/${el}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const pairPages: MetadataRoute.Sitemap = ALL_PAIR_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/tavsebadoba/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const moonPages: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/mtvare/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const risingPages: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/amomavali/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const yearlyPages: MetadataRoute.Sitemap = [];
  for (const year of ALL_YEARLY_YEARS) {
    for (const slug of ALL_SLUGS) {
      if (!yearlyContentFor(slug, year)) continue;
      yearlyPages.push({
        url: `${BASE}/zodiac/${slug}/${year}`,
        lastModified: EVERGREEN,
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }
  }

  // Sign-level daily/tomorrow/weekly/monthly horoscope pages — 48 routes
  // total (12 signs × 4 views). High-volume Georgian queries; daily ones
  // get the freshest changeFrequency hint.
  const signHoroscopePages: MetadataRoute.Sitemap = ALL_SLUGS.flatMap(
    (slug) =>
      ALL_HOROSCOPE_VIEWS.map((view) => ({
        url: `${BASE}/zodiac/${slug}/${VIEW_PATH[view]}`,
        // Horoscope content genuinely regenerates per period — live stamp.
        lastModified: NOW,
        changeFrequency: VIEW_CHANGE_FREQ[view],
        priority: VIEW_PRIORITY[view],
      }))
  );

  // Trait-ranking listicles ("ყველაზე ჭკვიანი / ეჭვიანი … ნიშნები").
  const rankingPages: MetadataRoute.Sitemap = ALL_RANKING_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/reitingebi/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Chinese zodiac ("ზოდიაქოს ნიშნები წლების მიხედვით").
  const chinesePages: MetadataRoute.Sitemap = ALL_CHINESE_SLUGS.map((slug) => ({
    url: `${BASE}/chinuri-horoskopi/${slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Tarot — the 22 Major Arcana card pages ("ტარო [კარტი]").
  const tarotCardPages: MetadataRoute.Sitemap = TAROT_CARDS.map((c) => ({
    url: `${BASE}/taro/${c.slug}`,
    lastModified: EVERGREEN,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const thematicHoroscopePages: MetadataRoute.Sitemap =
    ALL_HOROSCOPE_THEMES.flatMap((theme) => [
      {
        url: `${BASE}${themeUrl(theme)}`,
        lastModified: CONTENT_PUBLISHED,
        changeFrequency: "monthly" as const,
        priority: 0.85,
      },
      ...ALL_SLUGS.map((sign) => ({
        url: `${BASE}${themeUrl(theme, sign)}`,
        lastModified: CONTENT_PUBLISHED,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]);

  const astrologyCalendarPages: MetadataRoute.Sitemap = calendarWindow().map(
    (day) => ({
      url: `${BASE}/astrologiuri-kalendari/${day.iso}`,
      lastModified: NOW,
      changeFrequency: "daily" as const,
      priority: 0.65,
    })
  );
  const moonEventPages: MetadataRoute.Sitemap = (["full", "new"] as const).flatMap(
    (kind) => moonEvents(kind).map((event) => ({
      url: `${BASE}/${kind === "full" ? "savse-mtvare" : "akhali-mtvare"}/${event.iso}`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  const georgianPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}`,
      lastModified: EVERGREEN,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/nataluri-ruka`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${BASE}/piradi-ruka`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${BASE}/piradi-ruka/rogor-shevadginot`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/piradi-horoskopi`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/tests`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/pirovnebis-testi`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/iq-testi`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/eq-testi`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/emociuri-inteleqti`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...EQ_ARTICLE_SLUGS.map((slug) => ({
      url: `${BASE}/emociuri-inteleqti/${slug}`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${BASE}/big-five`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/quiz/namdvili-nishani`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/quiz/varskvlavebis-zodiaqo`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/tavsebadoba`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/mbti`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/chinuri-horoskopi`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/horoskopi`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE}/horoskopi/kvireuli`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE}/horoskopi/tviuri`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...thematicHoroscopePages,
    {
      url: `${BASE}/mtvaris-kalendari`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE}/astrologiuri-kalendari`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/ighbliani-dgheebi`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE}/frtxili-dgheebi`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...astrologyCalendarPages,
    {
      url: `${BASE}/savse-mtvare`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/akhali-mtvare`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...moonEventPages,
    {
      url: `${BASE}/dabnelebebi`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...ECLIPSES.map((eclipse) => ({
      url: `${BASE}/dabnelebebi/${eclipse.slug}`,
      lastModified: CONTENT_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    })),
    {
      url: `${BASE}/taro`,
      lastModified: EVERGREEN,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/mkitxaoba`,
      lastModified: NEW_CLUSTERS_PUBLISHED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/sizmris-akhsna`,
      lastModified: NEW_CLUSTERS_PUBLISHED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...ALL_DREAM_SLUGS.map((slug) => ({
      url: `${BASE}/sizmris-akhsna/${slug}`,
      lastModified: NEW_CLUSTERS_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${BASE}/numerologia`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...LIFE_PATH_NUMBERS.map((n) => ({
      url: `${BASE}/numerologia/${n}`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${BASE}/angeluri-ricxvebi`,
      lastModified: NEW_CLUSTERS_PUBLISHED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...ALL_ANGEL_SLUGS.map((slug) => ({
      url: `${BASE}/angeluri-ricxvebi/${slug}`,
      lastModified: NEW_CLUSTERS_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${BASE}/merkuri-retrogradi`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE}/astrologiuri-saxlebi`,
      lastModified: ASTROLOGY_GUIDES_PUBLISHED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...HOUSE_NUMBERS.map((number) => ({
      url: `${BASE}/astrologiuri-saxlebi/${number}`,
      lastModified: ASTROLOGY_GUIDES_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${BASE}/planetebi`,
      lastModified: ASTROLOGY_GUIDES_PUBLISHED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...PLANET_SLUGS.map((planet) => ({
      url: `${BASE}/planetebi/${planet}`,
      lastModified: ASTROLOGY_GUIDES_PUBLISHED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${BASE}/features`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/how-it-works`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/zodiac`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/zodiac/datit`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/elementebi`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/zodiac/tavsebadoba`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/mtvare`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/amomavali`,
      lastModified: EVERGREEN,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/gzamkvlevi`,
      lastModified: EVERGREEN,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE}/zodiac/reitingebi`,
      lastModified: EVERGREEN,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...mbtiTypePages,
    ...zodiacSignPages,
    ...rankingPages,
    ...chinesePages,
    ...tarotCardPages,
    ...elementPages,
    ...pairPages,
    ...moonPages,
    ...risingPages,
    ...yearlyPages,
    ...signHoroscopePages,
    {
      url: `${BASE}/login`,
      lastModified: EVERGREEN,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE}/signup`,
      lastModified: EVERGREEN,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE}/terms`,
      lastModified: EVERGREEN,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: EVERGREEN,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  /**
   * Georgian pages whose English version lives at the same path rather than
   * on a translated slug. /horoskopi belongs here (not in CORE_LANGUAGE_PAIRS)
   * because the English daily hub is /horoskopi too — the translated-slug
   * /horoscope is a separate English-only explainer.
   */
  const SAME_PATH_PAIRS = [
    "/horoskopi",
    // These four render one tree in both languages at the same path. The
    // English sitemap already named vivida.ge as their Georgian partner, but
    // this side named nobody — a one-way annotation, which Google discards.
    "/features",
    "/how-it-works",
    "/login",
    "/signup",
  ] as const;

  const pairByKaPath = new Map<string, { ka: string; en: string }>([
    ...CORE_LANGUAGE_PAIRS.map(
      (pair) => [pair.ka, { ka: pair.ka, en: pair.en as string }] as const,
    ),
    ...SAME_PATH_PAIRS.map((path) => [path, { ka: path, en: path }] as const),
  ]);
  const georgianWithAlternates = georgianPages.map((entry) => {
    const path = new URL(entry.url).pathname;
    const pair = pairByKaPath.get(path);
    if (!pair) return entry;
    // Same builder the English and Armenian sections use, so all three sides
    // of a pair agree on whether an Armenian alternate exists.
    return { ...entry, alternates: alternatesFor(pair.ka, pair.en) };
  });

  return georgianWithAlternates;
}
