"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { aspectKey } from "@/lib/aspects";
import { bodyMeta, signByIndex } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";
import { cn } from "@/lib/utils";

const ASPECT_SYMBOL: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const ASPECT_LABEL_KA: Record<string, string> = {
  conjunction: "კონიუნქცია",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};

const FAMILY_ORDER = ["harmonic", "tense", "neutral"] as const;
type Family = (typeof FAMILY_ORDER)[number];

const FAMILY_META: Record<
  Family,
  { color: string; emoji: string; labelKa: string; descriptionKa: string }
> = {
  harmonic: {
    color: "oklch(0.78 0.18 200)",
    emoji: "✨",
    labelKa: "ჰარმონიული",
    descriptionKa: "სადაც ენერგია ბუნებრივად მიედინება",
  },
  tense: {
    color: "oklch(0.72 0.22 350)",
    emoji: "⚡",
    labelKa: "დაძაბული",
    descriptionKa: "სადაც ხახუნი ზრდას აწარმოებს",
  },
  neutral: {
    color: "oklch(0.85 0.16 85)",
    emoji: "☌",
    labelKa: "შერწყმული",
    descriptionKa: "სადაც ენერგიები ერწყმის ერთმანეთს",
  },
};

function bodyDisplay(chart: NatalChartJson, key: string) {
  if (key === "ascendant") {
    return {
      label: "ამომავალი",
      symbol: "AC",
      sign: signByIndex(chart.ascendant.signIndex),
    };
  }
  if (key === "midheaven") {
    return {
      label: "ზენიტი",
      symbol: "MC",
      sign: signByIndex(chart.midheaven.signIndex),
    };
  }
  const body = chart.bodies[key];
  const meta = bodyMeta(key);
  return {
    label: meta?.labelKa ?? key,
    symbol: meta?.symbol ?? "?",
    sign: body ? signByIndex(body.signIndex) : null,
  };
}

function strengthLabel(orb: number, kind: string): string {
  // Same calibration as before — friendly Georgian adjective per orb / kind.
  const TOL: Record<string, number> = {
    conjunction: 10,
    opposition: 10,
    sextile: 6,
    square: 8,
    trine: 8,
  };
  const tol = TOL[kind] ?? 8;
  if (orb < 0.5) return "ზუსტი";
  if (orb < tol * 0.4) return "ძლიერი";
  if (orb < tol * 0.75) return "საშუალო";
  return "მსუბუქი";
}

function orbTooltip(orb: number): string {
  if (orb < 0.5) return "ზუსტი ბმა";
  return `ორბი ${orb.toFixed(1)}°`;
}

/**
 * Personal-planet biased sort — the most personally-relevant aspects
 * surface to the top of each family.
 */
function sortAspects(
  aspects: NonNullable<NatalChartJson["aspects"]>
): NonNullable<NatalChartJson["aspects"]> {
  const personal = new Set([
    "sun",
    "moon",
    "ascendant",
    "midheaven",
    "mercury",
    "venus",
    "mars",
  ]);
  const isOuter = (k: string) =>
    ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(k);

  const score = (a: NonNullable<NatalChartJson["aspects"]>[number]) => {
    const involvesPersonal = personal.has(a.a) || personal.has(a.b);
    const bothOuter = isOuter(a.a) && isOuter(a.b);
    return (
      a.intensity + (involvesPersonal ? 0.5 : 0) + (bothOuter ? -0.4 : 0)
    );
  };
  return [...aspects].sort((x, y) => score(y) - score(x));
}

export function AspectCards({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: Record<string, string>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const aspects = chart.aspects ?? [];

  if (aspects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ამ რუკაში ძირითადი ასპექტები არ ჩანს.
      </p>
    );
  }

  // Bucket by family + apply personal-planet bias inside each bucket.
  const byFamily: Record<Family, NonNullable<NatalChartJson["aspects"]>> = {
    harmonic: [],
    tense: [],
    neutral: [],
  };
  for (const a of aspects) {
    const fam = (a.family as Family) in byFamily ? (a.family as Family) : "neutral";
    byFamily[fam].push(a);
  }
  for (const k of FAMILY_ORDER) byFamily[k] = sortAspects(byFamily[k]);

  return (
    <div className="space-y-8">
      {FAMILY_ORDER.map((family) => {
        const items = byFamily[family];
        if (items.length === 0) return null;
        const meta = FAMILY_META[family];

        return (
          <section key={family}>
            <header className="mb-3 flex items-baseline gap-2">
              <span aria-hidden style={{ color: meta.color }}>
                {meta.emoji}
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {meta.labelKa}
              </h3>
              <span
                className="rounded-full border px-2 py-0.5 text-[11px] tabular-nums"
                style={{
                  borderColor: `color-mix(in oklch, ${meta.color} 35%, transparent)`,
                  background: `color-mix(in oklch, ${meta.color} 10%, transparent)`,
                  color: meta.color,
                }}
              >
                {items.length}
              </span>
              <span className="ml-1 truncate text-xs text-muted-foreground">
                {meta.descriptionKa}
              </span>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((a) => {
                const id = aspectKey(a.a, a.b, a.kind);
                const left = bodyDisplay(chart, a.a);
                const right = bodyDisplay(chart, a.b);
                const text = interpretations?.[id];
                const open = openId === id;
                const hasBody = Boolean(text);

                return (
                  <article
                    key={id}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border ring-1 ring-foreground/5 backdrop-blur-xl transition-all",
                      open
                        ? "border-foreground/20"
                        : "border-border hover:border-foreground/15"
                    )}
                    style={{
                      background: `linear-gradient(140deg, color-mix(in oklch, ${meta.color} 12%, transparent), color-mix(in oklch, ${meta.color} 3%, oklch(0.18 0.04 285 / 0.55)) 70%)`,
                    }}
                    title={orbTooltip(a.orb)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : id)}
                      disabled={!hasBody}
                      aria-expanded={open}
                      className={cn(
                        "relative flex w-full items-start gap-3 p-4 text-left",
                        hasBody && "cursor-pointer"
                      )}
                    >
                      {/* Glyph triptych — left body, aspect, right body */}
                      <div
                        className="flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-lg shadow-[inset_0_0_0_1px_var(--ring)]"
                        style={{
                          ["--ring" as string]: `color-mix(in oklch, ${meta.color} 35%, transparent)`,
                          background: `color-mix(in oklch, ${meta.color} 10%, transparent)`,
                        }}
                      >
                        <span title={left.label}>{left.symbol}</span>
                        <span
                          className="text-xl"
                          style={{ color: meta.color }}
                          aria-hidden
                        >
                          {ASPECT_SYMBOL[a.kind]}
                        </span>
                        <span title={right.label}>{right.symbol}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-balance text-sm font-medium leading-tight tracking-tight">
                          {left.label} {ASPECT_LABEL_KA[a.kind]} {right.label}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {strengthLabel(a.orb, a.kind)}
                        </div>
                      </div>

                      {hasBody && (
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "size-4 shrink-0 self-center text-muted-foreground transition-transform duration-200",
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
                          transition={{
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div
                            className="border-t px-4 pb-4 pt-3 text-sm leading-relaxed text-foreground/90"
                            style={{
                              borderColor: `color-mix(in oklch, ${meta.color} 25%, transparent)`,
                            }}
                          >
                            {text}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
