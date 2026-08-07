import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
    return [
      { source: "/test", destination: "/pirovnebis-testi", permanent: true },
      { source: "/test/claim", destination: "/pirovnebis-testi/claim", permanent: true },
    ];
  },
  images: {
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
    ],
  },
};

const canUploadSentrySourceMaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT,
);

export default withSentryConfig(nextConfig, {
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
