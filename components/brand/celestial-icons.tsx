import { cn } from "@/lib/utils";
import type { PhaseKey } from "@/lib/moon-phase";

const PHASE_KEY_TO_ANGLE: Record<PhaseKey, number> = {
  new_moon: 0,
  waxing_crescent: 45,
  first_quarter: 90,
  waxing_gibbous: 135,
  full_moon: 180,
  waning_gibbous: 225,
  last_quarter: 270,
  waning_crescent: 315,
};

function buildShadowPath(
  phase: number,
  r: number,
  xRadius: number,
): string | null {
  if (phase >= 0.49 && phase <= 0.51) return null;
  if (phase < 0.01 || phase > 0.99) {
    return `M ${-r},0 A ${r},${r} 0 1,0 ${r},0 A ${r},${r} 0 1,0 ${-r},0 Z`;
  }
  if (phase < 0.25) {
    return `M 0,${-r} A ${r},${r} 0 0,0 0,${r} A ${xRadius},${r} 0 0,1 0,${-r} Z`;
  }
  if (phase < 0.5) {
    return `M 0,${-r} A ${r},${r} 0 0,0 0,${r} A ${xRadius},${r} 0 0,0 0,${-r} Z`;
  }
  if (phase < 0.75) {
    return `M 0,${-r} A ${r},${r} 0 0,1 0,${r} A ${xRadius},${r} 0 0,1 0,${-r} Z`;
  }
  return `M 0,${-r} A ${r},${r} 0 0,1 0,${r} A ${xRadius},${r} 0 0,0 0,${-r} Z`;
}

/**
 * Bespoke Vector SVG Lunar Phase Disc.
 * Replaces generic OS moon emojis with a calibrated brass-and-ivory astronomical
 * terminator diagram for any phase key or continuous phase angle (0-360°).
 */
export function LunarPhaseDisc({
  phaseKey,
  phaseAngle,
  size = 28,
  className,
}: {
  phaseKey?: PhaseKey;
  phaseAngle?: number;
  size?: number;
  className?: string;
}) {
  const angle =
    typeof phaseAngle === "number"
      ? phaseAngle
      : phaseKey
        ? PHASE_KEY_TO_ANGLE[phaseKey]
        : 135;
  const r = 42;
  const phase = (((angle % 360) + 360) % 360) / 360;
  const xRadius = Number(
    (Math.abs(Math.cos((angle * Math.PI) / 180)) * r).toFixed(3),
  );
  const shadowPath = buildShadowPath(phase, r, xRadius);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-54 -54 108 108"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* Outer calibrated meridian ring */}
      <circle
        cx="0"
        cy="0"
        r="50"
        fill="none"
        stroke="#a78bfa"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
      {/* 4 cardinal calibration ticks */}
      <line
        x1="0"
        y1="-50"
        x2="0"
        y2="-46"
        stroke="#38bdf8"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />
      <line
        x1="0"
        y1="46"
        x2="0"
        y2="50"
        stroke="#38bdf8"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />
      <line
        x1="-50"
        y1="0"
        x2="-46"
        y2="0"
        stroke="#a78bfa"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />
      <line
        x1="46"
        y1="0"
        x2="50"
        y2="0"
        stroke="#a78bfa"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />

      {/* Illuminated lunar surface */}
      <circle cx="0" cy="0" r={r} fill="#f5f3ff" fillOpacity="0.95" />
      {/* Subtle lunar mare geometry */}
      <circle cx="-12" cy="-10" r="9" fill="#a78bfa" fillOpacity="0.22" />
      <circle cx="10" cy="12" r="12" fill="#818cf8" fillOpacity="0.18" />
      <circle cx="14" cy="-14" r="6" fill="#a78bfa" fillOpacity="0.2" />

      {/* Terminator shadow */}
      {shadowPath && <path d={shadowPath} fill="#0a0714" fillOpacity="0.92" />}

      {/* Crisp lunar limb border */}
      <circle
        cx="0"
        cy="0"
        r={r}
        fill="none"
        stroke="#c4b5fd"
        strokeOpacity="0.75"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Bespoke Engraved Geometric SVG Tarot Card Back.
 * Used in Tarot spread slots, loading states, and locked teasers.
 */
export function TarotCardBackIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 300"
      className={cn("size-full", className)}
      aria-hidden
    >
      <rect width="200" height="300" fill="#130e26" />
      {/* Outer & inner architectural borders */}
      <rect
        x="10"
        y="10"
        width="180"
        height="280"
        fill="none"
        stroke="#a78bfa"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      <rect
        x="16"
        y="16"
        width="168"
        height="268"
        fill="none"
        stroke="#38bdf8"
        strokeOpacity="0.28"
        strokeWidth="0.75"
      />
      {/* Corner geometric rosettes */}
      {[
        [24, 24],
        [176, 24],
        [24, 276],
        [176, 276],
      ].map(([cx, cy], idx) => (
        <g key={idx} transform={`translate(${cx}, ${cy})`}>
          <circle
            cx="0"
            cy="0"
            r="5"
            fill="none"
            stroke="#f5d061"
            strokeOpacity="0.65"
            strokeWidth="0.8"
          />
          <circle cx="0" cy="0" r="1.5" fill="#f5d061" fillOpacity="0.85" />
        </g>
      ))}
      {/* Central astrolabe geometry */}
      <g transform="translate(100, 150)">
        <circle
          cx="0"
          cy="0"
          r="64"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.45"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <circle
          cx="0"
          cy="0"
          r="54"
          fill="none"
          stroke="#c4b5fd"
          strokeOpacity="0.65"
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="0"
          r="36"
          fill="none"
          stroke="#38bdf8"
          strokeOpacity="0.35"
          strokeWidth="0.8"
        />
        {/* Sacred 8-pointed compass star */}
        <polygon
          points="0,-52 12,-12 52,0 12,12 0,52 -12,12 -52,0 -12,-12"
          fill="none"
          stroke="#f5d061"
          strokeOpacity="0.75"
          strokeWidth="0.9"
        />
        <polygon
          points="0,-38 9,-9 38,0 9,9 0,38 -9,9 -38,0 -9,-9"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.45"
          strokeWidth="0.75"
          transform="rotate(45)"
        />
        {/* Vertical meridian axis */}
        <line
          x1="0"
          y1="-96"
          x2="0"
          y2="96"
          stroke="#a78bfa"
          strokeOpacity="0.3"
          strokeWidth="0.75"
        />
        <line
          x1="-68"
          y1="0"
          x2="68"
          y2="0"
          stroke="#a78bfa"
          strokeOpacity="0.3"
          strokeWidth="0.75"
        />
        <circle cx="0" cy="0" r="4" fill="#f5d061" />
      </g>
    </svg>
  );
}

/**
 * Swiss-Grid Corner Registration Mark (+).
 * Anchors structural intersections on major architectural ledgers.
 */
export function CornerCrosshair({
  position,
}: {
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "tl"
    | "tr"
    | "bl"
    | "br";
}) {
  const posClass =
    position === "top-left" || position === "tl"
      ? "-left-1.5 -top-1.5"
      : position === "top-right" || position === "tr"
        ? "-right-1.5 -top-1.5"
        : position === "bottom-left" || position === "bl"
          ? "-bottom-1.5 -left-1.5"
          : "-bottom-1.5 -right-1.5";
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-20 select-none font-mono text-[10px] leading-none text-primary/60",
        posClass,
      )}
    >
      +
    </span>
  );
}
