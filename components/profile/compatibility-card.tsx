"use client";

import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  type SynastryCategory,
  type SynastryResult,
} from "@/lib/synastry";
import { CATEGORY_LABEL_EN } from "@/lib/synastry-en";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * 1080×1920 (Instagram Story) compatibility card. Rendered as plain
 * DOM via inline styles so html-to-image's foreignObject capture
 * snapshots it pixel-perfect. Lives off-screen until the share dialog
 * triggers a screenshot.
 *
 * Inline styles only — no Tailwind, no CSS variables. html-to-image
 * sometimes loses external/var-based styles when serialising the SVG
 * foreignObject, and we'd rather take the verbosity hit than ship a
 * broken render.
 */

const VIVIDA_VIOLET = "#a78bfa";
const VIVIDA_PINK = "#f472b6";
const VIVIDA_CYAN = "#22d3ee";
const TOP_CATEGORIES: SynastryCategory[] = [
  "love",
  "chemistry",
  "communication",
  "friendship",
];

export type CompatibilityCardProps = {
  viewerName: string;
  viewerSignLabel: string;
  viewerSignSymbol: string;
  partnerName: string;
  partnerSignLabel: string;
  partnerSignSymbol: string;
  result: SynastryResult;
  verdict: string;
  locale?: UserLocale;
};

export function CompatibilityCard({
  viewerName,
  viewerSignLabel,
  viewerSignSymbol,
  partnerName,
  partnerSignLabel,
  partnerSignSymbol,
  result,
  verdict,
  locale = "ka",
}: CompatibilityCardProps) {
  const en = locale === "en";
  const overall = Math.round(result.overall);

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0b0814",
        backgroundImage: [
          `radial-gradient(60% 35% at 50% 18%, rgba(167,139,250,0.55), transparent 70%)`,
          `radial-gradient(50% 30% at 85% 60%, rgba(34,211,238,0.32), transparent 70%)`,
          `radial-gradient(45% 30% at 15% 80%, rgba(244,114,182,0.4), transparent 70%)`,
          `linear-gradient(160deg, #1a0f33 0%, #0b0814 50%, #2a1145 100%)`,
        ].join(", "),
        color: "#ffffff",
        fontFamily:
          "'Noto Sans Georgian', 'Noto Sans', system-ui, sans-serif",
        padding: "120px 80px 100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Star sparkles for cosmic feel */}
      {[
        { top: 80, left: 120, size: 6, glow: 18 },
        { top: 220, left: 940, size: 8, glow: 24 },
        { top: 380, left: 60, size: 5, glow: 16 },
        { top: 1260, left: 80, size: 6, glow: 18 },
        { top: 1420, left: 980, size: 9, glow: 28 },
        { top: 1700, left: 220, size: 5, glow: 16 },
        { top: 1820, left: 880, size: 7, glow: 22 },
        { top: 880, left: 1000, size: 4, glow: 14 },
        { top: 1060, left: 50, size: 5, glow: 16 },
        { top: 600, left: 540, size: 4, glow: 12 },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: 9999,
            backgroundColor: "#ffffff",
            opacity: 0.85,
            boxShadow: `0 0 ${s.glow}px rgba(167,139,250,0.85)`,
          }}
        />
      ))}

      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: VIVIDA_VIOLET,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            background: `linear-gradient(135deg, ${VIVIDA_VIOLET} 0%, ${VIVIDA_PINK} 55%, ${VIVIDA_CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          vivida
        </div>
      </div>

      {/* Names + signs */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        <NamePill
          name={viewerName}
          signLabel={viewerSignLabel}
          signSymbol={viewerSignSymbol}
          tint={VIVIDA_VIOLET}
        />
        <div
          style={{
            fontSize: 60,
            color: VIVIDA_PINK,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
        <NamePill
          name={partnerName}
          signLabel={partnerSignLabel}
          signSymbol={partnerSignSymbol}
          tint={VIVIDA_CYAN}
        />
      </div>

      {/* Big number */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 30,
            color: "rgba(196,181,253,0.85)",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {en ? "COMPATIBILITY" : "თავსებადობა"}
        </div>
        <div
          style={{
            fontSize: 320,
            fontWeight: 700,
            letterSpacing: "-0.06em",
            background: `linear-gradient(135deg, ${VIVIDA_VIOLET} 0%, ${VIVIDA_PINK} 50%, ${VIVIDA_CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          {overall}%
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            marginTop: 16,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.1,
          }}
        >
          {verdict}
        </div>
      </div>

      {/* Category bars */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        {TOP_CATEGORIES.map((cat) => {
          const score = Math.round(result.scores[cat]);
          return (
            <CategoryBar
              key={cat}
              emoji={CATEGORY_EMOJI[cat]}
              label={en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
              score={score}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {en ? "Discover your compatibility" : "გაიგე შენი თავსებადობა"}
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${VIVIDA_VIOLET} 0%, ${VIVIDA_CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.01em",
          }}
        >
          vivida.ge
        </div>
      </div>
    </div>
  );
}

function NamePill({
  name,
  signLabel,
  signSymbol,
  tint,
}: {
  name: string;
  signLabel: string;
  signSymbol: string;
  tint: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        backgroundColor: "rgba(255,255,255,0.06)",
        border: `3px solid ${tint}`,
        borderRadius: 9999,
        padding: "24px 56px",
        boxShadow: `0 0 60px ${tint}55`,
      }}
    >
      <div
        style={{
          fontSize: 64,
          color: tint,
          lineHeight: 1,
        }}
      >
        {signSymbol}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {truncate(name, 16)}
        </div>
        <div
          style={{
            fontSize: 26,
            color: tint,
            marginTop: 6,
            lineHeight: 1,
          }}
        >
          {signLabel}
        </div>
      </div>
    </div>
  );
}

function CategoryBar({
  emoji,
  label,
  score,
}: {
  emoji: string;
  label: string;
  score: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 38,
          width: 60,
          textAlign: "center",
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          fontSize: 32,
          color: "rgba(255,255,255,0.9)",
          width: 280,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 22,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 9999,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${score}%`,
            background: `linear-gradient(90deg, ${VIVIDA_VIOLET}, ${VIVIDA_PINK}, ${VIVIDA_CYAN})`,
            borderRadius: 9999,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: "#ffffff",
          width: 100,
          textAlign: "right",
        }}
      >
        {score}%
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}
