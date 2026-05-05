"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
 * Compact planet stickers — one per personal/outer planet, arranged in a
 * dense grid. Each sticker is tinted with its sign's element color and
 * shows a single line of identity ("ვენერა · კურო-ში · მე-3 სახლი"). The
 * full AI interpretation is hidden by default and reveals on tap so the
 * page reads as a glance rather than a wall of text.
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {PLANETS_TO_SHOW.map((key) => {
        const body = chart.bodies[key];
        if (!body) return null;
        const meta = bodyMeta(key);
        const sign = signByIndex(body.signIndex);
        const text = interpretations?.[key];
        const open = openKey === key;
        const color = signColor(sign);
        const hasBody = Boolean(text);

        return (
          <article
            key={key}
            className={cn(
              "group relative overflow-hidden rounded-2xl border ring-1 ring-foreground/5 backdrop-blur-xl transition-all",
              open ? "border-foreground/20" : "border-border hover:border-foreground/15"
            )}
            style={{
              background: `linear-gradient(140deg, color-mix(in oklch, ${color} 16%, transparent), color-mix(in oklch, ${color} 4%, oklch(0.18 0.04 285 / 0.55)) 70%)`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : key)}
              disabled={!hasBody}
              aria-expanded={open}
              className={cn(
                "relative flex w-full items-center gap-3 p-4 text-left",
                hasBody && "cursor-pointer"
              )}
            >
              {/* Sign emoji as the visual anchor — element color radiates
                  through the gradient backing the whole card. */}
              <div
                className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl shadow-[inset_0_0_0_1px_var(--ring)]"
                style={{
                  ["--ring" as string]: `color-mix(in oklch, ${color} 35%, transparent)`,
                  background: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklch, ${color} 28%, transparent), transparent 70%)`,
                  color,
                  filter: `drop-shadow(0 0 10px color-mix(in oklch, ${color} 60%, transparent))`,
                }}
                title={`${formatDegree(body.signDegree)} ${sign.labelKa}-ში`}
                aria-hidden
              >
                {sign.symbol}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span aria-hidden className="text-base">
                    {meta?.symbol ?? "?"}
                  </span>
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {meta?.labelKa ?? key}
                  </h3>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {sign.labelKa}-ში{body.house ? ` · მე-${body.house} სახლი` : ""}
                  {body.retrograde ? " · ℞" : ""}
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
                      {meta?.meaningKa}
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
