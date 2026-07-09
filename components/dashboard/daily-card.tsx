"use client";

import Link from "next/link";
import { Headphones, Lock, Sparkles } from "lucide-react";

import type { DailyHoroscope } from "@/db/schema";
import type { TransitBreakdownItem } from "@/lib/transit-library";
import { BODIES } from "@/lib/zodiac";
import { Button } from "@/components/ui/button";
import { HoroscopeAudioPlayer } from "./horoscope-audio-player";

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

/** Harmonic aspects get the cyan accent, tense ones pink, neutral violet. */
const ASPECT_TONE: Record<string, string> = {
  conjunction: "var(--vivida-violet)",
  sextile: "var(--vivida-cyan)",
  trine: "var(--vivida-cyan)",
  square: "var(--vivida-pink)",
  opposition: "var(--vivida-pink)",
};

/**
 * Pro-only daily horoscope hero card. Shown above the chart wheel so it's
 * the first thing returning users see — the engagement loop.
 */
export function DailyCard({
  horoscope,
  transits = [],
  timezone,
  savedVoice,
  canAudio = true,
}: {
  horoscope: DailyHoroscope;
  /** Today's strongest transit aspects + their library interpretations. */
  transits?: TransitBreakdownItem[];
  timezone: string;
  savedVoice?: string | null;
  canAudio?: boolean;
}) {
  const date = new Intl.DateTimeFormat("ka-GE", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(horoscope.date + "T12:00:00Z"));

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
            დღევანდელი დღე · {date}
          </div>
          <h2 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {horoscope.headline}
            </span>
          </h2>
        </div>
        <Sparkles
          className="size-7 shrink-0 text-[var(--vivida-pink)]"
          aria-hidden
        />
      </header>

      {/* Live sky entry — top of the card so "where is everything right
          now?" is the first tap, the between-readings return hook. */}
      <Link
        href="/sky"
        className="group relative mt-5 flex items-center justify-between gap-3 rounded-xl border border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/8 px-4 py-3 transition-colors hover:border-[var(--vivida-cyan)]/60 hover:bg-[var(--vivida-cyan)]/15"
      >
        <span className="flex flex-wrap items-center gap-2.5 text-sm font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--vivida-cyan)] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--vivida-cyan)]" />
          </span>
          ცოცხალი ცა — სად არიან პლანეტები ახლა?
          <span className="rounded-full border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-[var(--vivida-cyan)]">
            ახალი
          </span>
        </span>
        <span
          aria-hidden
          className="text-[var(--vivida-cyan)] transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>

      {canAudio ? (
        <HoroscopeAudioPlayer savedVoice={savedVoice} />
      ) : (
        <div className="relative mt-5">
          <Button asChild variant="outline" size="lg" className="w-full justify-center sm:w-auto">
            <Link href="/subscription">
              <Headphones className="size-4" />
              მოისმინე ჰოროსკოპი
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[var(--vivida-gold)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--vivida-gold)]">
                <Lock className="size-3" />
                Pro
              </span>
            </Link>
          </Button>
        </div>
      )}

      {horoscope.themes.length > 0 && (
        <div className="relative mt-4 flex flex-wrap gap-2">
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

      <p className="relative mt-5 text-base leading-relaxed text-foreground/90">
        {horoscope.summary}
      </p>

      <div className="relative mt-5 space-y-4 text-sm leading-relaxed text-foreground/85">
        {horoscope.body
          .split(/\n{2,}/)
          .filter(Boolean)
          // Library-composed bodies reuse the same texts the transit
          // breakdown below shows verbatim — drop those paragraphs here so
          // nothing reads twice. Surfaces without the breakdown (email,
          // mobile) keep the full body.
          .filter(
            (para) => !transits.some((t) => t.body.trim() === para.trim())
          )
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </div>

      {transits.length > 0 && (
        <section className="relative mt-6 border-t border-border/40 pt-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            დღის ტრანზიტები
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
                      {transitBody?.symbol} {transitBody?.labelKa ?? t.transit}
                      <span aria-hidden>{ASPECT_GLYPH[t.kind] ?? "·"}</span>
                      {natalBody?.symbol} {natalBody?.labelKa ?? t.natal}
                    </span>
                    <span className="text-muted-foreground">
                      {ASPECT_KA[t.kind] ?? t.kind}
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

      <p className="relative mt-6 border-t border-border/40 pt-4 text-xs text-muted-foreground">
        ხვალ ახალი წინასწარმეტყველება გელოდება.
      </p>
    </article>
  );
}
