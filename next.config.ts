import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import {
  ENGLISH_HOSTS,
  ENGLISH_PUBLIC_ROUTES,
  ENGLISH_SITE_URL,
  GEORGIAN_HOSTS,
} from "./lib/seo/locales";

/**
 * Georgian keyword landing pages that overlap an established English page.
 *
 * Serving the Georgian page on the international host would create a
 * language-mismatched, competing URL. A host-scoped permanent redirect keeps
 * the Georgian URLs intact on vivida.ge while consolidating English signals
 * on the existing canonical page.
 */
const ENGLISH_LEGACY_CONTENT_REDIRECTS = [
  // Renders the identical <NatalChartPageEn /> as /natal-chart, so on the
  // international host it was a straight duplicate of the canonical English
  // URL — two self-canonicalling copies competing for the same query. The
  // Georgian /nataluri-ruka is untouched: this is host-scoped.
  { source: "/nataluri-ruka", destination: "/natal-chart" },
  { source: "/piradi-ruka", destination: "/natal-chart" },
  {
    source: "/piradi-ruka/rogor-shevadginot",
    destination: "/natal-chart",
  },
  { source: "/piradi-horoskopi", destination: "/horoscope" },
  { source: "/mkitxaoba", destination: "/tarot" },
  { source: "/zodiac/tavsebadoba", destination: "/compatibility" },
] as const;

const nextConfig: NextConfig = {
  // The PDF report route reads the Georgian TTFs at runtime via fs — Vercel's
  // tracer won't pick up a dynamic path on its own, so include them explicitly
  // in that function's bundle (otherwise the font is missing on the deploy and
  // Georgian renders as tofu).
  outputFileTracingIncludes: {
    // Every route that may render a report PDF reads the Georgian TTFs via fs;
    // Vercel's tracer won't follow the dynamic path, so bundle them explicitly.
    "/api/dev/report-pdf": ["./app/_fonts/*.ttf"],
    "/api/stripe/webhook": ["./app/_fonts/*.ttf"],
    "/api/reports/checkout": ["./app/_fonts/*.ttf"],
    "/api/reports/[id]": ["./app/_fonts/*.ttf"],
  },
  async redirects() {
    // The personality test moved from /test to the keyword-rich Georgian slug
    // /pirovnebis-testi ("პიროვნების ტესტი"). 301 the old paths so any early
    // links/indexing carry over.
    // Only the Georgian hosts expose /en as a legacy public URL. On the
    // English hosts, clean public paths are internally rewritten to /en/*;
    // redirecting those internal destinations back to the clean URL creates
    // a self-redirect loop (most visibly on vividaastro.com/).
    const legacyEnglishRedirects = GEORGIAN_HOSTS.flatMap((host) =>
      ENGLISH_PUBLIC_ROUTES.map((route) => ({
        source: route.internalEn,
        has: [{ type: "host" as const, value: host }],
        destination: `${ENGLISH_SITE_URL}${route.en === "/" ? "" : route.en}`,
        permanent: true,
      })),
    );

    const legacyContentRedirects = ENGLISH_HOSTS.flatMap((host) =>
      ENGLISH_LEGACY_CONTENT_REDIRECTS.map(({ source, destination }) => ({
        source,
        has: [{ type: "host" as const, value: host }],
        destination: `${ENGLISH_SITE_URL}${destination}`,
        permanent: true,
      })),
    );

    return [
      ...legacyEnglishRedirects,
      ...legacyContentRedirects,
      { source: "/test", destination: "/pirovnebis-testi", permanent: true },
      { source: "/test/claim", destination: "/pirovnebis-testi/claim", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // Keep the public global URLs clean while reusing the established /en
      // route tree internally. Shared authenticated/API routes are untouched.
      beforeFiles: ENGLISH_HOSTS.flatMap((host) =>
        ENGLISH_PUBLIC_ROUTES.map((route) => ({
          source: route.en,
          has: [{ type: "host" as const, value: host }],
          destination: route.internalEn,
        })),
      ),
    };
  },
  async headers() {
    // The international domain serves English at the root and Armenian under
    // /am. Every matching rule is applied, so the English rule has to exclude
    // the Armenian prefix explicitly — otherwise /am/* would come back with
    // two Content-Language values.
    return ENGLISH_HOSTS.flatMap((host) => [
      {
        source: "/am/:path*",
        has: [{ type: "host" as const, value: host }],
        headers: [{ key: "Content-Language", value: "hy" }],
      },
      {
        source: "/am",
        has: [{ type: "host" as const, value: host }],
        headers: [{ key: "Content-Language", value: "hy" }],
      },
      {
        source: "/((?!am(?:/|$)).*)",
        has: [{ type: "host" as const, value: host }],
        headers: [{ key: "Content-Language", value: "en" }],
      },
    ]);
  },
  images: {
    // User photos are immutable R2 keys. Keep optimized derivatives for a
    // month and expose only the widths/qualities the UI actually uses.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 24, 32, 40, 48, 56, 64, 96, 128, 160, 256, 384],
    qualities: [60, 75],
    remotePatterns: [
      // Google avatar images
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
      // Cloudflare R2 — dev-mode public buckets + custom domains
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      // Local fallback before the production R2 seed is run.
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Own-domain absolute URLs (the Vivida brand account's avatar points
      // at www.vivida.ge/apple-icon.png; without this its profile page 500s).
      { protocol: "https", hostname: "www.vivida.ge" },
      { protocol: "https", hostname: "www.vividaastro.com" },
    ],
  },
};

const canUploadSentrySourceMaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT,
);

const nextConfigWithSentry = withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !canUploadSentrySourceMaps,
  telemetry: false,
  sourcemaps: {
    // Local and preview builds must stay credential-free. Production CI gets
    // readable stack traces as soon as all three build credentials are set.
    disable: !canUploadSentrySourceMaps,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

export default nextConfigWithSentry;
