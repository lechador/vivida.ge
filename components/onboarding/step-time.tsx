"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TimeValue } from "./types";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function StepTime({
  value,
  onChange,
  locale = "ka",
}: {
  value: TimeValue;
  onChange: (next: TimeValue) => void;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const minuteRef = useRef<HTMLInputElement>(null);

  const headingText = en
    ? "The exact time matters too."
    : "ზუსტი დროც მნიშვნელოვანია.";
  const descText = en
    ? "Your birth time reveals your rising sign and houses—the chart's deepest layer."
    : "დაბადების დრო ხსნის შენს ამომავალ ნიშანსა და სახლებს — რუკის ყველაზე ღრმა შრეს.";
  const hourLabel = en ? "Hour" : "საათი";
  const minuteLabel = en ? "Minute" : "წუთი";
  const unknownLabel = en ? "I don't know the exact time" : "არ ვიცი ზუსტი დრო";
  const unknownHint = en
    ? "We'll use 12:00 in this case. Your Sun and most planets will remain accurate, but your rising sign and houses may not be."
    : "ამ შემთხვევაში, დროს 12:00-ად ჩავთვლით. შენი მზე და პლანეტების უმეტესობა ზუსტი იქნება, თუმცა ამომავალი ნიშანი და სახლები, შესაძლოა, არ იყოს ზუსტი.";

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {headingText}
        </h2>
        <p className="text-muted-foreground">{descText}</p>
      </header>

      <div
        className={cn(
          "mx-auto grid max-w-xs grid-cols-2 gap-3 transition-opacity",
          value.unknown && "pointer-events-none opacity-40",
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="hour">{hourLabel}</Label>
          <Input
            id="hour"
            inputMode="numeric"
            placeholder="HH"
            maxLength={2}
            value={value.hour}
            disabled={value.unknown}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              onChange({ ...value, hour: v });
              if (v.length === 2) minuteRef.current?.focus();
            }}
            className="text-center text-lg tabular-nums"
            autoFocus={!value.unknown}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="minute">{minuteLabel}</Label>
          <Input
            id="minute"
            ref={minuteRef}
            inputMode="numeric"
            placeholder="MM"
            maxLength={2}
            value={value.minute}
            disabled={value.unknown}
            onChange={(e) =>
              onChange({
                ...value,
                minute: e.target.value.replace(/\D/g, "").slice(0, 2),
              })
            }
            className="text-center text-lg tabular-nums"
          />
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => onChange({ ...value, unknown: !value.unknown })}
        className={cn(
          "mx-auto flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
          value.unknown
            ? "border-[var(--vivida-cyan)]/60 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]"
            : "border-border text-muted-foreground hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "size-3 rounded-full border-2 transition-colors",
            value.unknown
              ? "border-[var(--vivida-cyan)] bg-[var(--vivida-cyan)]"
              : "border-muted-foreground",
          )}
        />
        {unknownLabel}
      </motion.button>

      {value.unknown && (
        <p className="mx-auto max-w-sm text-center text-xs text-muted-foreground/80">
          {unknownHint}
        </p>
      )}
    </div>
  );
}

export function validateTime(
  value: TimeValue,
): { ok: true; time: string | null } | { ok: false } {
  if (value.unknown) return { ok: true, time: null };
  const h = Number(value.hour);
  const m = Number(value.minute);
  if (Number.isNaN(h) || Number.isNaN(m)) return { ok: false };
  if (h < 0 || h > 23 || m < 0 || m > 59) return { ok: false };
  if (value.hour === "" || value.minute === "") return { ok: false };
  return {
    ok: true,
    time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
  };
}
