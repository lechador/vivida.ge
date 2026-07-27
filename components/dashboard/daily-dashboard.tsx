"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { canUseFeature } from "@/lib/features";
import type { PlanId } from "@/lib/pricing";

import { DailyCard } from "./daily-card";
import { HoroscopeLoading } from "./horoscope-loading";
import { MiniBigThree } from "./mini-big-three";
import { MoonPhaseCard } from "./moon-phase-card";
import { SuggestedPeopleRail } from "./suggested-people-rail";
import { CREDIT_COST } from "@/lib/credits-config";
import { WeeklyForecastCard } from "./weekly-forecast-card";
import { WeeklyForecastLocked } from "./weekly-forecast-locked";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Dashboard content loaded after first paint via server actions. The page
 * shell ships immediately; this loads in two waves so the user never waits
 * on AI latency:
 *   - core (chart positions + suggestions) renders as soon as it's ready
 *   - the AI cards (daily / weekly / moon) stream in behind skeletons
 */
export function DailyDashboard({
  userId,
  plan,
  savedVoice,
  locale = "ka",
}: {
  userId: string;
  plan: PlanId;
  savedVoice?: string | null;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const router = useRouter();
  const [core, setCore] = useState<DashboardCore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboardCore(userId, plan)
      .then((c) => {
        if (!cancelled) setCore(c);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, plan]);

  useEffect(() => {
    if (core?.kind === "no-chart") {
      router.replace("/onboarding");
    }
  }, [core, router]);

  if (error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
        {en ? "Could not load. Please refresh the page." : "ვერ ჩაიტვირთა — გთხოვ, გადატვირთო გვერდი."}
      </div>
    );
  }

  if (!core || core.kind === "no-chart") {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <CosmicLoader embedded progressive />
      </div>
    );
  }

  const { chart, timezone, canDaily, weeklyUnlocked, balance, suggestions } =
    core;

  return (
    <div className="space-y-8">
      {/* Suggested people — a "find strangers to add" surface, flag-gated
          off at low user density. When off, the dashboard focuses on the
          user's own chart/transits/reading. `suggestions` is empty in that
          case (the server skips the query), but we also guard the render so
          flipping the flag is the single switch. */}
      {SOCIAL_FEATURES.suggestedPeopleRail && (
        <SuggestedPeopleRail suggestions={suggestions} locale={locale} />
      )}

      {/* AI cards stream in here behind skeletons so the page never blocks
          on generation latency. */}
      <DashboardExtrasSection
        userId={userId}
        plan={plan}
        timezone={timezone}
        canDaily={canDaily}
        canAudio={canUseFeature("audioHoroscope", plan)}
        weeklyUnlocked={weeklyUnlocked}
        balance={balance}
        savedVoice={savedVoice}
        locale={locale}
      />

      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Your big three" : "შენი დიდი სამეული"}
          </h2>
          <Link
            href="/report"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {en ? "Full chart →" : "სრული რუკა →"}
          </Link>
        </header>
        <MiniBigThree chart={chart.data} />
      </section>

      <section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 to-transparent p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {en ? "Your complete natal chart" : "შენი სრული ნატალური რუკა"}
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {en
                ? "Chart wheel, AI analysis, twelve houses, aspects and every planet in one place. Detailed interpretations remain in Georgian."
                : "ცის რუკის ბორბალი, AI ანალიზი, 12 სახლი, ასპექტები და ყველა პლანეტა — დეტალურად, ერთად."}
            </p>
          </div>
          <Button asChild variant="mystic" size="lg" className="shrink-0">
            <Link href="/report">
              {en ? "View chart" : "ნახე რუკა"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

/**
 * Loads + renders the AI-generated cards (daily, moon, weekly) as a second
 * wave. Shows skeletons in the meantime so the layout is stable and the
 * page feels finished while generation runs in the background.
 */
function DashboardExtrasSection({
  userId,
  plan,
  timezone,
  canDaily,
  weeklyUnlocked,
  balance,
  savedVoice,
  canAudio,
  locale,
}: {
  userId: string;
  plan: PlanId;
  timezone: string;
  canDaily: boolean;
  weeklyUnlocked: boolean;
  balance: number;
  canAudio: boolean;
  savedVoice?: string | null;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const [extras, setExtras] = useState<DashboardExtras | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboardExtras(userId, plan)
      .then((e) => {
        if (!cancelled) setExtras(e);
      })
      .catch(() => {
        // Degrade silently — the rest of the dashboard is already useful.
        if (!cancelled) {
          setExtras({
            daily: null,
            transitBreakdown: [],
            moonPhase: null,
            weeklyForecast: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, plan]);

  const loading = extras === null;

  const dailySlot = loading ? (
    <HoroscopeLoading />
  ) : extras.daily ? (
    <DailyCard
      horoscope={extras.daily}
      transits={extras.transitBreakdown}
      timezone={timezone}
      savedVoice={savedVoice}
      canAudio={canAudio}
    />
  ) : canDaily ? (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
      {en ? "Today's horoscope is being prepared. Try again shortly." : "დღევანდელი ჰოროსკოპი მზადდება. სცადე ცოტა ხანში."}
    </div>
  ) : null;

  const moonSlot = loading ? (
    <CardSkeleton className="min-h-[220px]" />
  ) : extras.moonPhase ? (
    <MoonPhaseCard data={extras.moonPhase} />
  ) : null;

  return (
    <>
      {(dailySlot || moonSlot) && (
        <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
          {dailySlot && (
            <div className="min-w-0 xl:col-span-7">{dailySlot}</div>
          )}
          {moonSlot && (
            <div className="min-w-0 xl:col-span-5 xl:sticky xl:top-20">
              {moonSlot}
            </div>
          )}
        </div>
      )}

      {!weeklyUnlocked ? (
        <WeeklyForecastLocked
          cost={CREDIT_COST.weeklyForecast}
          balance={balance}
        />
      ) : loading ? (
        <CardSkeleton className="min-h-[160px]" />
      ) : (
        extras?.weeklyForecast &&
        extras.weeklyForecast.days.length > 0 && (
          <WeeklyForecastCard days={extras.weeklyForecast.days} />
        )
      )}
    </>
  );
}

/** Generic shimmering card placeholder matching the dashboard card chrome. */
function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`vivida-pulse-soft rounded-2xl border border-border/60 bg-card/40 ${className}`}
      aria-hidden
    />
  );
}
