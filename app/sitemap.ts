import type { MetadataRoute } from "next";

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

/**
 * Public-page sitemap. Authed surfaces (dashboard, report, friends,
 * profile editing, etc.) are excluded — they're either not crawlable
 * or behind the proxy redirect. Public profiles at /u/[username] would
 * benefit from inclusion but require enumerating the profiles table at
 * build time; punting that to a follow-up dynamic sitemap if SEO needs it.
 */
const BASE = "https://www.vivida.ge";

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

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [
    {
      url: `${BASE}/`,
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
    {
      url: `${BASE}/mtvaris-kalendari`,
      lastModified: NOW,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE}/taro`,
      lastModified: EVERGREEN,
      changeFrequency: "weekly",
      priority: 0.9,
    },
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
      url: `${BASE}/merkuri-retrogradi`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.85,
    },
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
}
