"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Crown, Lock } from "lucide-react";

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
import type { UserLocale } from "@/lib/i18n/user-locale";

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
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

  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readProRitualAnswer(userId, dateIso);
      setAnswer(stored);
      setSaved(stored.trim().length > 0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId, dateIso]);

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
        className="absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(circle,var(--vivida-gold)_0%,transparent_70%)] opacity-20 blur-3xl"
      />
      <header className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Crown className="size-5 text-[var(--vivida-gold)]" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
            {en ? "Your PRO day" : "შენი PRO დღე"}
          </h2>
        </div>
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {score}
          <span className="text-sm font-normal text-muted-foreground">/10</span>
        </span>
      </header>

      {/* Day score — visible to everyone, the tease for non-PRO. */}
      <div className="relative mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-gold),var(--vivida-pink),var(--vivida-cyan))]"
            style={{ width: `${score * 10}%` }}
          />
        </div>
        <p className="mt-2 text-sm">
          <span className="font-semibold">{band.label}</span>
          <span className="text-muted-foreground"> · {band.hint}</span>
        </p>
      </div>

      {/* Top-3 transits, one line each. */}
      {top.length > 0 && (
        <ul className="relative mt-4 space-y-2">
          {top.map((t, i) => {
            const transitBody = BODIES[t.transit];
            const natalBody = BODIES[t.natal];
            const pair =
              `${transitBody?.symbol ?? ""}${ASPECT_GLYPH[t.kind] ?? "·"}${natalBody?.symbol ?? ""}`.trim();
            return (
              <li
                key={i}
                className="relative rounded-xl border border-border/50 bg-background/30 px-3.5 py-2.5"
              >
                <p className="text-sm">
                  <span
                    className="mr-2 tabular-nums text-muted-foreground"
                    aria-hidden
                  >
                    {pair}
                  </span>
                  <span className="font-medium text-foreground/95">
                    {t.title}
                  </span>
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
      )}

      {/* PRO-only ritual question. */}
      <div className="relative mt-4 border-t border-[var(--vivida-gold)]/25 pt-4">
        <p className="text-sm font-medium text-foreground/90">{question}</p>
        {isPremium ? (
          <div className="mt-2">
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
          <div className="mt-2">
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
