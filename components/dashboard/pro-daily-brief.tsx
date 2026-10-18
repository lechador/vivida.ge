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

function oneLiner(body: string, limit = 150): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  const cut = flat.lastIndexOf(" ", limit);
  return `${flat.slice(0, cut > 40 ? cut : limit).trim()}…`;
}

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
      className="rounded-md border border-border bg-card p-6 sm:p-7"
    >
      <header className="flex items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <Crown className="size-4.5 text-primary" aria-hidden />
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {en ? "Your PRO Day" : "შენი PRO დღე"}
            </h2>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
              {date}
            </p>
          </div>
        </div>
        <div className="text-right font-mono tabular-nums">
          <div className="text-2xl font-semibold text-primary">
            {score}
            <span className="text-xs font-normal text-muted-foreground">
              /10
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {en ? "Day Index" : "დღის ინდექსი"}
          </div>
        </div>
      </header>

      {/* Day score bar */}
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: mounted ? `${score * 10}%` : "0%" }}
          />
        </div>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-foreground">{band.label}</span>
          <span className="text-muted-foreground"> · {band.hint}</span>
        </p>
      </div>

      {/* Top-3 transits ledger */}
      {top.length > 0 && (
        <div className="mt-5">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Today's Transits" : "დღის ტრანზიტები"}
          </h3>
          <ul className="mt-2.5 divide-y divide-border/70 border border-border bg-secondary/20">
            {top.map((t, i) => {
              const transitBody = BODIES[t.transit];
              const natalBody = BODIES[t.natal];
              const transitName =
                (en ? transitBody?.labelEn : transitBody?.labelKa) ?? t.transit;
              const natalName =
                (en ? natalBody?.labelEn : natalBody?.labelKa) ?? t.natal;
              return (
                <li key={i} className="relative p-4">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
                    <span className="font-medium text-primary">
                      {transitName}
                    </span>
                    <span aria-hidden className="text-muted-foreground">
                      {ASPECT_GLYPH[t.kind] ?? "·"}
                    </span>
                    <span className="font-medium text-foreground">
                      {natalName}
                    </span>
                    <span className="text-muted-foreground">
                      · {(en ? ASPECT_EN : ASPECT_KA)[t.kind] ?? t.kind}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {t.title}
                  </p>
                  {isPremium ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {oneLiner(t.body)}
                    </p>
                  ) : (
                    <p
                      aria-hidden
                      className="mt-1 select-none text-xs leading-relaxed text-muted-foreground blur-[5px]"
                    >
                      {oneLiner(t.body)}
                    </p>
                  )}
                  {!isPremium && (
                    <Lock
                      className="absolute right-4 top-4 size-4 text-primary"
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* PRO-only ritual question */}
      <div className="mt-5 border-t border-border/80 pt-4">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          {en ? "PRO Reflection" : "PRO რეფლექსია"}
        </h3>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
          {question}
        </p>
        {isPremium ? (
          <div className="mt-3">
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
              className="w-full resize-none rounded-md border border-border bg-secondary/30 px-3.5 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/70 focus:outline-none"
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
                    <Check className="size-3.5 text-primary" />
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
          <div className="mt-3">
            <Button asChild variant="default" className="w-full sm:w-auto">
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
