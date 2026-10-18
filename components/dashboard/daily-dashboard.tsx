"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  loadDashboardCore,
  loadDashboardExtras,
  type DashboardCore,
  type DashboardExtras,
} from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { CosmicLoader } from "@/components/dashboard/cosmic-loader";
import { SOCIAL_FEATURES } from "@/lib/social-flags";

import { HoroscopeLoading } from "./horoscope-loading";
import { MiniBigThree } from "./mini-big-three";
import { MoonPhaseCard } from "./moon-phase-card";
import { SuggestedPeopleRail } from "./suggested-people-rail";
import { CREDIT_COST } from "@/lib/credits-config";
import { WeeklyForecastCard } from "./weekly-forecast-card";
import { WeeklyForecastLocked } from "./weekly-forecast-locked";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { PUSH_VALUE_MOMENT_EVENT } from "@/lib/push-prompt";
import { DailyRitual } from "./daily-ritual";
import { ProDailyBrief } from "./pro-daily-brief";

export function DailyDashboard({
  userId,
  locale = "ka",
}: {
  userId: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [core, setCore] = useState<DashboardCore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboardCore(userId)
      .then((c) => {
        if (cancelled) return;
        setCore(c);
        if (c) {
          window.dispatchEvent(new Event(PUSH_VALUE_MOMENT_EVENT));
        }
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {en
            ? "Could not load. Please refresh the page."
            : "ვერ ჩაიტვირთა, გთხოვ, გადატვირთო გვერდი."}
        </div>
      </div>
    );
  }

  if (!core || core.kind === "no-chart") {
    return (
      <div className="space-y-6">
        <div className="flex min-h-[240px] items-center justify-center rounded-md border border-border bg-card">
          <CosmicLoader embedded progressive locale={locale} />
        </div>
      </div>
    );
  }

  const {
    chart,
    canDaily,
    weeklyUnlocked,
    balance,
    isPremium,
    suggestions,
    ritualProgress,
  } = core;

  return (
    <div className="space-y-8">
      {/* Big Three Ephemeris Strip at Top of Observatory */}
      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <div className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <span aria-hidden className="inline-block h-px w-6 bg-primary/70" />
            <span>
              {en ? "Primary Natal Axis (Big Three)" : "შენი დიდი სამეული"}
            </span>
          </div>
          <Link
            href="/report"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {en ? "Full Ephemeris & Chart →" : "სრული ნატალური რუკა →"}
          </Link>
        </header>
        <MiniBigThree chart={chart.data} locale={locale} />
      </section>

      {/* AI cards stream in behind structured hairline skeletons */}
      <DashboardExtrasSection
        userId={userId}
        canDaily={canDaily}
        weeklyUnlocked={weeklyUnlocked}
        balance={balance}
        isPremium={isPremium}
        locale={locale}
        ritualProgress={ritualProgress}
      />

      {/* Complete Natal Chart Callout */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {en ? "Astronomical Natal Chart" : "პერსონალური ეფემერიდა"}
            </div>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {en ? "Your complete natal chart" : "შენი სრული ნატალური რუკა"}
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {en
                ? "Chart wheel, personal analysis, twelve houses, aspects and every planet in one place, with complete English interpretations."
                : "ცის რუკის ბორბალი, ღრმა ანალიზი, 12 სახლი, ასპექტები და ყველა პლანეტის გრადუსული მდებარეობა ერთ სივრცეში."}
            </p>
          </div>
          <Button asChild variant="default" size="lg" className="shrink-0">
            <Link href="/report">
              {en ? "Open natal chart" : "ნახე სრული რუკა"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {SOCIAL_FEATURES.suggestedPeopleRail && (
        <SuggestedPeopleRail suggestions={suggestions} locale={locale} />
      )}
    </div>
  );
}

function DashboardExtrasSection({
  userId,
  canDaily,
  weeklyUnlocked,
  balance,
  isPremium,
  locale,
  ritualProgress,
}: {
  userId: string;
  canDaily: boolean;
  weeklyUnlocked: boolean;
  balance: number;
  isPremium: boolean;
  locale: UserLocale;
  ritualProgress: import("@/lib/streak-credits").StreakProgress;
}) {
  const en = locale !== "ka";
  const [extras, setExtras] = useState<DashboardExtras | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboardExtras(userId, locale)
      .then((e) => {
        if (!cancelled) setExtras(e);
      })
      .catch(() => {
        if (!cancelled) {
          setExtras({
            daily: null,
            transitBreakdown: [],
            moonPhase: null,
            weeklyForecast: null,
            weeklyTeaser: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, locale]);

  const loading = extras === null;

  const dailySlot = loading ? (
    <HoroscopeLoading locale={locale} />
  ) : extras.daily ? null : canDaily ? (
    <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
      {en
        ? "Today's horoscope is being prepared. Try again shortly."
        : "დღევანდელი ჰოროსკოპი მზადდება. სცადე ცოტა ხანში."}
    </div>
  ) : null;

  const moonSlot = loading ? (
    <CardSkeleton className="min-h-[220px]" />
  ) : extras.moonPhase ? (
    <MoonPhaseCard data={extras.moonPhase} locale={locale} />
  ) : null;

  return (
    <>
      {(!loading && extras.daily) || dailySlot || moonSlot ? (
        <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
          {!loading && extras.daily ? (
            <div className="min-w-0 xl:col-span-8">
              <DailyRitual
                userId={userId}
                horoscope={extras.daily}
                transits={extras.transitBreakdown}
                initialProgress={ritualProgress}
                locale={locale}
              />
            </div>
          ) : dailySlot ? (
            <div className="min-w-0 xl:col-span-8">{dailySlot}</div>
          ) : null}
          {moonSlot && (
            <div className="min-w-0 xl:col-span-4 xl:sticky xl:top-28">
              {moonSlot}
            </div>
          )}
        </div>
      ) : null}

      {!loading && extras.daily ? (
        <ProDailyBrief
          userId={userId}
          dateIso={extras.daily.date}
          transits={extras.transitBreakdown}
          isPremium={isPremium}
          locale={locale}
        />
      ) : loading ? (
        <CardSkeleton className="min-h-[180px]" />
      ) : null}

      {!weeklyUnlocked ? (
        <WeeklyForecastLocked
          cost={CREDIT_COST.weeklyForecast}
          balance={balance}
          teaserDays={extras?.weeklyTeaser}
          locale={locale}
        />
      ) : loading ? (
        <CardSkeleton className="min-h-[160px]" />
      ) : (
        extras?.weeklyForecast &&
        extras.weeklyForecast.days.length > 0 && (
          <WeeklyForecastCard
            days={extras.weeklyForecast.days}
            locale={locale}
          />
        )
      )}
    </>
  );
}

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`vivida-pulse-soft rounded-xl border border-border bg-card ${className}`}
      aria-hidden
    />
  );
}
