"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { HOUSE_NUMBERS, houseDef } from "@/lib/houses";
import { bodyMeta, signByIndex, signColor } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import { cn } from "@/lib/utils";

const AXIS_HOUSES = new Set([1, 4, 7, 10]);

/**
 * 12 house stickers — element-tinted by each cusp's sign. Header shows the
 * house number, the theme, the cusp sign chip, and any planets occupying
 * the house. Body interpretation lives behind a tap so the grid reads as
 * a visual map first, a wall of text second.
 */
export function HouseCards({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  const [openHouse, setOpenHouse] = useState<number | null>(null);

  // Quick lookup of which planets occupy each house
  const occupants: Record<number, Array<{ key: string; label: string; symbol: string }>> = {};
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {HOUSE_NUMBERS.map((n) => {
        const def = houseDef(n);
        const cusp = chart.houses.find((h) => h.number === n);
        const cuspSign = cusp ? signByIndex(cusp.signIndex) : null;
        const planets = occupants[n] ?? [];
        const text = interpretations?.[String(n)];
        const open = openHouse === n;
        const isAxis = AXIS_HOUSES.has(n);
        const color = cuspSign ? signColor(cuspSign) : "oklch(0.6 0.1 285)";
        const hasBody = Boolean(text);

        return (
          <article
            key={n}
            className={cn(
              "group relative overflow-hidden rounded-2xl border ring-1 ring-foreground/5 backdrop-blur-xl transition-all",
              open ? "border-foreground/20" : "border-border hover:border-foreground/15"
            )}
            style={{
              background: `linear-gradient(140deg, color-mix(in oklch, ${color} 14%, transparent), color-mix(in oklch, ${color} 3%, oklch(0.18 0.04 285 / 0.55)) 70%)`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenHouse(open ? null : n)}
              disabled={!hasBody}
              aria-expanded={open}
              className={cn(
                "relative flex w-full items-center gap-3 p-4 text-left",
                hasBody && "cursor-pointer"
              )}
            >
              {/* House number anchor — tinted to the cusp's element. */}
              <div
                className="grid size-12 shrink-0 place-items-center rounded-xl text-xl font-semibold tabular-nums shadow-[inset_0_0_0_1px_var(--ring)]"
                style={{
                  ["--ring" as string]: `color-mix(in oklch, ${color} 35%, transparent)`,
                  background: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklch, ${color} 28%, transparent), transparent 70%)`,
                  color,
                  filter: `drop-shadow(0 0 8px color-mix(in oklch, ${color} 50%, transparent))`,
                }}
              >
                {n}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {def.themeKa}
                  </h3>
                  {isAxis && (
                    <span
                      aria-label="ღერძი"
                      title="ღერძი — ოთხი მთავარი წერტილი"
                      className="shrink-0 text-[var(--vivida-violet)]"
                    >
                      ✦
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted-foreground">
                  {cuspSign && (
                    <span>
                      <span aria-hidden className="mr-0.5">
                        {cuspSign.symbol}
                      </span>
                      {cuspSign.labelKa}
                    </span>
                  )}
                  {planets.length > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        {planets.map((p) => (
                          <span key={p.key} title={p.label} aria-hidden>
                            {p.symbol}
                          </span>
                        ))}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {hasBody && (
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {open && hasBody && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="border-t px-4 pb-4 pt-3 text-sm leading-relaxed text-foreground/90"
                    style={{
                      borderColor: `color-mix(in oklch, ${color} 25%, transparent)`,
                    }}
                  >
                    <div className="mb-1 text-[11px] text-muted-foreground">
                      {def.labelKa} · {def.meaningKa}
                    </div>
                    {text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
