import { bodyMeta, formatDegree, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson, PointJson } from "@/db/schema";

/**
 * Compact, scannable planet-positions table — the at-a-glance data layer of
 * the report. Each whole row is a single in-page anchor that scrolls down to
 * that point's interpretation (#planet-<key>) — no navigation away. Glyphs sit
 * in fixed-width boxes so the names line up on a straight vertical edge.
 * Server component (native anchors, no client JS).
 */

const ROW_KEYS = [
  "sun",
  "moon",
  "ascendant",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

const GRID = "grid grid-cols-[1.3fr_1.3fr_auto_2.5rem] items-center gap-x-3";
// Fixed-width, centered glyph box → every name starts at the same x.
const GLYPH = "w-6 shrink-0 text-center text-base leading-none";

function pointFor(chart: NatalChartJson, key: string): PointJson | null {
  if (key === "ascendant") return chart.ascendant ?? null;
  return chart.bodies[key] ?? null;
}

export function PositionsTable({ chart }: { chart: NatalChartJson }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div
        className={`${GRID} px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground sm:px-5`}
      >
        <span>პლანეტა</span>
        <span>ნიშანი</span>
        <span className="text-right">გრადუსი</span>
        <span className="text-right">სახლი</span>
      </div>
      <ul>
        {ROW_KEYS.map((key) => {
          const point = pointFor(chart, key);
          if (!point) return null;
          const meta = bodyMeta(key);
          const sign = signByIndex(point.signIndex);
          const color = signColor(sign);
          const house = key === "ascendant" ? 1 : point.house;

          return (
            <li key={key} className="border-t border-border/50">
              <a
                href={`#planet-${key}`}
                className={`${GRID} px-4 py-2.5 text-sm transition-colors hover:bg-card/70 sm:px-5`}
              >
                <span className="flex min-w-0 items-center gap-2 font-medium">
                  <span aria-hidden style={{ color }} className={GLYPH}>
                    {meta?.symbol ?? "?"}
                  </span>
                  <span className="truncate">{meta?.labelKa ?? key}</span>
                </span>

                <span className="flex min-w-0 items-center gap-2 text-foreground/85">
                  <span aria-hidden style={{ color }} className={GLYPH}>
                    {`${sign.symbol}︎`}
                  </span>
                  <span className="truncate">{sign.labelKa}</span>
                </span>

                <span className="whitespace-nowrap text-right tabular-nums text-foreground/80">
                  {formatDegree(point.signDegree)}
                  {point.retrograde && (
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      ℞
                    </span>
                  )}
                </span>

                <span className="text-right tabular-nums text-muted-foreground">
                  {house ?? "—"}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const HOUSE_LABEL: Record<number, string> = {
  1: "AC",
  4: "IC",
  7: "DC",
  10: "MC",
};

/**
 * Compact two-column houses list (cusps). Each row scrolls in-page to that
 * house's interpretation (#house-<n>).
 */
export function HousesTable({ chart }: { chart: NatalChartJson }) {
  const houses = [...chart.houses].sort((a, b) => a.number - b.number);
  return (
    <div className="grid gap-x-8 sm:grid-cols-2">
      {houses.map((h) => {
        const sign = signByIndex(h.signIndex);
        const color = signColor(sign);
        return (
          <a
            key={h.number}
            href={`#house-${h.number}`}
            className="flex items-center gap-3 border-b border-border/50 py-2 text-sm transition-colors hover:text-[var(--vivida-violet)]"
          >
            <span className="w-7 shrink-0 font-medium tabular-nums text-muted-foreground">
              {HOUSE_LABEL[h.number] ?? h.number}
            </span>
            <span aria-hidden style={{ color }} className={GLYPH}>
              {`${sign.symbol}︎`}
            </span>
            <span className="truncate">{sign.labelKa}</span>
          </a>
        );
      })}
    </div>
  );
}
