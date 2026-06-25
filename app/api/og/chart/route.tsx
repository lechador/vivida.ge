import { ImageResponse } from "next/og";

import { readFontBuffer } from "@/app/_fonts/load";
import { signByIndex } from "@/lib/zodiac";
import { ELEMENT_COLOR } from "@/lib/pdf/theme";

export const runtime = "nodejs";

// Static URL literals so Webpack copies the .ttf into this function's bundle.
const NOTO_REGULAR_URL = new URL(
  "../../../_fonts/NotoSansGeorgian-Regular.ttf",
  import.meta.url
);
const NOTO_BOLD_URL = new URL(
  "../../../_fonts/NotoSansGeorgian-Bold.ttf",
  import.meta.url
);

const SIZE = { width: 1200, height: 630 };
const isIdx = (n: number) => Number.isInteger(n) && n >= 0 && n < 12;

/**
 * Dynamic OG image for shared natal charts. `?big=<sun>.<moon>.<asc>` (sign
 * indices, no birth data → privacy-safe). Renders the shared "big three" on a
 * branded cosmic card. Georgian via the bundled Noto font; no glyph/emoji
 * codepoints (satori would fail to fetch a fallback font for those).
 */
export async function GET(req: Request) {
  const big = new URL(req.url).searchParams.get("big") ?? "";
  const idxs = big.split(".").map((s) => parseInt(s, 10));
  const trio = [
    { label: "მზე", i: idxs[0] },
    { label: "მთვარე", i: idxs[1] },
    { label: "ამომავალი", i: idxs[2] },
  ].filter((t) => isIdx(t.i));
  const hasTrio = trio.length === 3;

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
            "radial-gradient(60% 50% at 50% 20%, rgba(167,139,250,0.35), transparent 70%), radial-gradient(45% 35% at 85% 75%, rgba(34,211,238,0.25), transparent 70%), radial-gradient(40% 30% at 12% 78%, rgba(244,114,182,0.22), transparent 70%)",
          color: "#ffffff",
          fontFamily: "Noto",
          padding: "70px",
          position: "relative",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: hasTrio ? 18 : 30,
          }}
        >
          <svg width={52} height={52} viewBox="0 0 48 48">
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
              fontSize: 64,
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

        <div
          style={{
            display: "flex",
            fontSize: 46,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: hasTrio ? 44 : 20,
          }}
        >
          {hasTrio ? "ჩემი ნატალური რუკა" : "ნატალური რუკა ონლაინ"}
        </div>

        {hasTrio ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 56 }}>
            {trio.map((t) => {
              const sign = signByIndex(t.i);
              const color = ELEMENT_COLOR[sign.element] ?? "#b884f2";
              return (
                <div
                  key={t.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 300,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 24,
                      color: "#b4a9c9",
                      letterSpacing: "0.12em",
                      marginBottom: 14,
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: 16,
                      height: 16,
                      borderRadius: 9999,
                      backgroundColor: color,
                      marginBottom: 16,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      fontSize: 52,
                      fontWeight: 700,
                      color,
                    }}
                  >
                    {sign.labelKa}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#c4b5fd",
              textAlign: "center",
            }}
          >
            გამოთვალე შენი რუკა უფასოდ — პლანეტები, სახლები, ასპექტები
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 56,
            fontSize: 26,
            color: "#8d82a6",
          }}
        >
          vivida.ge · გამოთვალე შენი ნატალური რუკა უფასოდ
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
