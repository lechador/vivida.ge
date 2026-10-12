"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { detectAspects } from "@/lib/aspects";
import { bodyMeta, signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const SIZE = 480;
const CX = SIZE / 2;
const CY = SIZE / 2;

const R_OUTER = 232;        // chart outer edge
const R_ZODIAC_IN = 196;    // inner edge of zodiac band
const R_HOUSE_OUT = 196;    // outer edge of house band (= inner zodiac)
const R_HOUSE_IN = 144;     // inner edge of house band
const R_PLANET = 116;       // planet glyph ring
const R_ASPECT = 100;       // aspect lines drawn from this radius inward
const R_TICK = 200;         // small tick marks at 5° intervals

const ELEMENT_FILL: Record<string, string> = {
  ცეცხლი: "oklch(0.55 0.2 25 / 0.08)",
  მიწა:   "oklch(0.5 0.12 130 / 0.07)",
  ჰაერი:  "oklch(0.55 0.16 220 / 0.08)",
  წყალი:  "oklch(0.5 0.18 280 / 0.10)",
};

const ASPECT_STYLE: Record<
  string,
  { stroke: string; dash?: string }
> = {
  conjunction: { stroke: "oklch(0.85 0.16 85 / 0.55)" },
  sextile:     { stroke: "oklch(0.78 0.18 200 / 0.45)" },
  trine:       { stroke: "oklch(0.78 0.18 200 / 0.55)" },
  square:      { stroke: "oklch(0.72 0.22 350 / 0.45)", dash: "3 3" },
  opposition:  { stroke: "oklch(0.72 0.22 350 / 0.55)", dash: "5 4" },
};

const PLANET_ORDER = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

/** Convert ecliptic longitude → clock angle (0 = top, increases clockwise). */
function clockAngle(longitude: number, ascLng: number): number {
  const a = (270 - (longitude - ascLng)) % 360;
  return a < 0 ? a + 360 : a;
}

function polar(cx: number, cy: number, r: number, ang: number) {
  const rad = (ang * Math.PI) / 180;
  // Math.sin/cos are not bit-identical across JS engines (V8 ≠ SpiderMonkey),
  // so SSR markup and client hydration produce different stringified attrs.
  // Rounding to 2 decimals collapses both to the same string representation.
  return {
    x: Math.round((cx + r * Math.sin(rad)) * 100) / 100,
    y: Math.round((cy - r * Math.cos(rad)) * 100) / 100,
  };
}

/**
 * SVG path for an annular sector going CCW from clock angle a1 to a2.
 * (a1 should be the larger angle; a2 the smaller, i.e. moving with
 * increasing ecliptic longitude on the wheel.)
 */
function sectorPath(
  r1: number,
  r2: number,
  a1: number,
  a2: number
): string {
  const span = (a1 - a2 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  const p1 = polar(CX, CY, r2, a1); // outer start
  const p2 = polar(CX, CY, r2, a2); // outer end
  const p3 = polar(CX, CY, r1, a2); // inner end
  const p4 = polar(CX, CY, r1, a1); // inner start
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 ${large} 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `Z`,
  ].join(" ");
}

/**
 * Pull near-overlapping planet glyphs slightly apart radially so symbols
 * stay legible. We scan adjacent planets in longitude order and offset
 * any pair within ~7° of each other.
 */
function staggerOffsets(
  bodies: Array<{ key: string; longitude: number }>
): Record<string, number> {
  const sorted = [...bodies].sort((a, b) => a.longitude - b.longitude);
  const out: Record<string, number> = {};
  for (let i = 0; i < sorted.length; i++) {
    out[sorted[i].key] = 0;
  }
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].longitude - sorted[i - 1].longitude;
    if (gap < 7) {
      // Push the later planet inward slightly
      out[sorted[i].key] = (out[sorted[i - 1].key] ?? 0) - 14;
    }
  }
  return out;
}

