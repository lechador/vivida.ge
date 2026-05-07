"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { loadDashboardBundle, type DashboardBundle } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { LockedCard } from "@/components/paywall/locked-card";
import { CosmicLoader } from "@/components/dashboard/cosmic-loader";
import type { PlanId } from "@/lib/pricing";

import { DailyCard } from "./daily-card";
import { MiniBigThree } from "./mini-big-three";
import { MoonPhaseCard } from "./moon-phase-card";
import { SuggestedPeopleRail } from "./suggested-people-rail";
import { WeeklyForecastCard } from "./weekly-forecast-card";

/**
 * Dashboard content loaded after first paint via a server action. The page
 * shell ships immediately so the browser tab spinner stops while our
 * internal CosmicLoader covers the AI generation latency.
 */
export function DailyDashboard({
  userId,
  plan,
}: {
  userId: string;
  plan: PlanId;
}) {
  const router = useRouter();
  const [bundle, setBundle] = useState<DashboardBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboardBundle(userId, plan)
      .then((b) => {
        if (!cancelled) setBundle(b);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, plan]);

  useEffect(() => {
    if (bundle?.kind === "no-chart") {
      router.replace("/onboarding");
    }
  }, [bundle, router]);

  if (error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
        ვერ ჩაიტვირთა — გთხოვ, გადატვირთო გვერდი.
      </div>
    );
  }

  if (!bundle || bundle.kind === "no-chart") {
    return <CosmicLoader embedded progressive />;
  }

  const {
    chart,
    daily,
    moonPhase,
    weeklyForecast,
    timezone,
    canDaily,
    canWeekly,
    suggestions,
  } = bundle;

  const dailySlot = daily ? (
    <DailyCard horoscope={daily} timezone={timezone} />
  ) : !canDaily ? (
    <LockedCard
      title="ყოველდღიური ჰოროსკოპი"
      preview="დღეს შენთვის: მთვარე შენს მე-7 სახლში შედის, მარსი კი შენს პლანეტას ქალწულში ეხება. დღე იდეალურია სამომავლო გეგმებისთვის და მნიშვნელოვანი საუბრებისთვის საყვარელ ადამიანებთან…"
      description="ყოველდღე ახალი პროგნოზი, შენი პირადი კოსმიური რუკის მიხედვით."
    />
  ) : (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
      დღევანდელი ჰოროსკოპი მზადდება. სცადე ცოტა ხანში.
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Suggested people sit at the very top — finding new people is the
          stickiest part of the app, surface it before anything else. */}
      <SuggestedPeopleRail suggestions={suggestions} />

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="xl:col-span-7">{dailySlot}</div>
        {moonPhase && (
          <div className="xl:col-span-5 xl:sticky xl:top-20">
            <MoonPhaseCard data={moonPhase} />
          </div>
        )}
      </div>

      {weeklyForecast && weeklyForecast.days.length > 0 ? (
        <WeeklyForecastCard days={weeklyForecast.days} />
      ) : !canWeekly ? (
        <LockedCard
          title="კვირეული ფორექასტი"
          preview="ორშაბათი — ენერგია ცვლილებისთვის. სამშაბათი — სიფრთხილე საუბარში. ოთხშაბათი — შემოქმედებითი ნახტომი ელის. ხუთშაბათი — ფული და გადაწყვეტილებები. პარასკევი — ემოციური სიღრმე…"
          description="7 დღის პერსონალური პროგნოზი — ყოველ კვირას ახლდება შენი რუკის მიხედვით."
        />
      ) : null}

      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            შენი დიდი სამეული
          </h2>
          <Link
            href="/report"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            სრული რუკა →
          </Link>
        </header>
        <MiniBigThree chart={chart.data} />
      </section>

      <section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 to-transparent p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              შენი სრული ნატალური რუკა
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              ცის რუკის ბორბალი, AI ანალიზი, 12 სახლი, ასპექტები და ყველა
              პლანეტა — დეტალურად, ერთად.
            </p>
          </div>
          <Button asChild variant="mystic" size="lg" className="shrink-0">
            <Link href="/report">
              ნახე რუკა
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
