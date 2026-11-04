"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { BirthDataBanner } from "@/components/dashboard/birth-banner";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import {
  BIRTH_DATE_ACTIVATION_SURFACE,
  showInlineBirthPreview,
} from "@/lib/birth-date-activation-config";
import { useExperiment } from "@/lib/use-experiment";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Treatment arm of the birth-date activation experiment: a blurred preview
 * of what the personal chart looks like, with the birth-date field inline,
 * so the user never has to leave the dashboard to unlock it. Control (and
 * anyone not yet assigned) sees the shipped slim banner instead. The wheel
 * below is a generic decorative preview, it carries no personal data.
 */
export function ChartPreviewBirthBanner({
  locale = "ka",
}: {
  locale?: UserLocale;
}) {
  const router = useRouter();
  const variant = useExperiment(
    EXPERIMENTS.birthDateActivation,
    BIRTH_DATE_ACTIVATION_SURFACE,
  );
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showInlineBirthPreview(variant)) {
    return <BirthDataBanner locale={locale} />;
  }

  const en = locale !== "ka" && locale !== "pl";

  async function handleSave() {
    if (!value || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/birth-date", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dateOfBirth: value }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(
          data?.error ??
            (locale === "pl"
              ? "Nie udało się zapisać, spróbuj ponownie"
              : en
                ? "Could not save, try again"
                : "ვერ შეინახა, ცადე თავიდან"),
        );
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
        <div className="relative mx-auto w-full max-w-55 shrink-0 lg:mx-0">
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className="aspect-square w-full blur-[3px]"
          >
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="var(--vivida-violet)"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="var(--vivida-cyan)"
              strokeOpacity="0.45"
              strokeWidth="1"
            />
            <circle
              cx="100"
              cy="100"
              r="48"
              fill="none"
              stroke="var(--vivida-gold)"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <circle
              cx="100"
              cy="100"
              r="10"
              fill="var(--vivida-violet)"
              fillOpacity="0.35"
            />
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * Math.PI) / 6;
              return (
                <line
                  key={i}
                  x1={100 + 48 * Math.cos(angle)}
                  y1={100 + 48 * Math.sin(angle)}
                  x2={100 + 96 * Math.cos(angle)}
                  y2={100 + 96 * Math.sin(angle)}
                  stroke="var(--foreground)"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />
              );
            })}
            {[
              [138, 62],
              [66, 84],
              [118, 138],
              [80, 122],
              [148, 112],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="5"
                fill="var(--vivida-cyan)"
                fillOpacity="0.55"
              />
            ))}
          </svg>
          <span className="absolute inset-x-0 bottom-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {locale === "pl" ? "Podgląd" : en ? "Preview" : "წინასწარი ნახვა"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
              <Sparkles className="size-4 text-[var(--vivida-violet)]" />
            </span>
            <div>
              <p className="text-base font-semibold">
                {locale === "pl"
                  ? "Tak wygląda Twój kosmogram"
                  : en
                    ? "This is what your personal chart looks like"
                    : "ასე გამოიყურება შენი პირადი რუკა"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "pl"
                  ? "Wpisz datę urodzenia, a kosmogram, horoskop dzienny i analiza zgodności otworzą się tutaj, na miejscu."
                  : en
                    ? "Enter your birth date and your chart, daily horoscope and compatibility open up right here."
                    : "შეიყვანე დაბადების თარიღი და შენი რუკა, დღიური ჰოროსკოპი და თავსებადობა პირდაპირ აქ გაიხსნება."}
              </p>
            </div>
          </div>

          {saved ? (
            <p className="mt-4 text-sm font-medium text-primary">
              {locale === "pl"
                ? "Zapisano, budujemy Twój kosmogram…"
                : en
                  ? "Saved, building your chart…"
                  : "შენახულია, შენი რუკა მზადდება…"}
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={value}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setValue(e.target.value)}
                aria-label={
                  locale === "pl"
                    ? "Data urodzenia"
                    : en
                      ? "Birth date"
                      : "დაბადების თარიღი"
                }
                className="h-10 rounded-lg border border-border bg-background px-3 text-base text-foreground lg:text-sm"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!value || saving}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                {saving
                  ? "…"
                  : locale === "pl"
                    ? "Otwórz kosmogram"
                    : en
                      ? "Unlock my chart"
                      : "გახსენი ჩემი რუკა"}
              </button>
              <span className="text-xs text-muted-foreground">
                {locale === "pl"
                  ? "Godzina i miejsce możesz dodać później."
                  : en
                    ? "You can add time and place later."
                    : "დროისა და ადგილის დამატება მერეც შეგიძლია."}
              </span>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
