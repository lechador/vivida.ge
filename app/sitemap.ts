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
import { ALL_RANKING_SLUGS } from "@/lib/seo/rankings";
import { ALL_CHINESE_SLUGS } from "@/lib/seo/chinese-zodiac";

/**
 * Public-page sitemap. Authed surfaces (dashboard, report, friends,
 * profile editing, etc.) are excluded — they're either not crawlable
 * or behind the proxy redirect. Public profiles at /u/[username] would
 * benefit from inclusion but require enumerating the profiles table at
 * build time; punting that to a follow-up dynamic sitemap if SEO needs it.
 */
const BASE = "https://www.vivida.ge";
const NOW = new Date();

const VIEW_CHANGE_FREQ: Record<
  (typeof ALL_HOROSCOPE_VIEWS)[number],
  MetadataRoute.Sitemap[number]["changeFrequency"]
> = {
  today: "daily",
  tomorrow: "daily",
  week: "weekly",
  month: "monthly",
};

const VIEW_PRIORITY: Record<(typeof ALL_HOROSCOPE_VIEWS)[number], number> = {
  today: 0.9,
  tomorrow: 0.8,
  week: 0.85,
  month: 0.85,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const zodiacSignPages: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const elementPages: MetadataRoute.Sitemap = ALL_ELEMENT_SLUGS.map((el) => ({
    url: `${BASE}/zodiac/elementebi/${el}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const pairPages: MetadataRoute.Sitemap = ALL_PAIR_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/tavsebadoba/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const moonPages: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/mtvare/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const risingPages: MetadataRoute.Sitemap = ALL_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/amomavali/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const yearlyPages: MetadataRoute.Sitemap = [];
  for (const year of ALL_YEARLY_YEARS) {
    for (const slug of ALL_SLUGS) {
      if (!yearlyContentFor(slug, year)) continue;
      yearlyPages.push({
        url: `${BASE}/zodiac/${slug}/${year}`,
        lastModified: NOW,
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
        lastModified: NOW,
        changeFrequency: VIEW_CHANGE_FREQ[view],
        priority: VIEW_PRIORITY[view],
      }))
  );

  // Trait-ranking listicles ("ყველაზე ჭკვიანი / ეჭვიანი … ნიშნები").
  const rankingPages: MetadataRoute.Sitemap = ALL_RANKING_SLUGS.map((slug) => ({
    url: `${BASE}/zodiac/reitingebi/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Chinese zodiac ("ზოდიაქოს ნიშნები წლების მიხედვით").
  const chinesePages: MetadataRoute.Sitemap = ALL_CHINESE_SLUGS.map((slug) => ({
    url: `${BASE}/chinuri-horoskopi/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${BASE}/`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/nataluri-ruka`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${BASE}/chinuri-horoskopi`,
      lastModified: NOW,
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
      url: `${BASE}/features`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/how-it-works`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/zodiac`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/zodiac/datit`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/elementebi`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/zodiac/tavsebadoba`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/mtvare`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/amomavali`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/zodiac/gzamkvlevi`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE}/zodiac/reitingebi`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.8,
    },
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
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE}/signup`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE}/terms`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
