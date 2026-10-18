"use client";

import { motion } from "framer-motion";

import { SIGNS } from "@/lib/zodiac";

const round = (n: number) => Number(n.toFixed(4));

export type AstrolabeBodyNode = {
  key: string;
  glyph: string;
  angleDeg: number;
  orbitRadius: number;
  labelKa: string;
  labelEn: string;
};

export const ASTROLABE_BODIES: AstrolabeBodyNode[] = [
  {
    key: "sun",
    glyph: "☉",
    angleDeg: -42,
    orbitRadius: 31,
    labelKa: "მზე",
    labelEn: "Sun",
  },
  {
    key: "moon",
    glyph: "☽",
    angleDeg: 148,
    orbitRadius: 25,
    labelKa: "მთვარე",
    labelEn: "Moon",
  },
  {
    key: "ascendant",
    glyph: "↑",
    angleDeg: 180,
    orbitRadius: 36,
    labelKa: "ასცენდენტი",
    labelEn: "Ascendant",
  },
  {
    key: "mercury",
    glyph: "☿",
    angleDeg: -18,
    orbitRadius: 27,
    labelKa: "მერკური",
    labelEn: "Mercury",
  },
  {
    key: "venus",
    glyph: "♀",
    angleDeg: 28,
    orbitRadius: 32,
    labelKa: "ვენერა",
    labelEn: "Venus",
  },
  {
    key: "mars",
    glyph: "♂",
    angleDeg: 96,
    orbitRadius: 29,
    labelKa: "მარსი",
    labelEn: "Mars",
  },
];

const MODE_ROTATION_OFFSET: Record<"natal" | "transit" | "synastry", number> = {
  natal: 0,
  transit: 24,
  synastry: -32,
};

/**
 * Interactive Precision Astronomical Astrolabe & Live Sky Dial.
 * Supports clickable planetary nodes, mode-responsive orbital geometry,
 * active aspect chords, and counter-rotated classical zodiac glyphs.
 */
