"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ANALYTICS_EVENT,
  creditBalanceBucket,
  trackEvent,
} from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { WeeklyForecastDay } from "@/db/schema";
import { ContextualPaywallActions } from "@/components/billing/contextual-paywall-actions";
import { DayRow } from "./weekly-forecast-card";

/**
 * Locked state for the 7-day forecast. The forecast is a one-time credit
 * unlock (CREDIT_COST.weeklyForecast) — pay once and it stays unlocked
 * forever.
 *
 * Tease, don't block: with real `teaserDays` the first day renders fully
 * (headline, reasons, advice) and the remaining days show their real
 * weekday/date/score rows blurred behind the lock. Locked narrative never
 * reaches the client — the server strips it (see stripWeeklyTeaser). Without
 * teaser data it falls back to the generic blurred skeleton.
 *
 * A successful unlock does a full reload so the now-unlocked forecast
 * streams in from the server.
 */
export function WeeklyForecastLocked({
  cost,
  balance,
  teaserDays,
  locale = "ka",
}: {
  cost: number;
  balance: number;
  teaserDays?: WeeklyForecastDay[] | null;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [pending, setPending] = useState(false);
  const [short, setShort] = useState(balance < cost);
  const [dayOpen, setDayOpen] = useState(true);
  const teaser = teaserDays && teaserDays.length > 0 ? teaserDays : null;

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.paywallViewed, {
      product: "weekly_forecast",
      surface: "dashboard",
      cost,
      balance_bucket: creditBalanceBucket(balance),
      teaser: teaser ? "real" : "skeleton",
    });
  }, [balance, cost, teaser]);

  useEffect(() => {
    if (!short) return;
    trackEvent(ANALYTICS_EVENT.insufficientCredits, {
      product: "weekly_forecast",
      surface: "dashboard",
      cost,
      balance_bucket: creditBalanceBucket(balance),
    });
  }, [balance, cost, short]);

  async function unlock() {
    trackEvent(ANALYTICS_EVENT.productSelected, {
      product: "weekly_forecast",
      surface: "dashboard",
      payment_model: "credits",
      cost,
    });
    setPending(true);
    try {
      const r = await fetch("/api/credits/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "weekly" }),
      });
      if (r.ok) {
        const data = (await r.json().catch(() => ({}))) as {
          status?: string;
        };
        if (data.status === "unlocked") {
          trackEvent(ANALYTICS_EVENT.creditUnlock, {
            product: "weekly_forecast",
            surface: "dashboard",
            cost,
            outcome: "unlocked",
          });
        }
        // Reload so the dashboard re-fetches with the forecast unlocked.
        window.location.reload();
        return;
      }
      if (r.status === 402) setShort(true);
    } catch {
      /* ignore — button re-enables */
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/35 bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <div
        aria-hidden
        className="absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-cyan)/0.3_0%,transparent_70%)] opacity-60 blur-3xl"
      />

      <header className="relative mb-5 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Next 7 days" : "შემდეგი 7 დღე"}
          </div>
          <h2 className="mt-1 text-balance text-lg font-semibold tracking-tight sm:text-xl">
            {en ? "Your week in the sky" : "შენი კვირის ცის რუკა"}
          </h2>
        </div>
        <Sparkles
          className="size-5 shrink-0 text-[var(--vivida-cyan)]"
          aria-hidden
        />
      </header>

      {teaser ? (
        <ol className="relative space-y-3.5">
          <DayRow
            key={teaser[0].dateIso}
            day={teaser[0]}
            open={dayOpen}
            onToggle={() => setDayOpen(!dayOpen)}
            locale={locale}
          />
          {teaser.slice(1).length > 0 && (
            <div className="relative">
              {teaser.slice(1).map((day) => (
                <div
                  key={day.dateIso}
                  aria-hidden
                  className="select-none blur-[5px] [&:not(:first-child)]:mt-3.5"
                >
                  <DayRow
                    day={day}
                    open={false}
                    onToggle={() => {}}
                    locale={locale}
                    locked
                  />
                </div>
              ))}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className="grid size-12 place-items-center rounded-full border border-[var(--vivida-violet)]/50 bg-card/90 shadow-xl ring-1 ring-foreground/10">
                  <Lock className="size-5 text-[var(--vivida-violet)]" />
                </div>
              </div>
            </div>
          )}
        </ol>
      ) : (
        <div className="relative">
          <ol aria-hidden className="space-y-3.5 select-none blur-[6px]">
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border-2 border-border/50 bg-[oklch(0.23_0.04_285/0.7)] p-3 pl-5 sm:p-4"
              >
                <div className="flex flex-col items-center rounded-lg border border-border bg-[oklch(0.27_0.05_285/0.7)] px-3 py-2">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {
                      (en
                        ? ["Mon", "Tue", "Wed", "Thu"]
                        : ["ორშ", "სამ", "ოთხ", "ხუთ"])[i]
                    }
                  </span>
                  <span className="text-lg font-semibold">{12 + i}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-3/4 rounded bg-foreground/15" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-foreground/10" />
                  <div className="mt-2.5 h-2 w-full rounded-full bg-foreground/[0.08]" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Lock CTA — in flow below the teaser, not an overlay. */}
      <div className="relative mt-5 flex flex-col items-center gap-3 rounded-xl border border-[var(--vivida-violet)]/25 bg-background/30 px-4 py-5 text-center">
        <div className="grid size-11 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
          <Lock className="size-5 text-[var(--vivida-violet)]" />
        </div>
        <p className="max-w-xs text-sm text-foreground/85">
          {teaser
            ? en
              ? "That was just the first day — unlock the full seven with reasons and guidance for each."
              : "ეს მხოლოდ პირველი დღე იყო — გახსენი სრული შვიდეული: მიზეზები და რჩევები ყოველ დღეს."
            : en
              ? "Unlock a detailed seven-day forecast with daily harmony and challenge scores, reasons, and guidance."
              : "გახსენი მომდევნო 7 დღის დეტალური პროგნოზი — ჰარმონიისა და დაძაბულობის ქულები ყოველ დღეს, მიზეზებით და რჩევებით."}
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-sm">
          <Sparkles className="size-4 text-[var(--vivida-cyan)]" />
          <span className="font-semibold">
            {cost} {en ? "credits" : "კრედიტი"}
          </span>
          <span className="text-muted-foreground">
            · {en ? "one time · balance" : "ერთჯერადად · ბალანსი"} {balance}
          </span>
        </div>

        {!short ? (
          <Button
            type="button"
            variant="mystic"
            size="lg"
            disabled={pending}
            onClick={unlock}
            className="gap-1.5"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}
            {en ? `Unlock for ${cost} credits` : `გახსნა ${cost} კრედიტით`}
          </Button>
        ) : (
          <ContextualPaywallActions
            locale={locale}
            balance={balance}
            cost={cost}
            product="weekly_forecast"
            returnTo="/dashboard"
            placement="weekly_forecast_shortfall"
          />
        )}
      </div>
    </article>
  );
}
