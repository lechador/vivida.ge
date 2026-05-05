"use client";

import Link from "next/link";

import { signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";

const ITEMS: Array<{
  kind: "sun" | "moon" | "ascendant";
  label: string;
  glyph: string;
}> = [
  { kind: "sun", label: "მზე", glyph: "☉" },
  { kind: "moon", label: "მთვარე", glyph: "☽" },
  { kind: "ascendant", label: "ამომავალი", glyph: "AC" },
];

/**
 * Compact glance at the user's Sun / Moon / Ascendant — three small tiles,
 * no interpretations. Lives on the home page; click-through goes to the
 * full /report.
 */
export function MiniBigThree({ chart }: { chart: NatalChartJson }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ITEMS.map((item) => {
        const point =
          item.kind === "ascendant"
            ? chart.ascendant
            : chart.bodies[item.kind];
        if (!point) return null;
        const sign = signByIndex(point.signIndex);
        return (
          <Link
            key={item.kind}
            href="/report"
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 px-4 py-4 backdrop-blur-xl transition-colors hover:border-[var(--vivida-violet)]/40"
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {item.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tracking-tight">
                {sign.labelKa}
              </span>
              <span className="text-base text-muted-foreground">
                {sign.symbol}
              </span>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute right-3 top-3 text-2xl text-muted-foreground/30 transition-colors group-hover:text-[var(--vivida-violet)]/50"
            >
              {item.glyph}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
