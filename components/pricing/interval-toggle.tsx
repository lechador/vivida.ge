"use client";

import { motion } from "framer-motion";

import type { IntervalId } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function IntervalToggle({
  value,
  onChange,
  yearlyDiscountPercent,
}: {
  value: IntervalId;
  onChange: (v: IntervalId) => void;
  yearlyDiscountPercent: number;
}) {
  return (
    <div className="relative inline-flex rounded-full border border-border bg-card/40 p-1 backdrop-blur">
      {(["month", "year"] as const).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors",
              active ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="interval-toggle-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))]"
              />
            )}
            {opt === "month" ? "თვიური" : "წლიური"}
            {opt === "year" && yearlyDiscountPercent > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  active
                    ? "bg-background/20 text-background"
                    : "bg-[var(--vivida-cyan)]/15 text-[var(--vivida-cyan)]"
                )}
              >
                −{yearlyDiscountPercent}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
