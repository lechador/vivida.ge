"use client";

import { motion } from "framer-motion";

import {
  computeElementBalance,
  ELEMENT_ORDER,
  type Element,
} from "@/lib/elements";
import { bodyMeta } from "@/lib/zodiac";
import type { NatalChartJson } from "@/db/schema";

const ELEMENT_META: Record<
  Element,
  {
    glyph: string;
    color: string;
    fillFrom: string;
    fillTo: string;
    descriptor: string;
    heroTagline: string;
  }
> = {
  ცეცხლი: {
    glyph: "△",
    color: "oklch(0.7 0.22 30)",
    fillFrom: "oklch(0.7 0.22 30)",
    fillTo: "oklch(0.6 0.2 15)",
    descriptor: "მოქმედება, ვნება, ენთუზიაზმი",
    heroTagline: "შენი ცეცხლი გიბიძგებს, იმოქმედო პირველ რიგში",
  },
  მიწა: {
    glyph: "▽",
    color: "oklch(0.65 0.13 130)",
    fillFrom: "oklch(0.65 0.13 130)",
    fillTo: "oklch(0.5 0.1 110)",
    descriptor: "სტაბილურობა, რესურსები, ხანგრძლივობა",
    heroTagline: "შენი მიწა აშენებს ნელა და დიდხანს",
  },
  ჰაერი: {
    glyph: "△",
    color: "oklch(0.75 0.16 220)",
    fillFrom: "oklch(0.75 0.16 220)",
    fillTo: "oklch(0.6 0.18 210)",
    descriptor: "გონება, კომუნიკაცია, იდეები",
    heroTagline: "შენი ჰაერი ფიქრობს და ეპაექრება მსოფლიოს",
  },
  წყალი: {
    glyph: "▽",
    color: "oklch(0.6 0.2 280)",
    fillFrom: "oklch(0.6 0.2 280)",
    fillTo: "oklch(0.5 0.22 295)",
    descriptor: "ემოცია, ინტუიცია, თანაგრძნობა",
    heroTagline: "შენი წყალი გრძნობს იმას, რასაც სხვები ვერ ხედავენ",
  },
};

export function ElementsCard({ chart }: { chart: NatalChartJson }) {
  const balance = computeElementBalance(chart);
  const dominantMeta = ELEMENT_META[balance.dominant];
  const dominantPercent = balance.percentages[balance.dominant];

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 size-72 rounded-full opacity-25 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${dominantMeta.color} 0%, transparent 65%)`,
        }}
      />

      <header className="relative mb-6 flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            შენი ელემენტები
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            რომელი ენერგიები დომინირებენ შენს ცის რუკაში
          </p>
        </div>
      </header>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        {/* Hero — dominant element */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border bg-background/40 p-6"
          style={{
            borderColor: `color-mix(in oklch, ${dominantMeta.color} 50%, transparent)`,
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, ${dominantMeta.fillFrom}/0.18, transparent 70%)`,
            }}
          />
          <div className="relative">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              დომინანტი
            </div>
            <div
              className="mt-2 text-7xl leading-none"
              style={{ color: dominantMeta.color }}
            >
              {dominantMeta.glyph}
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">
              {balance.dominant}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {dominantMeta.descriptor}
            </div>
            <div
              className="mt-5 text-2xl font-semibold tabular-nums"
              style={{ color: dominantMeta.color }}
            >
              {Math.round(dominantPercent)}%
            </div>
            <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-foreground/85">
              {dominantMeta.heroTagline}.
            </p>
          </div>
        </motion.div>

        {/* Bars */}
        <div className="space-y-4">
          {ELEMENT_ORDER.map((el, i) => {
            const meta = ELEMENT_META[el];
            const percent = balance.percentages[el];
            const planets = balance.planetsByElement[el];
            const isDominant = el === balance.dominant;

            return (
              <div key={el} className="group">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xl leading-none"
                      style={{ color: meta.color }}
                    >
                      {meta.glyph}
                    </span>
                    <span
                      className={
                        "text-base font-medium" +
                        (isDominant ? " text-foreground" : " text-foreground/80")
                      }
                    >
                      {el}
                    </span>
                    {planets.length > 0 && (
                      <span className="ml-2 flex flex-wrap items-center gap-1 text-base text-muted-foreground/80">
                        {planets.map((key) => (
                          <span
                            key={key}
                            title={bodyMeta(key)?.labelKa ?? key}
                            className="leading-none"
                          >
                            {key === "ascendant"
                              ? "AC"
                              : key === "midheaven"
                                ? "MC"
                                : (bodyMeta(key)?.symbol ?? key[0])}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <span
                    className={
                      "text-sm font-semibold tabular-nums" +
                      (isDominant ? "" : " text-muted-foreground")
                    }
                    style={isDominant ? { color: meta.color } : undefined}
                  >
                    {Math.round(percent)}%
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-card/60">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${meta.fillFrom}, ${meta.fillTo})`,
                      boxShadow: isDominant
                        ? `0 0 16px -2px ${meta.color}`
                        : undefined,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{
                      delay: 0.15 + i * 0.1,
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
