import { ImageResponse } from "next/og";

import { readFontBuffer } from "./_fonts/load";

// Static URL literals so Webpack copies the .ttf into the function
// bundle. Don't move these into a helper — a parameterised path makes
// the asset reference invisible to the bundler.
const NOTO_REGULAR_URL = new URL(
  "./_fonts/NotoSansGeorgian-Regular.ttf",
  import.meta.url
);
const NOTO_BOLD_URL = new URL(
  "./_fonts/NotoSansGeorgian-Bold.ttf",
  import.meta.url
);

/**
 * Default OG image for the entire site (1200×630). Pages that want a
 * tailored card can drop their own `opengraph-image.tsx` next to their
 * `page.tsx`. This file double-serves Twitter via the `twitter` metadata
 * fallback rules in app/layout.tsx — so we don't need a separate
 * twitter-image.tsx unless we want different copy.
 *
 * Runs on the Node runtime so we can read the bundled Georgian font
 * from disk. Vercel's Node fetch doesn't support file:// URLs, which
 * is why we don't use the next/og-typical fetch(import.meta.url)
 * pattern here.
 */

export const runtime = "nodejs";

export const alt = "Vivida — შენი კოსმიური რუკა";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [regular, bold] = await Promise.all([
    readFontBuffer(NOTO_REGULAR_URL),
    readFontBuffer(NOTO_BOLD_URL),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0814",
          backgroundImage:
            "radial-gradient(60% 50% at 50% 30%, rgba(167,139,250,0.35), transparent 70%), radial-gradient(45% 35% at 85% 70%, rgba(34,211,238,0.25), transparent 70%), radial-gradient(40% 30% at 15% 75%, rgba(244,114,182,0.20), transparent 70%)",
          color: "#ffffff",
          fontFamily: "Noto",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Star sparkles for cosmic feel — tiny solid circles. */}
        {[
          { top: 90, left: 140, size: 6 },
          { top: 140, left: 1050, size: 8 },
          { top: 470, left: 220, size: 5 },
          { top: 510, left: 980, size: 7 },
          { top: 80, left: 700, size: 4 },
          { top: 540, left: 600, size: 5 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              opacity: 0.85,
              boxShadow: "0 0 12px rgba(167,139,250,0.7)",
              display: "flex",
            }}
          />
        ))}

        {/* Brand sparkle ✦ + wordmark — gradient text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 96,
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            ✦
          </div>
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            vivida
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
            justifyContent: "center",
          }}
        >
          შენი კოსმიური რუკა ყოველდღე ცოცხლდება
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#c4b5fd",
            marginTop: 28,
            textAlign: "center",
          }}
        >
          ნატალური რუკა · ყოველდღიური ჰოროსკოპი · თავსებადობა
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto", data: regular, weight: 400, style: "normal" },
        { name: "Noto", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
