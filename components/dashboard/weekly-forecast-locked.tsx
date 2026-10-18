"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";

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
        window.location.reload();
        return;
      }
      if (r.status === 402) setShort(true);
    } catch {
      /* ignore */
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <header className="mb-5 flex items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
            {en ? "7-Day Ephemeris Forecast" : "შემდეგი 7 დღის ეფემერიდა"}
          </div>
          <h2 className="mt-1 text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {en ? "Your week in the sky" : "შენი კვირის ცის რუკა"}
          </h2>
        </div>
        <Lock
          className="size-4 shrink-0 text-[var(--vivida-cyan)]"
          aria-hidden
        />
      </header>

      {teaser ? (
        <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/60">
          <DayRow
            key={teaser[0].dateIso}
            day={teaser[0]}
            open={dayOpen}
            onToggle={() => setDayOpen(!dayOpen)}
            locale={locale}
          />
          {teaser.slice(1).length > 0 && (
            <div className="relative divide-y divide-border">
              {teaser.slice(1).map((day) => (
                <div
                  key={day.dateIso}
                  aria-hidden
                  className="select-none blur-[5px]"
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
                <div className="grid size-10 place-items-center rounded-lg border border-border bg-card shadow-lg">
                  <Lock className="size-4 text-primary" />
                </div>
              </div>
            </div>
          )}
        </ol>
      ) : (
        <div className="relative">
          <ol
            aria-hidden
            className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/60 select-none blur-[6px]"
          >
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-4 p-4">
                <div className="flex w-12 flex-col items-center rounded-md border border-border bg-card py-1.5 font-mono">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {
                      (en
                        ? ["Mon", "Tue", "Wed", "Thu"]
                        : ["ორშ", "სამ", "ოთხ", "ხუთ"])[i]
                    }
                  </span>
                  <span className="text-base font-semibold">{12 + i}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-3/4 bg-foreground/15" />
                  <div className="mt-2 h-2 w-1/2 bg-foreground/10" />
                  <div className="mt-2.5 h-1.5 w-full bg-border" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Lock CTA */}
      <div className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-border bg-background/70 px-4 py-6 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">
          {cost} {en ? "credits" : "კრედიტი"} ·{" "}
          <span className="text-muted-foreground">
            {en ? "balance" : "ბალანსი"} {balance}
          </span>
        </div>
        <p className="max-w-md text-sm text-foreground/85">
          {teaser
            ? en
              ? "That was just the first day — unlock the full seven with reasons and guidance for each."
              : "ეს მხოლოდ პირველი დღე იყო — გახსენი სრული შვიდეული მიზეზებითა და რჩევებით ყოველ დღეს."
            : en
              ? "Unlock a detailed seven-day forecast with daily harmony and challenge scores, reasons, and guidance."
              : "გახსენი მომდევნო 7 დღის დეტალური პროგნოზი ჰარმონიისა და დაძაბულობის ქულებით, მიზეზებითა და რჩევებით."}
        </p>

        {!short ? (
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={pending}
            onClick={unlock}
            className="mt-1 gap-1.5"
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
