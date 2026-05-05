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
import type { PlanId } from "@/lib/pricing";
import type {
  Chart,
  DailyHoroscope,
  WeeklyForecast,
} from "@/db/schema";
import type { DiscoverCard } from "@/lib/discover";

export type DashboardBundle =
  | { kind: "no-chart" }
  | {
      kind: "ok";
      chart: Chart;
      daily: DailyHoroscope | null;
      moonPhase: MoonPhaseRow | null;
      weeklyForecast: WeeklyForecast | null;
      timezone: string;
      canDaily: boolean;
      suggestions: DiscoverCard[];
    };

/**
 * Loads everything the /dashboard page renders, in parallel. Called from a
 * client wrapper after first paint so the response stream can close
 * immediately and the browser tab spinner stops while our internal loader
 * shows during the AI work.
 *
 * `ensureChartFor` runs first (and is idempotent + cached) — the daily/weekly
 * generators read the chart internally on cache miss, and serialising the
 * chart fetch avoids three parallel writes racing on the chart row.
 */
export async function loadDashboardBundle(
  userId: string,
  plan: PlanId
): Promise<DashboardBundle> {
  const chart = await ensureChartFor(userId, plan);
  if (!chart) return { kind: "no-chart" };

  const canDaily = canUseFeature("dailyHoroscope", plan);

  const [daily, moonPhase, weeklyForecast, profileRow, suggestions] =
    await Promise.all([
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
      ensureWeeklyForecast(userId, plan).catch((err) => {
        console.warn("[dashboard:weekly]", (err as Error).message);
        return null;
      }),
      canDaily
        ? db
            .select({ timezone: profiles.timezone })
            .from(profiles)
            .where(eq(profiles.userId, userId))
            .limit(1)
        : Promise.resolve([] as { timezone: string | null }[]),
      getDashboardSuggestions(userId, 8).catch(() => [] as DiscoverCard[]),
    ]);

  return {
    kind: "ok",
    chart,
    daily,
    moonPhase,
    weeklyForecast,
    timezone: profileRow[0]?.timezone ?? "UTC",
    canDaily,
    suggestions,
  };
}