export function ChartWheel({
  chart,
  locale = "ka",
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const ascLng = chart.ascendant.longitude;

  // Aspects + planet placement are O(n²) over the bodies and never change
  // for a given chart. Memoize so React's reconciler can skip the work on
  // any parent re-render.
  const { aspects, planetEntries, radialOffsets } = useMemo(() => {
    const aspects = detectAspects(chart.bodies);
    const planetEntries = PLANET_ORDER
      .filter((k) => chart.bodies[k])
      .map((k) => ({ key: k, ...chart.bodies[k] }));
    const radialOffsets = staggerOffsets(planetEntries);
    return { aspects, planetEntries, radialOffsets };
  }, [chart]);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={locale !== "ka" ? "Natal chart wheel" : "ნატალური რუკის ბორბალი"}
      className="select-none"
    >
      <defs>
        <radialGradient id="vivida-wheel-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.18 0.04 280)" stopOpacity="0.95" />
          <stop offset="60%" stopColor="oklch(0.13 0.03 280)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.13 0.03 280 / 0)" />
        </radialGradient>
        <filter id="vivida-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background disc */}
      <motion.circle
        cx={CX}
        cy={CY}
        r={R_OUTER}
        fill="url(#vivida-wheel-bg)"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Zodiac sectors with element-coloured tints */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const sign = signByIndex(i);
          const a1 = clockAngle(i * 30, ascLng);
          const a2 = clockAngle((i + 1) * 30, ascLng);
          const fill = ELEMENT_FILL[sign.element] ?? "transparent";
          return (
            <path
              key={`sector-${i}`}
              d={sectorPath(R_ZODIAC_IN, R_OUTER, a1, a2)}
              fill={fill}
              stroke="oklch(0.92 0.02 280 / 0.08)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Sign glyphs at sector midpoints */}
        {Array.from({ length: 12 }).map((_, i) => {
          const sign = signByIndex(i);
          const a = clockAngle(i * 30 + 15, ascLng);
          const p = polar(CX, CY, (R_OUTER + R_ZODIAC_IN) / 2, a);
          return (
            <text
              key={`sign-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fill="oklch(0.97 0.02 280 / 0.85)"
              filter="url(#vivida-glow)"
            >
              {sign.symbol}
            </text>
          );
        })}

        {/* 5° tick marks */}
        {Array.from({ length: 72 }).map((_, i) => {
          const a = clockAngle(i * 5, ascLng);
          const p1 = polar(CX, CY, R_OUTER, a);
          const p2 = polar(CX, CY, R_TICK, a);
          const major = i % 6 === 0;
          return (
            <line
              key={`tick-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="oklch(0.9 0.02 280 / 0.18)"
              strokeWidth={major ? 1.2 : 0.5}
            />
          );
        })}
      </motion.g>

      {/* House divisions + numbers */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {chart.houses.map((house) => {
          const a = clockAngle(house.cuspLongitude, ascLng);
          const inner = polar(CX, CY, R_HOUSE_IN, a);
          const outer = polar(CX, CY, R_HOUSE_OUT, a);
          const isAxis =
            house.number === 1 ||
            house.number === 4 ||
            house.number === 7 ||
            house.number === 10;
          return (
            <line
              key={`cusp-${house.number}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={
                isAxis
                  ? "oklch(0.85 0.05 280 / 0.55)"
                  : "oklch(0.85 0.05 280 / 0.2)"
              }
              strokeWidth={isAxis ? 1.4 : 0.7}
            />
          );
        })}

        {/* House numbers placed at sector midpoints */}
        {chart.houses.map((house, i) => {
          const next =
            chart.houses.find((h) => h.number === ((house.number % 12) + 1)) ??
            chart.houses[(i + 1) % chart.houses.length];
          const startAng = clockAngle(house.cuspLongitude, ascLng);
          const endAng = clockAngle(next.cuspLongitude, ascLng);
          let mid = (startAng + endAng) / 2;
          // Handle wrap (when sector crosses 0°/360°)
          if (Math.abs(startAng - endAng) > 180) mid = (mid + 180) % 360;
          const p = polar(CX, CY, (R_HOUSE_IN + R_HOUSE_OUT) / 2, mid);
          return (
            <text
              key={`hn-${house.number}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fill="oklch(0.85 0.05 280 / 0.6)"
              fontWeight={500}
            >
              {house.number}
            </text>
          );
        })}

        {/* Inner house circle outline */}
        <circle
          cx={CX}
          cy={CY}
          r={R_HOUSE_IN}
          fill="none"
          stroke="oklch(0.85 0.05 280 / 0.25)"
          strokeWidth={0.8}
        />

        {/* AC / DC / IC / MC labels at the four cardinal axes */}
        {chart.houses
          .filter((h) =>
            h.number === 1 || h.number === 4 || h.number === 7 || h.number === 10
          )
          .map((h) => {
            const a = clockAngle(h.cuspLongitude, ascLng);
            const p = polar(CX, CY, R_OUTER + 14, a);
            const label =
              h.number === 1
                ? "AC"
                : h.number === 7
                  ? "DC"
                  : h.number === 10
                    ? "MC"
                    : "IC";
            return (
              <text
                key={`axis-${h.number}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={600}
                letterSpacing={0.5}
                fill="oklch(0.97 0.02 280 / 0.75)"
              >
                {label}
              </text>
            );
          })}
      </motion.g>

      {/* Aspect lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {aspects.map((asp, i) => {
          const a = chart.bodies[asp.a];
          const b = chart.bodies[asp.b];
          if (!a || !b) return null;
          // Don't draw conjunctions as lines (they'd be too short to see)
          if (asp.kind === "conjunction") return null;
          const pa = polar(CX, CY, R_ASPECT, clockAngle(a.longitude, ascLng));
          const pb = polar(CX, CY, R_ASPECT, clockAngle(b.longitude, ascLng));
          const style = ASPECT_STYLE[asp.kind] ?? ASPECT_STYLE.conjunction;
          return (
            <line
              key={`asp-${i}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={style.stroke}
              strokeWidth={0.8 + asp.intensity * 1.4}
              strokeDasharray={style.dash}
              strokeLinecap="round"
            />
          );
        })}
      </motion.g>

      {/* Planet glyphs */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        {planetEntries.map((p, i) => {
          const meta = bodyMeta(p.key);
          const a = clockAngle(p.longitude, ascLng);
          const r = R_PLANET + (radialOffsets[p.key] ?? 0);
          const pos = polar(CX, CY, r, a);
          // Tick mark from inside the house ring out to where the symbol sits
          const tickOuter = polar(CX, CY, R_HOUSE_IN - 4, a);
          const tickInner = polar(CX, CY, r + 12, a);
          return (
            <motion.g
              key={`p-${p.key}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.55 + i * 0.05,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <line
                x1={tickInner.x}
                y1={tickInner.y}
                x2={tickOuter.x}
                y2={tickOuter.y}
                stroke="oklch(0.9 0.04 280 / 0.4)"
                strokeWidth={0.7}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={11}
                fill="oklch(0.16 0.04 280 / 0.95)"
                stroke="oklch(0.78 0.18 305 / 0.6)"
                strokeWidth={1}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fill="white"
                filter="url(#vivida-glow)"
              >
                {meta?.symbol ?? "?"}
              </text>
              {p.retrograde && (
                <text
                  x={pos.x + 10}
                  y={pos.y - 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8}
                  fontWeight={700}
                  fill="oklch(0.72 0.22 350)"
                >
                  ℞
                </text>
              )}
            </motion.g>
          );
        })}
      </motion.g>
    </svg>
  );
}
