"use client";

import { ShieldCheck } from "lucide-react";

import type { UserLocale } from "@/lib/i18n/locale";

/**
 * Privacy/cookie choices, moved here from the floating shield that used to sit
 * over the mobile bottom navigation. Opens the shared consent panel through a
 * window event so the consent logic lives in one place.
 */
export function PrivacyChoicesCard({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="flex items-start gap-3">
        <div className="hidden size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)] sm:grid">
          <ShieldCheck className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">
            {en ? "Privacy choices" : "კონფიდენციალურობის არჩევანი"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {en
              ? "Review or change whether Google Analytics and Meta cookies may measure your visits."
              : "ნახე ან შეცვალე, შეიძლება თუ არა Google Analytics-ისა და Meta-ს cookie-ებმა ვიზიტების გაზომვა."}
          </p>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("vivida:open-privacy-settings"),
              );
            }}
            className="mt-3 rounded-sm border border-border px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {en ? "Open privacy settings" : "პარამეტრების გახსნა"}
          </button>
        </div>
      </div>
    </section>
  );
}
