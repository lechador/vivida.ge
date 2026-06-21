import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The PDF report route reads the Georgian TTFs at runtime via fs — Vercel's
  // tracer won't pick up a dynamic path on its own, so include them explicitly
  // in that function's bundle (otherwise the font is missing on the deploy and
  // Georgian renders as tofu).
  outputFileTracingIncludes: {
    "/api/dev/report-pdf": ["./app/_fonts/*.ttf"],
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
    ],
  },
};

export default nextConfig;
