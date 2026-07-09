import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import sharp from "sharp";

import { db } from "@/db";
import { mbtiTestResults } from "@/db/schema";
import {
  AXIS_LABEL_KA,
  AXIS_POLES,
  mbtiBaseType,
  type MbtiAxis,
} from "@/lib/mbti-questions";
import { readFontBuffer } from "../../_fonts/load";

const NOTO_REGULAR_URL = new URL(
  "../../_fonts/NotoSansGeorgian-Regular.ttf",
  import.meta.url
);
const NOTO_BOLD_URL = new URL(
  "../../_fonts/NotoSansGeorgian-Bold.ttf",
  import.meta.url
);

export const runtime = "nodejs";
export const alt = "Astro-MBTI შედეგი";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AXES: MbtiAxis[] = ["EI", "SN", "TF", "JP", "AT"];

/** Fetch the type character from our own host and return a PNG data URI. */
async function characterDataUri(type: string): Promise<string | null> {
  try {
    const h = await headers();
    const host = h.get("host");
    if (!host) return null;
    const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
    const res = await fetch(`${proto}://${host}/mbti/${mbtiBaseType(type).toLowerCase()}.webp`);
    if (!res.ok) return null;
    const webp = Buffer.from(await res.arrayBuffer());
    const png = await sharp(webp).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [r] = await db
    .select({
      mbtiType: mbtiTestResults.mbtiType,
      archetypeNameGe: mbtiTestResults.archetypeNameGe,
      scores: mbtiTestResults.scores,
    })
    .from(mbtiTestResults)
    .where(eq(mbtiTestResults.id, id))
    .limit(1);

  const [regular, bold, character] = await Promise.all([
    readFontBuffer(NOTO_REGULAR_URL),
    readFontBuffer(NOTO_BOLD_URL),
    r ? characterDataUri(r.mbtiType) : Promise.resolve(null),
  ]);

  const type = r?.mbtiType ?? "";
  const archetype = r?.archetypeNameGe ?? "";
  const scores = r?.scores;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          backgroundColor: "#0b0814",
          backgroundImage:
            "radial-gradient(55% 50% at 25% 25%, rgba(167,139,250,0.35), transparent 70%), radial-gradient(45% 40% at 90% 80%, rgba(34,211,238,0.22), transparent 70%)",
          color: "#ffffff",
          fontFamily: "Noto",
          padding: "64px 72px",
        }}
      >
        {/* Character */}
        {character ? (
          <img
            src={character}
            alt=""
            width={360}
            height={360}
            style={{ width: 360, height: 360, objectFit: "contain" }}
          />
        ) : (
          <div style={{ display: "flex", width: 360, height: 360 }} />
        )}

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#c4b5fd", letterSpacing: "0.24em" }}>
            VIVIDA · ASTRO-MBTI
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              marginTop: 10,
              letterSpacing: "0.02em",
              backgroundImage: "linear-gradient(120deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {type}
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#ffffff", marginTop: 6 }}>
            {archetype}
          </div>

          {/* Axis bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30 }}>
            {scores
              ? AXES.map((axis) => {
                  const s = scores[axis];
                  if (!s) return null;
                  const [firstKa, secondKa] = AXIS_LABEL_KA[axis];
                  const winnerIsFirst = s.letter === AXIS_POLES[axis][0];
                  const label = winnerIsFirst ? firstKa : secondKa;
                  const firstPct = winnerIsFirst ? s.pct : 100 - s.pct;
                  return (
                    <div key={axis} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ display: "flex", width: 260, fontSize: 22, color: "#e9e3ff" }}>
                        {label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          height: 12,
                          borderRadius: 999,
                          backgroundColor: "rgba(244,114,182,0.30)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            width: `${firstPct}%`,
                            height: 12,
                            borderRadius: 999,
                            backgroundColor: "#22d3ee",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", width: 64, fontSize: 22, fontWeight: 700, color: "#ffffff", justifyContent: "flex-end" }}>
                        {s.pct}%
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
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