export function ZodiacWheel({
  size = 240,
  selectedBodyKey = "sun",
  onSelectBody,
  activeMode = "natal",
}: {
  size?: number;
  selectedBodyKey?: string;
  onSelectBody?: (key: string) => void;
  activeMode?: "natal" | "transit" | "synastry";
}) {
  const r = 52;
  const innerR = 39;
  const coreR = 20;
  const symbolR = 45.5;
  const offsetDeg = MODE_ROTATION_OFFSET[activeMode];

  const positionedBodies = ASTROLABE_BODIES.map((b) => {
    const deg = b.angleDeg + offsetDeg;
    const rad = (deg * Math.PI) / 180;
    return {
      ...b,
      x: round(Math.cos(rad) * b.orbitRadius),
      y: round(Math.sin(rad) * b.orbitRadius),
    };
  });

  const activeNode =
    positionedBodies.find((b) => b.key === selectedBodyKey) ??
    positionedBodies[0];

  return (
    <div
      className="relative grid select-none place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="-60 -60 120 120"
        className="relative size-full overflow-visible"
      >
        {/* Outer degree boundary ring */}
        <circle
          cx="0"
          cy="0"
          r={r + 4}
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.35"
          strokeWidth="0.35"
        />
        {/* Primary ecliptic ring */}
        <circle
          cx="0"
          cy="0"
          r={r}
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.75"
          strokeWidth="0.55"
        />
        {/* Inner zodiac band ring */}
        <circle
          cx="0"
          cy="0"
          r={innerR}
          fill="none"
          stroke="#38bdf8"
          strokeOpacity="0.35"
          strokeWidth="0.45"
        />
        {/* Planetary orbital track */}
        <circle
          cx="0"
          cy="0"
          r="30"
          fill="none"
          stroke="#c4b5fd"
          strokeOpacity="0.28"
          strokeWidth="0.35"
          strokeDasharray="1 1.5"
        />
        {/* Inner house horizon ring */}
        <circle
          cx="0"
          cy="0"
          r={coreR}
          fill="none"
          stroke="#f5d061"
          strokeOpacity="0.45"
          strokeWidth="0.4"
        />

        {/* Horizon (ASC-DSC) and Meridian (MC-IC) Crosshairs */}
        <line
          x1={-(r + 5)}
          y1="0"
          x2={r + 5}
          y2="0"
          stroke="#a78bfa"
          strokeOpacity="0.38"
          strokeWidth="0.4"
        />
        <line
          x1="0"
          y1={-(r + 5)}
          x2="0"
          y2={r + 5}
          stroke="#a78bfa"
          strokeOpacity="0.38"
          strokeWidth="0.4"
        />

        {/* Rotating Ecliptic Zodiac Ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        >
          {/* 72 five-degree calibration ticks on outer ring */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 5 * Math.PI) / 180;
            const major = i % 6 === 0;
            const mid = i % 2 === 0;
            const len = major ? 3.6 : mid ? 2.1 : 1.1;
            const x1 = round(Math.cos(angle) * r);
            const y1 = round(Math.sin(angle) * r);
            const x2 = round(Math.cos(angle) * (r + len));
            const y2 = round(Math.sin(angle) * (r + len));
            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={major ? "#f5d061" : "#a78bfa"}
                strokeOpacity={major ? "0.8" : mid ? "0.45" : "0.24"}
                strokeWidth={major ? "0.45" : "0.3"}
              />
            );
          })}

          {/* 12 house cusp spokes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = round(Math.cos(angle) * coreR);
            const y1 = round(Math.sin(angle) * coreR);
            const x2 = round(Math.cos(angle) * r);
            const y2 = round(Math.sin(angle) * r);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#e2d9f3"
                strokeOpacity="0.2"
                strokeWidth="0.35"
              />
            );
          })}

          {/* Sign symbols on the ecliptic band, counter-rotated to stay upright */}
          {SIGNS.map((sign, i) => {
            const angle = i * 30 - 75;
            const rad = (angle * Math.PI) / 180;
            const x = round(Math.cos(rad) * symbolR);
            const y = round(Math.sin(rad) * symbolR);
            const signColor =
              i % 4 === 0
                ? "#f5d061"
                : i % 4 === 1
                  ? "#38bdf8"
                  : i % 4 === 2
                    ? "#c4b5fd"
                    : "#f472b6";
            return (
              <g key={sign.key} transform={`translate(${x}, ${y})`}>
                <motion.text
                  fontSize="5.8"
                  fill={signColor}
                  fillOpacity="0.92"
                  textAnchor="middle"
                  dominantBaseline="central"
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 180,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ transformOrigin: "center" }}
                >
                  {sign.symbol}
                </motion.text>
              </g>
            );
          })}
        </motion.g>

        {/* Dynamic Aspect Chords from Selected Body */}
        {positionedBodies
          .filter((b) => b.key !== activeNode.key)
          .map((target, idx) => (
            <line
              key={`chord-${target.key}`}
              x1={activeNode.x}
              y1={activeNode.y}
              x2={target.x}
              y2={target.y}
              stroke={idx % 2 === 0 ? "#a78bfa" : "#38bdf8"}
              strokeOpacity={idx < 3 ? "0.6" : "0.28"}
              strokeWidth={idx < 2 ? "0.5" : "0.35"}
              strokeDasharray={idx % 2 === 1 ? "1.5 1.5" : undefined}
            />
          ))}

        {/* Radial Vector Spoke to Active Planet */}
        <line
          x1="0"
          y1="0"
          x2={activeNode.x}
          y2={activeNode.y}
          stroke="#f5d061"
          strokeOpacity="0.85"
          strokeWidth="0.6"
        />

        {/* Interactive Planetary Nodes */}
        {positionedBodies.map((node) => {
          const isSelected = node.key === activeNode.key;
          return (
            <g
              key={node.key}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => onSelectBody?.(node.key)}
              className={onSelectBody ? "cursor-pointer" : undefined}
              role={onSelectBody ? "button" : undefined}
              tabIndex={onSelectBody ? 0 : undefined}
              aria-label={node.labelEn}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectBody?.(node.key);
                }
              }}
            >
              {isSelected && (
                <circle
                  cx="0"
                  cy="0"
                  r="6.4"
                  fill="none"
                  stroke="#f5d061"
                  strokeOpacity="0.9"
                  strokeWidth="0.55"
                />
              )}
              <circle
                cx="0"
                cy="0"
                r={isSelected ? "4.4" : "3.6"}
                fill={isSelected ? "#a78bfa" : "#161129"}
                stroke={isSelected ? "#f5d061" : "#a78bfa"}
                strokeOpacity={isSelected ? "1" : "0.75"}
                strokeWidth="0.55"
              />
              <text
                fontSize={isSelected ? "4.6" : "4.1"}
                fill={isSelected ? "#0a0714" : "#f8f7ff"}
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="600"
              >
                {node.glyph}
              </text>
            </g>
          );
        })}

        {/* Center astrolabe axis */}
        <circle cx="0" cy="0" r="2.2" fill="#f5d061" />
        <circle
          cx="0"
          cy="0"
          r="5.5"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.45"
          strokeWidth="0.4"
        />
      </svg>
    </div>
  );
}
