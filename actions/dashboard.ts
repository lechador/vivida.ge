"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ensureChartFor } from "@/actions/chart";
import { ensureDailyFor } from "@/actions/daily";
import { ensureMoonPhase, type MoonPhaseRow } from "@/actions/moon-phase";
import { ensureWeeklyForecast } from "@/actions/weekly-forecast";
import { getBalance, isUnlocked } from "@/lib/credits";
import { isPremiumUser } from "@/lib/premium";
import { getDashboardSuggestions } from "@/lib/suggestions";
import {
  overlayTransitAspects,
  type TransitBreakdownItem,
} from "@/lib/transit-library";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import type {
  Chart,
  DailyHoroscope,
  WeeklyForecast,
  WeeklyForecastDay,
} from "@/db/schema";
import type { DiscoverCard } from "@/lib/discover";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { getDailyRitualProgress } from "@/lib/daily-ritual-core";
import { stripWeeklyTeaser } from "@/lib/weekly-teaser";
import type { StreakProgress } from "@/lib/streak-credits";

/**
 * The dashboard loads in two waves so the page never blocks on AI latency:
 *
 *   1. `loadDashboardCore`, chart positions + suggestions. All local
 *      compute + DB reads, no AI, so it returns in ~1s. The chart's AI
 *      narrative is upgraded in the background (aiUpgrade: "defer").
 *   2. `loadDashboardExtras`, the AI-generated daily horoscope, weekly
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
      /** The 7-day forecast is a one-time credit unlock. */
      weeklyUnlocked: boolean;
      /** Credit balance, used by the locked-forecast unlock CTA. */
      balance: number;
      /** PRO entitlement, gates the PRO daily brief layer. */
      isPremium: boolean;
      ritualProgress: StreakProgress;
      suggestions: DiscoverCard[];
    };

export async function loadDashboardCore(
  userId: string,
): Promise<DashboardCore> {
  // Fast path: returns the static chart immediately, AI narrative lands in
  // the background. Positions + big-three render with zero AI latency.
  const chart = await ensureChartFor(userId, { aiUpgrade: "defer" });
  if (!chart) return { kind: "no-chart" };

  // Skip the "suggested people" query entirely when the rail is flagged off,
  // no point ranking strangers we won't show. Render is also guarded.
  const [
    profileRow,
    suggestions,
    weeklyUnlocked,
    balance,
    ritualProgress,
    isPremium,
  ] = await Promise.all([
    db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1),
    SOCIAL_FEATURES.suggestedPeopleRail
      ? getDashboardSuggestions(userId, 20).catch(() => [] as DiscoverCard[])
      : Promise.resolve([] as DiscoverCard[]),
    isUnlocked(userId, "weekly", "spend_weekly"),
    getBalance(userId),
    getDailyRitualProgress(userId),
    isPremiumUser(userId),
  ]);

  return {
    kind: "ok",
    chart,
    timezone: profileRow[0]?.timezone ?? "UTC",
    canDaily: true,
    weeklyUnlocked,
    balance,
    isPremium,
    ritualProgress,
    suggestions,
  };
}

export type DashboardExtras = {
  daily: DailyHoroscope | null;
  /** Today's strongest transit aspects with their library interpretations,
   *  the "დღის ტრანზიტები" breakdown under the daily reading. */
  transitBreakdown: TransitBreakdownItem[];
  moonPhase: MoonPhaseRow | null;
  weeklyForecast: WeeklyForecast | null;
  /**
   * Locked-week teaser: real days with scores + dates, but the narrative
   * (headline, reasons, advice, drivers) stripped for every day after the
   * first. The locked card shows day 1 fully and blurs the rest.
   */
  weeklyTeaser: WeeklyForecastDay[] | null;
};

/**
 * The AI-heavy cards, fetched in parallel. Each failure degrades to null so
 * one slow/failed generator never blocks the others. Called after the core
 * has already painted, so its latency is hidden behind per-card skeletons.
 */
export async function loadDashboardExtras(
  userId: string,
  locale: UserLocale = "ka",
): Promise<DashboardExtras> {
  const canWeekly = await isUnlocked(userId, "weekly", "spend_weekly");

  const [daily, moonPhase, weeklyForecast] = await Promise.all([
    ensureDailyFor(userId, locale).catch((err) => {
      console.warn("[dashboard:daily]", (err as Error).message);
      return null;
    }),
    ensureMoonPhase(locale).catch((err) => {
      console.warn("[dashboard:moon]", (err as Error).message);
      return null;
    }),
    // The forecast composes from the pre-generated transit library (zero AI
    // when seeded), so locked users get a real teaser: day 1 fully visible,
    // later days as blurred score rows. Narrative is stripped server-side.
    ensureWeeklyForecast(userId, locale).catch((err) => {
      console.warn("[dashboard:weekly]", (err as Error).message);
      return null;
    }),
  ]);

  // Overlay the stored top aspects with library interpretations. Works for
  // any cached daily (old AI ones too) since topAspects has always been
  // persisted; aspects without a library row yet are simply skipped.
  const transitBreakdown = daily?.transits?.topAspects?.length
    ? await overlayTransitAspects(daily.transits.topAspects, 5, locale).catch(
        () => [] as TransitBreakdownItem[],
      )
    : [];

  return {
    daily,
    transitBreakdown,
    moonPhase,
    weeklyForecast: canWeekly ? weeklyForecast : null,
    weeklyTeaser:
      !canWeekly && weeklyForecast && weeklyForecast.days.length > 0
        ? stripWeeklyTeaser(weeklyForecast.days)
        : null,
  };
}
