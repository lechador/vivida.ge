import type { MetadataRoute } from "next";

/**
 * Public-page sitemap. Authed surfaces (dashboard, report, friends,
 * profile editing, etc.) are excluded — they're either not crawlable
 * or behind the proxy redirect. Public profiles at /u/[username] would
 * benefit from inclusion but require enumerating the profiles table at
 * build time; punting that to a follow-up dynamic sitemap if SEO needs it.
 */
const BASE = "https://vivida.ge";
const NOW = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1,
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
      url: `${BASE}/pricing`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
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
