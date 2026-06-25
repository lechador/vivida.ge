import { ImageResponse } from "next/og";

import { readFontBuffer } from "@/app/_fonts/load";

export const runtime = "nodejs";

const NOTO_REGULAR_URL = new URL(
  "../../../_fonts/NotoSansGeorgian-Regular.ttf",
  import.meta.url
);
const NOTO_BOLD_URL = new URL(
  "../../../_fonts/NotoSansGeorgian-Bold.ttf",
  import.meta.url
);

const SIZE = { width: 1200, height: 630 };
const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Generic branded OG card for content pages. `?t=<title>&k=<kicker>&a=<#hex>`.
 * One route serves sign / ranking / Chinese-zodiac / horoscope shares so every
 * link preview is tailored. Georgian via the bundled Noto font; no glyph/emoji
 * codepoints (satori can't fetch a fallback for those).
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const title = (sp.get("t") ?? "Vivida").slice(0, 90);
  const kicker = (sp.get("k") ?? "").slice(0, 40);
  const a = sp.get("a") ?? "";
  const accent = HEX.test(a) ? a : "#b884f2";

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
          justifyContent: "center",
          backgroundColor: "#0b0814",
          backgroundImage: `radial-gradient(55% 50% at 22% 18%, ${accent}59, transparent 70%), radial-gradient(45% 40% at 88% 82%, rgba(34,211,238,0.22), transparent 70%), radial-gradient(40% 30% at 80% 12%, rgba(244,114,182,0.20), transparent 70%)`,
          color: "#ffffff",
          fontFamily: "Noto",
          padding: "84px",
          position: "relative",
        }}
      >
        {/* Brand top-right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "absolute",
            top: 64,
            right: 84,
          }}
        >
          <svg width={36} height={36} viewBox="0 0 48 48">
            <defs>
              <linearGradient id="sp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="55%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path d="M24 0 L27 21 L48 24 L27 27 L24 48 L21 27 L0 24 L21 21 Z" fill="url(#sp)" />
          </svg>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            vivida
          </div>
        </div>

        {kicker ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.14em",
              color: accent,
              marginBottom: 22,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.12,
            maxWidth: 960,
            color: "#ffffff",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 64,
            left: 84,
            fontSize: 26,
            color: "#8d82a6",
          }}
        >
          vivida.ge
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: [
        { name: "Noto", data: regular, weight: 400, style: "normal" },
        { name: "Noto", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
