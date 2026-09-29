"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Crown, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dayScoreBand, proDayScore } from "@/lib/pro-day-score";
import {
  proRitualQuestion,
  readProRitualAnswer,
  saveProRitualAnswer,
} from "@/lib/pro-ritual-questions";
import type { TransitBreakdownItem } from "@/lib/transit-library";
import { BODIES } from "@/lib/zodiac";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { kaLongDate } from "@/lib/i18n/ka-date";
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

/** Harmonic aspects get the cyan accent, tense ones pink, neutral violet. */
const ASPECT_TONE: Record<string, string> = {
  conjunction: "var(--vivida-violet)",
  sextile: "var(--vivida-cyan)",
  trine: "var(--vivida-cyan)",
  square: "var(--vivida-pink)",
  opposition: "var(--vivida-pink)",
};

/** One-line teaser of a transit interpretation, cut at a word boundary. */
function oneLiner(body: string, limit = 150): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  const cut = flat.lastIndexOf(" ", limit);
  return `${flat.slice(0, cut > 40 ? cut : limit).trim()}…`;
}

/**
 * The PRO daily layer — the first card on the dashboard. Everything is
 * composed from data the dashboard already loads (today's overlaid
 * transits) plus static copy: zero AI calls, zero extra queries.
 *
 * Planet names render as text chips, never glyphs: several astrological
 * codepoints fall back to tofu boxes on real devices, which kills the
 * premium feel instantly.
 *
 * Non-PRO users see the same day score (the tease) with the transit
 * one-liners and the ritual question locked behind a PRO CTA.
 */
