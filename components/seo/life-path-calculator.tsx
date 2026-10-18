"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import {
  lifePathFromDate,
  reduceToLifePath,
  type LifePathNumber,
} from "@/lib/numerology";
import type { UserLocale } from "@/lib/i18n/user-locale";

const SAMPLE_DATES = [
  { label: "1994-08-17", value: "1994-08-17" },
  { label: "1998-11-29", value: "1998-11-29" },
  { label: "2001-03-14", value: "2001-03-14" },
];

function digitSumString(val: number): number {
  return String(val)
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

export function LifePathCalculator({
  archetypes,
  locale = "ka",
}: {
  archetypes: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const [date, setDate] = useState("");
  const [result, setResult] = useState<{
    number: LifePathNumber;
    steps: string[];
  } | null>(null);

  function compute(targetDate?: string) {
    const d = targetDate ?? date;
    if (!d) return;
    const parts = d.split("-").map((x) => Number.parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return;
    const [year, month, day] = parts;
    if (targetDate) setDate(targetDate);

    const yRed = reduceToLifePath(digitSumString(year));
    const mRed = reduceToLifePath(month);
    const dRed = reduceToLifePath(day);
    const num = lifePathFromDate(year, month, day);

    const steps = [
      `${year} → ${yRed}`,
      `${String(month).padStart(2, "0")} → ${mRed} · ${String(day).padStart(2, "0")} → ${dRed}`,
      `${yRed} + ${mRed} + ${dRed} = ${yRed + mRed + dRed} → ${num}`,
    ];
    setResult({ number: num, steps });
  }

  function reset() {
    setDate("");
    setResult(null);
  }

  return (
    <div className="relative border border-border bg-card">
      <CornerCrosshair position="top-left" />
      <CornerCrosshair position="top-right" />
      <CornerCrosshair position="bottom-left" />
      <CornerCrosshair position="bottom-right" />

      {/* Top Instrument Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/60 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:px-7">
        <span className="text-primary">
          {en
            ? "01 · Pythagorean Digit Reduction Instrument"
            : "01 · პითაგორული რიცხვითი რედუქციის ინსტრუმენტი"}
        </span>
        <span className="tabular-nums">1–9 · 11 · 22 · 33</span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label
            htmlFor="lifepath-date"
            className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            {en ? "Enter birth date" : "შეიყვანე დაბადების თარიღი"}
          </label>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span>{en ? "Examples:" : "ნიმუში:"}</span>
            {SAMPLE_DATES.map((sample) => (
              <button
                key={sample.value}
                type="button"
                onClick={() => compute(sample.value)}
                className="rounded-sm border border-border bg-background/60 px-2 py-0.5 tabular-nums text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="lifepath-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="h-12 w-full rounded-md border border-border bg-background px-4 font-mono text-sm tabular-nums text-foreground outline-none transition-colors focus:border-primary"
          />
          <Button
            type="button"
            onClick={() => compute()}
            disabled={!date}
            className="h-12 shrink-0 px-6"
          >
            {en ? "Calculate my number" : "გამოთვალე ჩემი რიცხვი"}
          </Button>
          {result && (
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              className="h-12 shrink-0 gap-1.5 px-4"
            >
              <RotateCcw className="size-4" />
              {en ? "Reset" : "თავიდან"}
            </Button>
          )}
        </div>

        {result && (
          <div className="mt-6 border border-primary/40 bg-background/60">
            {/* Step-by-Step Mathematical Reduction Ledger */}
            <div className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
              {result.steps.map((step, idx) => (
                <div key={idx} className="bg-card px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {en ? `Step 0${idx + 1}` : `ეტაპი 0${idx + 1}`}
                  </div>
                  <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                    {step}
                  </div>
                </div>
              ))}
            </div>

            {/* Final Archetype Readout */}
            <div className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-sm border border-primary/50 bg-primary/10 font-mono text-2xl font-semibold tabular-nums text-primary">
                  {result.number}
                </span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                    {result.number.length > 1
                      ? en
                        ? "Master Number"
                        : "მასტერ-რიცხვი"
                      : en
                        ? "Your Life Path Number"
                        : "შენი ბედის რიცხვი"}
                  </div>
                  <div className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">
                    {archetypes[result.number]}
                  </div>
                </div>
              </div>
              <Button asChild variant="default" className="shrink-0 gap-1.5">
                <Link
                  href={
                    en
                      ? `/en/numerology/${result.number}`
                      : `/numerologia/${result.number}`
                  }
                >
                  {en ? "Read Full Monograph" : "სრული აღწერა"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
