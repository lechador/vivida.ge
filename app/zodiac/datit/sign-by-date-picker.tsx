"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ZODIAC_DATES,
  signSlugByDate,
} from "@/lib/seo/zodiac-dates";
import { signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const MONTHS_KA = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

const DAYS_IN_MONTH = (m: number) =>
  m === 2 ? 29 : [4, 6, 9, 11].includes(m) ? 30 : 31;

export function SignByDatePicker() {
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);

  const result = useMemo(() => {
    if (month == null || day == null) return null;
    const slug = signSlugByDate(month, day);
    return SIGNS_CONTENT[slug];
  }, [month, day]);

  const meta = result ? signMetaBySlug(result.slug) : null;
  const accent = meta ? signColor(meta) : "var(--vivida-violet)";
  const dates = result ? ZODIAC_DATES[result.slug] : null;

  return (
    <div className="rounded-3xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Calendar className="size-3.5" />
        შენი დაბადების თარიღი
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">
            თვე
          </span>
          <select
            value={month ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              setMonth(v);
              if (v != null && day != null && day > DAYS_IN_MONTH(v)) {
                setDay(DAYS_IN_MONTH(v));
              }
            }}
            className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-[var(--vivida-violet)]/60 focus:ring-2 focus:ring-[var(--vivida-violet)]/30"
          >
            <option value="">აირჩიე თვე</option>
            {MONTHS_KA.map((label, i) => (
              <option key={i} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">
            დღე
          </span>
          <select
            value={day ?? ""}
            onChange={(e) =>
              setDay(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={month == null}
            className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-[var(--vivida-violet)]/60 focus:ring-2 focus:ring-[var(--vivida-violet)]/30 disabled:opacity-50"
          >
            <option value="">აირჩიე დღე</option>
            {month != null &&
              Array.from({ length: DAYS_IN_MONTH(month) }, (_, i) => i + 1).map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
          </select>
        </label>
      </div>

      {/* Result card */}
      {result && dates && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border p-5 ring-1 ring-foreground/5 sm:p-6"
          style={{
            borderColor: `color-mix(in oklch, ${accent} 40%, transparent)`,
            background: `linear-gradient(135deg, color-mix(in oklch, ${accent} 12%, transparent), transparent)`,
          }}
        >
          <div
            aria-hidden
            className="absolute -right-12 -top-12 size-40 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex items-center gap-5">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                color: accent,
              }}
            >
              {result.symbol}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                შენი ცის ნიშანია
              </div>
              <div className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                {result.labelKa}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {dates.rangeKa} · {result.element}
              </div>
            </div>
          </div>

          <p className="relative mt-4 text-pretty text-sm leading-relaxed text-foreground/90 sm:text-base">
            {result.tagline}
          </p>

          <Button
            asChild
            variant="mystic"
            className="relative mt-5 w-full sm:w-auto"
          >
            <Link href={`/zodiac/${result.slug}`}>
              ნახე {result.labelKa}-ის სრული აღწერა
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
