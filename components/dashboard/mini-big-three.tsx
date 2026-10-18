import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { formatDegree, signByIndex, signColor } from "@/lib/zodiac";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import type { NatalChartJson, PointJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function MiniBigThree({
  chart,
  locale = "ka",
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  if (!chart?.bodies) return null;

  const sun: PointJson | undefined = chart.bodies.sun;
  const moon: PointJson | undefined = chart.bodies.moon;
  const asc: PointJson = chart.ascendant;
  if (!sun || !moon || !asc) return null;

  const items: {
    code: string;
    label: string;
    role: string;
    glyph: string;
    accentColor: string;
    point: PointJson;
  }[] = [
    {
      code: "01 · SOLAR",
      label: en ? "Sun" : "მზე",
      role: en ? "Core identity" : "არსი",
      glyph: "☉",
      accentColor: "var(--vivida-gold)",
      point: sun,
    },
    {
      code: "02 · LUNAR",
      label: en ? "Moon" : "მთვარე",
      role: en ? "Inner world" : "შინაგანი",
      glyph: "☽",
      accentColor: "var(--vivida-cyan)",
      point: moon,
    },
    {
      code: "03 · HORIZON",
      label: en ? "Ascendant" : "ამომავალი",
      role: en ? "First impression" : "გარეგანი",
      glyph: "↑",
      accentColor: "var(--primary)",
      point: asc,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[oklch(0.145_0.036_280)] shadow-sm">
      <CornerCrosshair position="tl" />
      <CornerCrosshair position="tr" />
      <CornerCrosshair position="bl" />
      <CornerCrosshair position="br" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/70 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          <span className="inline-block size-1.5 rounded-full bg-primary" />
          {en
            ? "PRIMARY NATAL AXIS · BIG THREE"
            : "ნატალური ღერძი · დიდი სამეული"}
        </div>
        <Link
          href="/report"
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          {en ? "Full Natal Ephemeris" : "სრული ნატალური რუკა"}
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4">
        {items.map(({ code, label, role, glyph, accentColor, point }) => {
          const sign = signByIndex(point.signIndex);
          const color = signColor(sign);
          const signLabel = en ? sign.labelEn : sign.labelKa;
          return (
            <Link
              key={label}
              href="/report#big-three"
              className="group relative flex flex-col justify-between rounded-lg border border-border bg-card px-4 py-4 shadow-2xs transition-all hover:border-primary/60 hover:bg-secondary/55 sm:px-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                  style={{ color: accentColor }}
                >
                  {code} · {label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {role}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2.5">
                  <span
                    aria-hidden
                    style={{ color }}
                    className="text-xl leading-none"
                  >
                    {glyph}
                  </span>
                  <span className="truncate text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
                    {signLabel}
                  </span>
                </div>
                <span className="shrink-0 rounded-sm border border-border/80 bg-background/60 px-1.5 py-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDegree(point.signDegree)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