export function ProDailyBrief({
  userId,
  dateIso,
  transits = [],
  isPremium,
  locale = "ka",
}: {
  userId: string;
  dateIso: string;
  transits?: TransitBreakdownItem[];
  isPremium: boolean;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const { score } = proDayScore(transits.map((t) => t.kind));
  const band = dayScoreBand(score, locale);
  const question = proRitualQuestion(dateIso, locale);
  const top = transits.slice(0, 3);
  const date = en
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(`${dateIso}T00:00:00Z`))
    : kaLongDate(dateIso);

  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readProRitualAnswer(userId, dateIso);
      setAnswer(stored);
      setSaved(stored.trim().length > 0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId, dateIso]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.proBriefViewed, {
      premium: isPremium ? 1 : 0,
      score,
    });
  }, [isPremium, score]);

  function saveAnswer() {
    saveProRitualAnswer(userId, dateIso, answer);
    const done = answer.trim().length > 0;
    setSaved(done);
    if (done) {
      trackEvent(ANALYTICS_EVENT.proBriefAnswered, { score });
    }
  }

  return (
    <section
      aria-label={en ? "Your PRO day" : "შენი PRO დღე"}
      className="relative overflow-hidden rounded-2xl border border-[var(--vivida-gold)]/40 bg-gradient-to-br from-[var(--vivida-gold)]/12 via-card/60 to-transparent p-6 backdrop-blur-xl sm:p-7"
    >
      <div
        aria-hidden
        className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--vivida-gold)]/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(circle,var(--vivida-gold)_0%,transparent_70%)] opacity-20 blur-3xl"
      />
      <header className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Crown className="size-5 text-[var(--vivida-gold)]" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
              {en ? "Your PRO day" : "შენი PRO დღე"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <ScoreRing score={score} />
      </header>

      {/* Day score — visible to everyone, the tease for non-PRO. */}
      <div className="relative mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-gold),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-1000 ease-out"
            style={{ width: mounted ? `${score * 10}%` : "0%" }}
          />
        </div>
        <p className="mt-2 text-sm">
          <span className="font-semibold">{band.label}</span>
          <span className="text-muted-foreground"> · {band.hint}</span>
        </p>
      </div>

      {/* Top-3 transits, one line each. */}
      {top.length > 0 && (
        <div className="relative mt-5">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Today's transits" : "დღის ტრანზიტები"}
          </h3>
          <ul className="mt-2.5 space-y-2">
            {top.map((t, i) => {
              const tone = ASPECT_TONE[t.kind] ?? "var(--vivida-violet)";
              const transitBody = BODIES[t.transit];
              const natalBody = BODIES[t.natal];
              const transitName =
                (en ? transitBody?.labelEn : transitBody?.labelKa) ?? t.transit;
              const natalName =
                (en ? natalBody?.labelEn : natalBody?.labelKa) ?? t.natal;
              return (
                <li
                  key={i}
                  className="relative overflow-hidden rounded-xl border border-border/50 bg-background/30 py-2.5 pl-4 pr-3.5"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: tone }}
                  />
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
                    <span
                      className="rounded-full border px-2 py-0.5 font-medium"
                      style={{
                        color: tone,
                        borderColor: `color-mix(in oklch, ${tone} 40%, transparent)`,
                        backgroundColor: `color-mix(in oklch, ${tone} 10%, transparent)`,
                      }}
                    >
                      {transitName}
                    </span>
                    <span aria-hidden style={{ color: tone }}>
                      {ASPECT_GLYPH[t.kind] ?? "·"}
                    </span>
                    <span
                      className="rounded-full border px-2 py-0.5 font-medium"
                      style={{
                        color: tone,
                        borderColor: `color-mix(in oklch, ${tone} 40%, transparent)`,
                        backgroundColor: `color-mix(in oklch, ${tone} 10%, transparent)`,
                      }}
                    >
                      {natalName}
                    </span>
                    <span className="text-muted-foreground">
                      · {(en ? ASPECT_EN : ASPECT_KA)[t.kind] ?? t.kind}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground/95">
                    {t.title}
                  </p>
                  {isPremium ? (
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-foreground/75">
                      {oneLiner(t.body)}
                    </p>
                  ) : (
                    <p
                      aria-hidden
                      className="mt-0.5 select-none text-[13px] leading-relaxed text-foreground/75 blur-[5px]"
                    >
                      {oneLiner(t.body)}
                    </p>
                  )}
                  {!isPremium && (
                    <Lock
                      className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--vivida-gold)]"
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* PRO-only ritual question. */}
      <div className="relative mt-5 border-t border-[var(--vivida-gold)]/25 pt-4">
        <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles
            className="size-3.5 text-[var(--vivida-gold)]"
            aria-hidden
          />
          {en ? "PRO ritual" : "PRO რიტუალი"}
        </h3>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-foreground/90">
          {question}
        </p>
        {isPremium ? (
          <div className="mt-2.5">
            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setSaved(false);
              }}
              rows={2}
              maxLength={2000}
              placeholder={
                en ? "A sentence is enough…" : "ერთი წინადადებაც საკმარისია…"
              }
              className="w-full resize-none rounded-xl border border-border/60 bg-background/40 px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:border-[var(--vivida-gold)]/60 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">
                {en
                  ? "Your answer stays in this browser."
                  : "პასუხი მხოლოდ ამ ბრაუზერში ინახება."}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={saveAnswer}
                className="shrink-0"
              >
                {saved ? (
                  <>
                    <Check className="size-3.5 text-[var(--vivida-cyan)]" />
                    {en ? "Saved" : "შენახულია"}
                  </>
                ) : en ? (
                  "Save"
                ) : (
                  "შენახვა"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2.5">
            <Button asChild variant="mystic" className="w-full sm:w-auto">
              <Link
                href="/subscription?next=%2Fdashboard"
                onClick={() =>
                  trackEvent(ANALYTICS_EVENT.recommendationClicked, {
                    placement: "pro_brief_teaser",
                    destination: "subscription",
                    product: "premium",
                  })
                }
              >
                <Lock className="size-4" />
                {en ? "Unlock with PRO" : "განბლოკე PRO-ით"}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Gradient score ring — the card's visual anchor. Animates in on mount. */
function ScoreRing({ score }: { score: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setOn(true), 60);
    return () => window.clearTimeout(timer);
  }, []);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative size-16 shrink-0"
      role="img"
      aria-label={`${score}/10`}
    >
      <svg viewBox="0 0 64 64" className="size-full -rotate-90">
        <defs>
          <linearGradient id="pro-day-score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--vivida-gold)" />
            <stop offset="55%" stopColor="var(--vivida-pink)" />
            <stop offset="100%" stopColor="var(--vivida-cyan)" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          className="stroke-foreground/10"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="url(#pro-day-score-ring)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={on ? c * (1 - score / 10) : c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-xl font-semibold tabular-nums tracking-tight">
          {score}
          <span className="text-[11px] font-normal text-muted-foreground">
            /10
          </span>
        </span>
      </div>
    </div>
  );
}
