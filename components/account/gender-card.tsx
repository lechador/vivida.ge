"use client";

import { useState, useTransition } from "react";

import { updateGender } from "@/actions/profile";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Compact sex selector for Account — instant-save (no Save button), mirrors
 * the discoverability toggle. Only used for aggregate audience analytics.
 */
export function GenderCard({ initial, locale = "ka" }: { initial: "male" | "female" | null; locale?: UserLocale }) {
  const en = locale === "en";
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();

  function pick(g: "male" | "female") {
    if (g === value) return;
    setValue(g);
    startTransition(() => updateGender(g));
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{en ? "Sex" : "სქესი"}</div>
        <div className="text-xs text-muted-foreground">
          {en ? "Used only for anonymous aggregate statistics." : "გამოიყენება მხოლოდ ანონიმური, ჯამური სტატისტიკისთვის."}
        </div>
      </div>
      <div className={cn("flex gap-2", pending && "opacity-60")}>
        {(
          [
            { key: "female", label: en ? "Female" : "მდედრობითი", glyph: "♀" },
            { key: "male", label: en ? "Male" : "მამრობითი", glyph: "♂" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => pick(opt.key)}
            aria-pressed={value === opt.key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
              value === opt.key
                ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]/12 text-foreground"
                : "border-border text-foreground/75 hover:border-[var(--vivida-violet)]/50"
            )}
          >
            <span className="text-[var(--vivida-violet)]">{opt.glyph}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
