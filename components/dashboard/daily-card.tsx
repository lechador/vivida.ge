"use client";

import { useEffect, useRef, type ReactNode } from "react";

import type { DailyHoroscope } from "@/db/schema";
import type { TransitBreakdownItem } from "@/lib/transit-library";
import { kaLongDate } from "@/lib/i18n/ka-date";
import { BODIES } from "@/lib/zodiac";
import {
  ANALYTICS_EVENT,
  trackEvent,
  trackFirstResultViewed,
} from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const ASPECT_KA: Record<string, string> = {
  conjunction: "შეერთება",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};
const ASPECT_EN: Record<string, string> = {
  conjunction: "conjunction",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposition",
};

/**
 * Editorial Celestial Daily Transit Briefing Card.
 * Replaces spinning conic blurs, rainbow headline gradients, and pill badges
 * with an authoritative editorial reading column and tabular transit ledger.
 */
export function DailyCard({
  horoscope,
  transits = [],
  onRead,
  children,
  locale = "ka",
}: {
  horoscope: DailyHoroscope;
  transits?: TransitBreakdownItem[];
  onRead?: () => void;
  children?: ReactNode;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const readSentinelRef = useRef<HTMLParagraphElement>(null);
  const readTrackedRef = useRef(false);

  const detailParagraphs = horoscope.body
    .split(/\n{2,}/)
    .filter(Boolean)
    .filter((para) => !transits.some((t) => t.body.trim() === para.trim()));
  const hasDetails = detailParagraphs.length > 0 || transits.length > 0;

  useEffect(() => {
    readTrackedRef.current = false;
    trackEvent(ANALYTICS_EVENT.dailyHoroscopeViewed, {
      date: horoscope.date,
      has_transits: transits.length > 0 ? 1 : 0,
    });
    trackFirstResultViewed({
      product: "daily_horoscope",
      surface: "dashboard",
    });

    const sentinel = readSentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !entries.some((entry) => entry.isIntersecting) ||
          readTrackedRef.current
        )
          return;
        readTrackedRef.current = true;
        trackEvent(ANALYTICS_EVENT.dailyHoroscopeRead, {
          date: horoscope.date,
          has_transits: transits.length > 0 ? 1 : 0,
        });
        onRead?.();
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [horoscope.date, onRead, transits.length]);

  const date = en
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${horoscope.date}T00:00:00Z`))
    : kaLongDate(horoscope.date);

  return (
    <article className="rounded-md border border-border bg-card p-6 sm:p-8">
      <header className="border-b border-border/80 pb-5">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-[0.2em] text-primary">
            {en ? "Daily Transit Briefing" : "დღევანდელი პროგნოზი"}
          </span>
          <span className="font-mono tabular-nums">{date}</span>
        </div>

        <h2
          className={
            en
              ? "font-display mt-3 text-balance text-2xl font-medium leading-tight tracking-[-0.01em] text-foreground sm:text-3xl"
              : "mt-3 text-balance text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
          }
        >
          {horoscope.headline}
        </h2>

        {/* Unboxed inline themes separated by middle dots */}
        {horoscope.themes.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-primary">
            {horoscope.themes.map((theme, i) => (
              <span key={i} className="inline-flex items-center gap-2.5">
                {i > 0 && (
                  <span aria-hidden className="text-muted-foreground">
                    ·
                  </span>
                )}
                <span>{theme}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <p
        ref={readSentinelRef}
        className="mt-5 max-w-[68ch] text-pretty text-base leading-relaxed text-foreground/90"
      >
        {horoscope.summary}
      </p>

      {children != null && <div className="mt-6">{children}</div>}

      {hasDetails && (
        <details className="group mt-6 border-t border-border/80 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span>{en ? "Details and transits" : "დეტალები და ტრანზიტები"}</span>
            <span
              aria-hidden
              className="font-mono text-sm transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/85">
            {detailParagraphs.map((para, i) => (
              <p key={i} className="max-w-[68ch]">
                {para}
              </p>
            ))}
            {transits.length > 0 && (
              <section className="border-t border-border/70 pt-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  {en ? "Today's Transits" : "დღის ტრანზიტები"}
                </h3>
                <ul className="divide-y divide-border/70 border border-border bg-secondary/20">
                  {transits.map((t, i) => {
                    const transitBody = BODIES[t.transit];
                    const natalBody = BODIES[t.natal];
                    return (
                      <li key={i} className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-medium text-primary">
                            {transitBody?.symbol}{" "}
                            {(en
                              ? transitBody?.labelEn
                              : transitBody?.labelKa) ?? t.transit}{" "}
                            <span aria-hidden className="text-muted-foreground">
                              {ASPECT_GLYPH[t.kind] ?? "·"}
                            </span>{" "}
                            {natalBody?.symbol}{" "}
                            {(en ? natalBody?.labelEn : natalBody?.labelKa) ??
                              t.natal}
                          </span>
                          <span className="font-mono uppercase tracking-wider text-muted-foreground">
                            {(en ? ASPECT_EN : ASPECT_KA)[t.kind] ?? t.kind}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-foreground">
                          {t.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {t.body}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </details>
      )}

      <p className="mt-6 border-t border-border/70 pt-4 text-xs text-muted-foreground">
        {en
          ? "A new reading will be waiting tomorrow."
          : "ხვალ ახალი წინასწარმეტყველება გელოდება."}
      </p>
    </article>
  );
}
