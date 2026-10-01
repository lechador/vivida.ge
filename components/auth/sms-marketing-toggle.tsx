"use client";

import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/** Explicit, off-by-default promotional SMS consent. OTP messages are separate. */
export function SmsMarketingToggle({
  checked,
  onChange,
  disabled = false,
  locale,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card/40 p-3 text-left transition-colors hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">
          {en ? "Promotional SMS" : "მარკეტინგული SMS-ები"}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {en
            ? "I agree to receive Vivida news and offers at my verified number."
            : "თანახმა ვარ, დადასტურებულ ნომერზე მივიღო Vivida-ს სიახლეები და შეთავაზებები."}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-[var(--vivida-cyan)]" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-all",
            checked ? "left-5" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
