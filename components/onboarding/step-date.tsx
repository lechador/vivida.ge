"use client";

import { useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DateValue, Gender } from "./types";

export function StepDate({
  value,
  onChange,
  gender,
  onGenderChange,
}: {
  value: DateValue;
  onChange: (next: DateValue) => void;
  gender: Gender | null;
  onGenderChange: (g: Gender) => void;
}) {
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          როდის დაიწყო შენი ისტორია?
        </h2>
        <p className="text-muted-foreground">
          დაბადების დღე განსაზღვრავს შენს მზეს, მთვარეს და ძირითად არქეტიპებს.
        </p>
      </header>

      <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr_1.4fr] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="day">რიცხვი</Label>
          <Input
            id="day"
            inputMode="numeric"
            placeholder="DD"
            maxLength={2}
            value={value.day}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              onChange({ ...value, day: v });
              if (v.length === 2) monthRef.current?.focus();
            }}
            className="text-center text-lg tabular-nums"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="month">თვე</Label>
          <Input
            id="month"
            ref={monthRef}
            inputMode="numeric"
            placeholder="MM"
            maxLength={2}
            value={value.month}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              onChange({ ...value, month: v });
              if (v.length === 2) yearRef.current?.focus();
            }}
            className="text-center text-lg tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year">წელი</Label>
          <Input
            id="year"
            ref={yearRef}
            inputMode="numeric"
            placeholder="YYYY"
            maxLength={4}
            value={value.year}
            onChange={(e) =>
              onChange({
                ...value,
                year: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
            className="text-center text-lg tabular-nums"
          />
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-1.5">
        <Label>სქესი</Label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: "female", label: "მდედრობითი", glyph: "♀" },
              { key: "male", label: "მამრობითი", glyph: "♂" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onGenderChange(opt.key)}
              aria-pressed={gender === opt.key}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                gender === opt.key
                  ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]/10 text-foreground shadow-[0_0_20px_-6px_var(--vivida-violet)]"
                  : "border-border bg-background/40 text-foreground/80 hover:border-[var(--vivida-violet)]/50 hover:bg-[var(--vivida-violet)]/5"
              )}
            >
              <span className="text-lg text-[var(--vivida-violet)]">{opt.glyph}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Validate and convert {day, month, year} → "YYYY-MM-DD" or null if invalid.
 * Rejects impossible dates (e.g. Feb 30) by round-tripping through Date.
 */
export function validateDate(value: DateValue): string | null {
  const d = Number(value.day);
  const m = Number(value.month);
  const y = Number(value.year);
  if (!d || !m || !y) return null;
  if (y < 1900 || y > new Date().getUTCFullYear()) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d
    .toString()
    .padStart(2, "0")}`;
}
