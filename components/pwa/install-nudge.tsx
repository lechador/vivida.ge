"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { InstallAppButton } from "./install-button";
import { browserTrackingConsent } from "@/lib/tracking-consent";
import { ANALYTICS_EVENT } from "@/lib/analytics";
import { canPromptAfterDailyValue } from "@/lib/daily-ritual";
import type { UserLocale } from "@/lib/i18n/locale";

const SNOOZE_KEY = "vivida_pwa_nudge_after";
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

export function InstallNudge({ locale }: { locale: UserLocale }) {
  const [visible, setVisible] = useState(false);
  const en = locale !== "ka";

  useEffect(() => {
    const standalone = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const onValue = (event: Event) => {
      if (standalone() || !window.matchMedia("(max-width: 767px)").matches)
        return;
      if (browserTrackingConsent() === null) return;
      const pendingRitual = Boolean(
        document.querySelector('[data-daily-ritual="pending"]'),
      );
      const action = (event as CustomEvent<{ action?: string }>).detail?.action;
      if (
        !canPromptAfterDailyValue(
          pendingRitual,
          action === ANALYTICS_EVENT.dailyRitualCompleted,
        )
      )
        return;
      try {
        if (Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now()) return;
      } catch {
        // Browsers can disable localStorage; the dismissal still works now.
      }
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const onDismissed = () => {
      hide();
      try {
        localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
      } catch {
        // The current dismissal still takes effect.
      }
    };
    window.addEventListener("vivida:pwa-value-action", onValue);
    window.addEventListener("appinstalled", hide);
    window.addEventListener("vivida:pwa-install-accepted", hide);
    window.addEventListener("vivida:pwa-install-dismissed", onDismissed);
    return () => {
      window.removeEventListener("vivida:pwa-value-action", onValue);
      window.removeEventListener("appinstalled", hide);
      window.removeEventListener("vivida:pwa-install-accepted", hide);
      window.removeEventListener("vivida:pwa-install-dismissed", onDismissed);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      // The current dismissal still takes effect.
    }
  }

  if (!visible) return null;
  return (
    <aside className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-sm rounded-2xl border border-[var(--vivida-violet)]/40 bg-background/95 p-4 text-foreground shadow-2xl backdrop-blur-xl md:hidden">
      <button
        type="button"
        onClick={dismiss}
        aria-label={
          en ? "Dismiss install suggestion" : "დახურე დაყენების შეთავაზება"
        }
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:text-foreground"
      >
        <X aria-hidden className="size-4" />
      </button>
      <p className="pr-7 text-sm font-semibold">
        {en ? "Keep Vivida close" : "Vivida ყოველთვის ხელთ გქონდეს"}
      </p>
      <p className="mt-1 mb-3 text-xs leading-relaxed text-muted-foreground">
        {en
          ? "Add the web app to your home screen for quick access."
          : "დაამატე ვებ აპი მთავარ ეკრანზე, რომ სწრაფად გახსნა."}
      </p>
      <InstallAppButton locale={locale} surface="value_nudge" />
    </aside>
  );
}
