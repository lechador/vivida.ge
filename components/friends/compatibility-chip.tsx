import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  type SynastryCategory,
} from "@/lib/synastry";

import { synastryAccent } from "./synastry-visuals";

/**
 * Compact pill, mini ring + percentage + top-category emoji.
 * Used inline on the friends-tab row to make the existing synastry
 * surface visible without forcing the user to click into a profile.
 */
export function CompatibilityChip({
  overall,
  topCategory,
}: {
  overall: number;
  topCategory: SynastryCategory;
}) {
  const accent = synastryAccent(overall);
  return (
    <div
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card/40 px-2 py-1 text-xs ring-1 ring-foreground/5 backdrop-blur"
      style={{
        borderColor: `color-mix(in oklch, ${accent} 32%, transparent)`,
        boxShadow: `0 0 14px -8px ${accent}`,
      }}
      title={`${CATEGORY_LABEL_KA[topCategory]} ${CATEGORY_EMOJI[topCategory]}`}
    >
      <MiniRing percent={overall} accent={accent} />
      <span className="font-semibold tabular-nums" style={{ color: accent }}>
        {overall}%
      </span>
      <span aria-hidden className="text-[11px] leading-none">
        {CATEGORY_EMOJI[topCategory]}
      </span>
    </div>
  );
}

function MiniRing({ percent, accent }: { percent: number; accent: string }) {
  const size = 18;
  const strokeWidth = 2.5;
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="oklch(0.27 0.04 280 / 0.55)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={accent}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
