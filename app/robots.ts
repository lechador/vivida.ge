import type { MetadataRoute } from "next";

/**
 * robots.txt — allow all public pages, block authed app surfaces and any
 * API routes from being indexed (they only return JSON or auth-required
 * HTML, both useless to search engines and noisy in results).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/report",
          "/discover",
          "/friends",
          "/account",
          "/onboarding",
          "/billing/",
          "/reset-password",
        ],
      },
    ],
    sitemap: "https://www.vivida.ge/sitemap.xml",
    host: "https://www.vivida.ge",
  };
}
