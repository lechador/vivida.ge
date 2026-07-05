"use client";

import { motion } from "framer-motion";

import { SIGNS, signColor } from "@/lib/zodiac";

/**
 * Slow-rotating zodiac wheel for the hero. SVG-based so it scales without
 * artifacts; 12 sign symbols arranged on a circle with element-tinted
 * accents. Counter-rotates the symbols so they stay upright while the
 * outer ring spins.
 */
// Fixed precision keeps SSR and client attribute serialization identical,
// avoiding hydration mismatches from float rounding differences.
const round = (n: number) => Number(n.toFixed(4));

export function ZodiacWheel({ size = 160 }: { size?: number }) {
  const r = 50;
  const symbolR = r - 6;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {/* Soft glow under the wheel */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.18_305/0.45)_0%,transparent_70%)] blur-2xl"
      />

      <motion.svg
        viewBox="-60 -60 120 120"
        className="relative size-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="wheel-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.85 0.12 305 / 0.7)" />
            <stop offset="50%" stopColor="oklch(0.85 0.18 350 / 0.7)" />
            <stop offset="100%" stopColor="oklch(0.85 0.16 220 / 0.7)" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          cx="0"
          cy="0"
          r={r}
          fill="none"
          stroke="url(#wheel-stroke)"
          strokeWidth="0.6"
        />
        {/* Inner ring */}
        <circle
          cx="0"
          cy="0"
          r={r - 12}
          fill="none"
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth="0.4"
        />

        {/* 12 spokes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = round(Math.cos(angle) * (r - 12));
          const y1 = round(Math.sin(angle) * (r - 12));
          const x2 = round(Math.cos(angle) * r);
          const y2 = round(Math.sin(angle) * r);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="oklch(1 0 0 / 0.12)"
              strokeWidth="0.4"
            />
          );
        })}

        {/* Sign symbols on the ring, counter-rotated to stay upright */}
        {SIGNS.map((sign, i) => {
          const angle = i * 30 - 90; // start Aries at top
          const rad = (angle * Math.PI) / 180;
          const x = round(Math.cos(rad) * symbolR);
          const y = round(Math.sin(rad) * symbolR);
          return (
            <g key={sign.key} transform={`translate(${x}, ${y})`}>
              {/* Counter-rotation keeps glyphs upright in viewer frame */}
              <motion.text
                fontSize="7"
                fill={signColor(sign)}
                textAnchor="middle"
                dominantBaseline="central"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 120,
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

        {/* Center glyph */}
        <circle
          cx="0"
          cy="0"
          r="4"
          fill="oklch(0.95 0.04 90)"
          opacity="0.95"
        />
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="none"
          stroke="oklch(1 0 0 / 0.25)"
          strokeWidth="0.4"
        />
      </motion.svg>
    </div>
  );
}
