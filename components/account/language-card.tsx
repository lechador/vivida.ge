"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { updateInterfaceLanguage } from "@/actions/interface-language";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

const OPTIONS: Array<{ value: UserLocale; label: string; nativeLabel: string }> = [
  { value: "ka", label: "Georgian", nativeLabel: "ქართული" },
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "am", label: "Armenian", nativeLabel: "Հայերեն" },
];

export function LanguageCard({ initial }: { initial: UserLocale }) {
  const router = useRouter();
  const [locale, setLocale] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const en = locale === "en";
  const am = locale === "am";

  function select(next: UserLocale) {
    if (next === locale || isPending) return;
    setLocale(next);
    startTransition(async () => {
      try {
        await updateInterfaceLanguage(next);
        router.refresh();
      } catch {
        setLocale(locale);
      }
    });
  }

  const title = am ? "Լեզու" : en ? "Language" : "ენა";
  const description = am
    ? "Ընտրեք ձեր հաշվի և նավիգացիայի լեզուն:"
    : en
    ? "Choose the language used across your account and authenticated navigation."
    : "აირჩიე ანგარიშისა და ავტორიზებული ნავიგაციის ენა.";
  const updatingText = am ? "Թարմացվում է…" : en ? "Updating…" : "ახლდება…";

  return (
    <section lang={locale} className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-5 flex items-start gap-3">
        <span className="rounded-xl bg-[var(--vivida-cyan)]/12 p-2.5 text-[var(--vivida-cyan)]">
          <Languages className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPTIONS.map((option) => {
          const selected = locale === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => select(option.value)}
              disabled={isPending}
              aria-pressed={selected}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-all",
                selected
                  ? "border-[var(--vivida-cyan)]/55 bg-[var(--vivida-cyan)]/10 ring-1 ring-[var(--vivida-cyan)]/20"
                  : "border-border bg-card/40 hover:bg-card/70",
                isPending && "opacity-70",
              )}
            >
              <span className="block text-sm font-semibold">{option.nativeLabel}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{option.label}</span>
            </button>
          );
        })}
      </div>
      {isPending && <p className="mt-3 text-xs text-muted-foreground">{updatingText}</p>}
    </section>
  );
}

