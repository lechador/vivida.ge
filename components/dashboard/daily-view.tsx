import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ensureChartFor } from "@/actions/chart";
import { ensureDailyFor } from "@/actions/daily";
import { ensureMoonPhase } from "@/actions/moon-phase";
import { Button } from "@/components/ui/button";
import { LockedCard } from "@/components/paywall/locked-card";
import { canUseFeature } from "@/lib/features";
import type { PlanId } from "@/lib/pricing";

import { DailyCard } from "./daily-card";
import { MiniBigThree } from "./mini-big-three";
import { MoonPhaseCard } from "./moon-phase-card";
import { SuggestedPeopleRail } from "./suggested-people-rail";

/**
 * Home / today view rendered on /dashboard. Time-varying content:
 *  - Daily horoscope card (regenerated each calendar day)
 *  - Compact big-three glance with link to the full /report
 */
export async function DailyView({
  userId,
  plan,
}: {
  userId: string;
  plan: PlanId;
}) {
  const chart = await ensureChartFor(userId, plan);
  if (!chart) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
        შენი დღევანდელი ჰოროსკოპის სანახავად, ჯერ შეავსე დაბადების მონაცემები.
      </div>
    );
  }

  const canDaily = canUseFeature("dailyHoroscope", plan);

  let daily = null;
  let timezone: string | null = null;
  if (canDaily) {
    try {
      daily = await ensureDailyFor(userId, plan);
    } catch (err) {
      console.warn("[daily] generation failed:", (err as Error).message);
    }
    if (daily) {
      const [profile] = await db
        .select({ timezone: profiles.timezone })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      timezone = profile?.timezone ?? "UTC";
    }
  }

  // Universal moon phase — same for everyone, cached globally per UTC date.
  // Doesn't gate on plan because the celestial event is universal context;
  // gating it would be like gating "today's date." Errors fail open.
  let moonPhase = null;
  try {
    moonPhase = await ensureMoonPhase();
  } catch (err) {
    console.warn("[moon-phase] generation failed:", (err as Error).message);
  }

  const dailySlot = daily && timezone ? (
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
      {/* Top row: daily horoscope (main) + moon phase (sidebar). The grid
          only kicks in at xl (1280px+) — below that the moon phase stacks
          full-width below the daily card so neither gets cramped. */}
      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="xl:col-span-7">{dailySlot}</div>
        {moonPhase && (
          <div className="xl:col-span-5 xl:sticky xl:top-20">
            <MoonPhaseCard data={moonPhase} />
          </div>
        )}
      </div>

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

      <SuggestedPeopleRail userId={userId} />

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

export function DailySkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-72 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-border/60 bg-card/40"
          />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
    </div>
  );
}
