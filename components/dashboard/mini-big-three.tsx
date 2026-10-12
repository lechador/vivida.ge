"use client";

import Link from "next/link";

import { signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ITEMS: Array<{
  kind: "sun" | "moon" | "ascendant";
  label: string;
  labelEn: string;
  glyph: string;
}> = [
  { kind: "sun", label: "მზე", labelEn: "Sun", glyph: "☉" },
  { kind: "moon", label: "მთვარე", labelEn: "Moon", glyph: "☽" },
  { kind: "ascendant", label: "ამომავალი", labelEn: "Rising", glyph: "AC" },
];

/**
 * Compact glance at the user's Sun / Moon / Ascendant, three small tiles,
 * no interpretations. Lives on the home page; click-through goes to the
 * full /report.
 */
export function MiniBigThree({ chart, locale = "ka" }: { chart: NatalChartJson; locale?: UserLocale }) {
  const en = locale !== "ka";
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
              {en ? item.labelEn : item.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tracking-tight">
                {en ? sign.labelEn : sign.labelKa}
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
