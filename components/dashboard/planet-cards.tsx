"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { bodyMeta, formatDegree, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import { cn } from "@/lib/utils";

const PLANETS_TO_SHOW = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

/**
 * Flat planet list — one tight row per planet (glyph · name · sign · degree ·
 * house), the interpretation expands inline on tap. Replaces the old dense
 * sticker grid; the positions table links here via #planet-<key> anchors.
 */
export function PlanetCards({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl">
      {PLANETS_TO_SHOW.map((key) => {
        const body = chart.bodies[key];
        if (!body) return null;
        const meta = bodyMeta(key);
        const sign = signByIndex(body.signIndex);
        const color = signColor(sign);
        const text = interpretations?.[key];
        const open = openKey === key;

        return (
          <div
            key={key}
            id={`planet-${key}`}
            className="scroll-mt-20 border-t border-border/50 first:border-t-0"
          >
            <button
              type="button"
              onClick={() => text && setOpenKey(open ? null : key)}
              disabled={!text}
              aria-expanded={open}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5",
                text && "cursor-pointer hover:bg-card/70"
              )}
            >
              <span
                aria-hidden
                style={{ color }}
                className="w-5 shrink-0 text-center text-base leading-none"
              >
                {meta?.symbol ?? "?"}
              </span>
              <span className="w-24 shrink-0 truncate font-medium sm:w-28">
                {meta?.labelKa ?? key}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                <span aria-hidden style={{ color }}>
                  {`${sign.symbol}︎`}
                </span>
                <span className="truncate">{sign.labelKa}</span>
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground sm:text-sm">
                {formatDegree(body.signDegree)}
                {body.retrograde ? " ℞" : ""}
                {body.house ? ` · ${body.house} სახ.` : ""}
              </span>
              {text && (
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              )}
            </button>

            {open && text && (
              <div
                className="border-t px-4 pb-4 pt-2 text-sm leading-relaxed text-foreground/90 sm:px-5"
                style={{
                  borderColor: `color-mix(in oklch, ${color} 20%, transparent)`,
                }}
              >
                <div className="mb-1 text-[11px] text-muted-foreground">
                  {meta?.meaningKa}
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
