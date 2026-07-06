"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ensureChartFor } from "@/actions/chart";
import { ensureDailyFor } from "@/actions/daily";
import { ensureMoonPhase, type MoonPhaseRow } from "@/actions/moon-phase";
import { ensureWeeklyForecast } from "@/actions/weekly-forecast";
import { canUseFeature } from "@/lib/features";
import { getDashboardSuggestions } from "@/lib/suggestions";
import {
  overlayTransitAspects,
  type TransitBreakdownItem,
} from "@/lib/transit-library";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import type { PlanId } from "@/lib/pricing";
import type {
  Chart,
  DailyHoroscope,
  WeeklyForecast,
} from "@/db/schema";
import type { DiscoverCard } from "@/lib/discover";

/**
 * The dashboard loads in two waves so the page never blocks on AI latency:
 *
 *   1. `loadDashboardCore` — chart positions + suggestions. All local
 *      compute + DB reads, no AI, so it returns in ~1s. The chart's AI
 *      narrative is upgraded in the background (aiUpgrade: "defer").
 *   2. `loadDashboardExtras` — the AI-generated daily horoscope, weekly
 *      forecast, and moon reading, fetched in parallel and streamed into
 *      their own cards behind skeletons.
 *
 * This is what makes the post-signup experience feel instant: previously a
 * single bundle awaited the cold ~30s chart interpretation before anything
 * rendered.
 */

export type DashboardCore =
  | { kind: "no-chart" }
  | {
      kind: "ok";
      chart: Chart;
      timezone: string;
      canDaily: boolean;
      canWeekly: boolean;
      suggestions: DiscoverCard[];
    };

export async function loadDashboardCore(
  userId: string,
  plan: PlanId
): Promise<DashboardCore> {
  // Fast path: returns the static chart immediately, AI narrative lands in
  // the background. Positions + big-three render with zero AI latency.
  const chart = await ensureChartFor(userId, plan, { aiUpgrade: "defer" });
  if (!chart) return { kind: "no-chart" };

  // Skip the "suggested people" query entirely when the rail is flagged off
  // — no point ranking strangers we won't show. Render is also guarded.
  const [profileRow, suggestions] = await Promise.all([
    db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1),
    SOCIAL_FEATURES.suggestedPeopleRail
      ? getDashboardSuggestions(userId, 20).catch(() => [] as DiscoverCard[])
      : Promise.resolve([] as DiscoverCard[]),
  ]);

  return {
    kind: "ok",
    chart,
    timezone: profileRow[0]?.timezone ?? "UTC",
    canDaily: canUseFeature("dailyHoroscope", plan),
    canWeekly: canUseFeature("weeklyForecast", plan),
    suggestions,
  };
}

export type DashboardExtras = {
  daily: DailyHoroscope | null;
  /** Today's strongest transit aspects with their library interpretations —
   *  the "დღის ტრანზიტები" breakdown under the daily reading. */
  transitBreakdown: TransitBreakdownItem[];
  moonPhase: MoonPhaseRow | null;
  weeklyForecast: WeeklyForecast | null;
};

/**
 * The AI-heavy cards, fetched in parallel. Each failure degrades to null so
 * one slow/failed generator never blocks the others. Called after the core
 * has already painted, so its latency is hidden behind per-card skeletons.
 */
export async function loadDashboardExtras(
  userId: string,
  plan: PlanId
): Promise<DashboardExtras> {
  const canDaily = canUseFeature("dailyHoroscope", plan);
  const canWeekly = canUseFeature("weeklyForecast", plan);

  const [daily, moonPhase, weeklyForecast] = await Promise.all([
    canDaily
      ? ensureDailyFor(userId, plan).catch((err) => {
          console.warn("[dashboard:daily]", (err as Error).message);
          return null;
        })
      : Promise.resolve(null),
    ensureMoonPhase().catch((err) => {
      console.warn("[dashboard:moon]", (err as Error).message);
      return null;
    }),
    canWeekly
      ? ensureWeeklyForecast(userId, plan).catch((err) => {
          console.warn("[dashboard:weekly]", (err as Error).message);
          return null;
        })
      : Promise.resolve(null),
  ]);

  // Overlay the stored top aspects with library interpretations. Works for
  // any cached daily (old AI ones too) since topAspects has always been
  // persisted; aspects without a library row yet are simply skipped.
  const transitBreakdown = daily?.transits?.topAspects?.length
    ? await overlayTransitAspects(daily.transits.topAspects).catch(
        () => [] as TransitBreakdownItem[]
      )
    : [];

  return { daily, transitBreakdown, moonPhase, weeklyForecast };
}
