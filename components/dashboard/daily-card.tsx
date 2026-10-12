"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Sparkles } from "lucide-react";

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
import { Accent } from "@/components/en/editorial";

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

/** Harmonic aspects get the cyan accent, tense ones pink, neutral violet. */
const ASPECT_TONE: Record<string, string> = {
  conjunction: "var(--vivida-violet)",
  sextile: "var(--vivida-cyan)",
  trine: "var(--vivida-cyan)",
  square: "var(--vivida-pink)",
  opposition: "var(--vivida-pink)",
};

/**
 * Daily horoscope hero card. Shown above the chart wheel so it's
 * the first thing returning users see — the engagement loop.
 */
export function DailyCard({
  horoscope,
  transits = [],
  onRead,
  children,
  locale = "ka",
}: {
  horoscope: DailyHoroscope;
  /** Today's strongest transit aspects + their library interpretations. */
  transits?: TransitBreakdownItem[];
  onRead?: () => void;
  /** Primary daily action stays next to the summary, before optional details. */
  children?: ReactNode;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const readSentinelRef = useRef<HTMLParagraphElement>(null);
  const readTrackedRef = useRef(false);

  // Longer body paragraphs (library duplicates already filtered) — rendered
  // inside the expandable details block so the headline + summary stay the
  // first thing on screen.
  const detailParagraphs = horoscope.body
    .split(/\n{2,}/)
    .filter(Boolean)
    // Library-composed bodies reuse the same texts the transit
    // breakdown below shows verbatim — drop those paragraphs here so
    // nothing reads twice. Surfaces without the breakdown (email,
    // mobile) keep the full body.
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

  // `horoscope.date` is already the user's local date, so it is rendered
  // verbatim — no timezone shift, and no dependence on the browser shipping
  // Georgian locale data.
  const date = en
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${horoscope.date}T00:00:00Z`))
    : kaLongDate(horoscope.date);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-7 backdrop-blur-xl sm:p-9">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 size-72 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -left-10 size-44 rounded-full bg-[radial-gradient(circle,var(--vivida-cyan)_0%,transparent_70%)] opacity-25 blur-2xl"
      />

      <header className="relative flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Today" : "დღევანდელი დღე"} · {date}
          </div>
          <h2
            className={
              en
                ? "font-display mt-1 text-balance text-2xl font-medium leading-tight tracking-[-0.01em] sm:text-3xl"
                : "mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
            }
          >
            {en ? (
              <Accent>{horoscope.headline}</Accent>
            ) : (
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {horoscope.headline}
              </span>
            )}
          </h2>
        </div>
        <Sparkles
          className="size-7 shrink-0 text-[var(--vivida-pink)]"
          aria-hidden
        />
      </header>

      {horoscope.themes.length > 0 && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          {horoscope.themes.map((theme, i) => (
            <span
              key={i}
              className="rounded-full border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--vivida-cyan)]"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      <p
        ref={readSentinelRef}
        className="relative mt-5 text-base leading-relaxed text-foreground/90"
      >
        {horoscope.summary}
      </p>

      {children != null && <div className="relative mt-4">{children}</div>}

      {hasDetails && (
        <details className="relative mt-5 rounded-xl border border-border/50 bg-background/30">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            {en ? "Details and transits" : "დეტალები და ტრანზიტები"}
          </summary>
          <div className="space-y-4 px-4 pb-4 text-sm leading-relaxed text-foreground/85">
            {detailParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {transits.length > 0 && (
              <section className="border-t border-border/40 pt-4">
                <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {en ? "Today's transits" : "დღის ტრანზიტები"}
                </h3>
                <ul className="mt-3 space-y-3">
                  {transits.map((t, i) => {
                    const tone = ASPECT_TONE[t.kind] ?? "var(--vivida-violet)";
                    const transitBody = BODIES[t.transit];
                    const natalBody = BODIES[t.natal];
                    return (
                      <li
                        key={i}
                        className="rounded-xl border border-border/50 bg-background/30 p-3.5"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium"
                            style={{
                              color: tone,
                              borderColor: `color-mix(in oklch, ${tone} 40%, transparent)`,
                              backgroundColor: `color-mix(in oklch, ${tone} 10%, transparent)`,
                            }}
                          >
                            {transitBody?.symbol}{" "}
                            {(en
                              ? transitBody?.labelEn
                              : transitBody?.labelKa) ?? t.transit}
                            <span aria-hidden>
                              {ASPECT_GLYPH[t.kind] ?? "·"}
                            </span>
                            {natalBody?.symbol}{" "}
                            {(en ? natalBody?.labelEn : natalBody?.labelKa) ??
                              t.natal}
                          </span>
                          <span className="text-muted-foreground">
                            {(en ? ASPECT_EN : ASPECT_KA)[t.kind] ?? t.kind}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground/95">
                          {t.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
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

      <p className="relative mt-6 border-t border-border/40 pt-4 text-xs text-muted-foreground">
        {en
          ? "A new reading will be waiting tomorrow."
          : "ხვალ ახალი წინასწარმეტყველება გელოდება."}
      </p>
    </article>
  );
}
