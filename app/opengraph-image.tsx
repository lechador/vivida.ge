import { ImageResponse } from "next/og";

/**
 * Default OG image for the entire site (1200×630). Pages that want a
 * tailored card can drop their own `opengraph-image.tsx` next to their
 * `page.tsx`. This file double-serves Twitter via the `twitter` metadata
 * fallback rules in app/layout.tsx — so we don't need a separate
 * twitter-image.tsx unless we want different copy.
 *
 * Renders edge-side via next/og's ImageResponse. Georgian glyphs require
 * an explicit font fetch — system fonts on Vercel's edge don't carry the
 * Georgian script, so without this the headline would render as boxes.
 */

export const runtime = "edge";

export const alt = "Vivida — შენი კოსმიური რუკა";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Noto Sans Georgian directly from Google Fonts CDN. URLs are stable
// across font releases for a given filename, and the fetch is cached
// across builds. We pull two weights so the wordmark and the tagline
// can have proper visual hierarchy.
const NOTO_REGULAR =
  "https://fonts.gstatic.com/s/notosansgeorgian/v46/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdpvnzFj-f5WK0OQV.ttf";
const NOTO_BOLD =
  "https://fonts.gstatic.com/s/notosansgeorgian/v46/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdptnyVj-f5WK0OQV.ttf";

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch failed: ${url}`);
  return res.arrayBuffer();
}

export default async function OpengraphImage() {
  const [regular, bold] = await Promise.all([
    loadFont(NOTO_REGULAR),
    loadFont(NOTO_BOLD),
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
          შენი კოსმიური რუკა, ახსნილი ყოველდღე
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
