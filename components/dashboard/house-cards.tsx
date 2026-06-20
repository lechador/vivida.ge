"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { HOUSE_NUMBERS, houseDef } from "@/lib/houses";
import { bodyMeta, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import { cn } from "@/lib/utils";

const HOUSE_LABEL: Record<number, string> = {
  1: "AC",
  4: "IC",
  7: "DC",
  10: "MC",
};

/**
 * Flat houses list — one tight row per house (number/axis · theme · cusp sign
 * · occupant planets), interpretation expands inline. Replaces the old sticker
 * grid.
 */
export function HouseCards({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  const [openHouse, setOpenHouse] = useState<number | null>(null);

  const occupants: Record<
    number,
    Array<{ key: string; label: string; symbol: string }>
  > = {};
  for (const [key, body] of Object.entries(chart.bodies)) {
    if (!body.house) continue;
    const meta = bodyMeta(key);
    (occupants[body.house] ??= []).push({
      key,
      label: meta?.labelKa ?? key,
      symbol: meta?.symbol ?? "?",
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
      {HOUSE_NUMBERS.map((n) => {
        const def = houseDef(n);
        const cusp = chart.houses.find((h) => h.number === n);
        const cuspSign = cusp ? signByIndex(cusp.signIndex) : null;
        const color = cuspSign ? signColor(cuspSign) : "oklch(0.6 0.1 285)";
        const planets = occupants[n] ?? [];
        const text = interpretations?.[String(n)];
        const open = openHouse === n;

        return (
          <div
            key={n}
            id={`house-${n}`}
            className="scroll-mt-20 border-t border-border/50 first:border-t-0"
          >
            <button
              type="button"
              onClick={() => text && setOpenHouse(open ? null : n)}
              disabled={!text}
              aria-expanded={open}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5",
                text && "cursor-pointer hover:bg-card/70"
              )}
            >
              <span
                style={{ color }}
                className="w-8 shrink-0 text-center text-sm font-semibold tabular-nums"
              >
                {HOUSE_LABEL[n] ?? n}
              </span>
              <span className="w-28 shrink-0 truncate font-medium sm:w-40">
                {def.themeKa}
              </span>
              {cuspSign && (
                <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <span aria-hidden style={{ color }}>
                    {`${cuspSign.symbol}︎`}
                  </span>
                  <span className="truncate">{cuspSign.labelKa}</span>
                </span>
              )}
              <span className="ml-auto flex shrink-0 items-center gap-2">
                {planets.length > 0 && (
                  <span
                    aria-hidden
                    className="flex items-center gap-1 text-sm text-foreground/70"
                  >
                    {planets.map((p) => (
                      <span key={p.key} title={p.label}>
                        {p.symbol}
                      </span>
                    ))}
                  </span>
                )}
                {text && (
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180"
                    )}
                  />
                )}
              </span>
            </button>

            {open && text && (
              <div
                className="border-t px-4 pb-4 pt-2 text-sm leading-relaxed text-foreground/90 sm:px-5"
                style={{
                  borderColor: `color-mix(in oklch, ${color} 20%, transparent)`,
                }}
              >
                <div className="mb-1 text-[11px] text-muted-foreground">
                  {def.labelKa} · {def.meaningKa}
                </div>
                {text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
