import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { siteOriginForHost } from "@/lib/seo/locales";

/**
 * robots.txt — allow all public pages, block authed app surfaces and any
 * API routes from being indexed (they only return JSON or auth-required
 * HTML, both useless to search engines and noisy in results).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const origin = siteOriginForHost(host);

  return {
    rules: [
      {
        userAgent: "*",
        // /api/og/* renders the og:image every social card points at, so it
        // has to stay crawlable despite the blanket /api/ block — the longer
        // Allow prefix wins over the shorter Disallow for Google and Bing.
        allow: ["/", "/api/og/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/report",
          "/discover",
          "/friends",
          "/account",
          "/onboarding",
          "/reset-password",
        ],
      },
    ],
    sitemap: [`${origin}/sitemap.xml`, `${origin}/articles/feed.xml`],
    host: origin,
  };
}
