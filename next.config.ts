import type { NextConfig } from "next";

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
      // Own-domain absolute URLs (the Vivida brand account's avatar points
      // at www.vivida.ge/apple-icon.png; without this its profile page 500s).
      { protocol: "https", hostname: "www.vivida.ge" },
    ],
  },
};

export default nextConfig;
