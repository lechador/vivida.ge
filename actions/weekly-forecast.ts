"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  profiles,
  users,
  weeklyForecasts,
  type WeeklyForecast,
  type WeeklyForecastDay,
} from "@/db/schema";
import { ensureChartFor } from "@/actions/chart";
import { canUseFeature } from "@/lib/features";
import { computeWeeklyForecast } from "@/lib/weekly-forecast";
import { localDateString } from "@/lib/transits";
import {
  WEEKLY_PROMPT_VERSION,
  generateWeeklyForecast,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
} from "@/lib/openrouter";
import type { PlanId } from "@/lib/pricing";

/**
 * Returns the user's 7-day forecast, regenerating + caching it whenever the
 * local week-start (= today, in the user's TZ) rolls forward. One row per
 * user — the forecast slides daily, no history kept.
 */
export async function ensureWeeklyForecast(
  userId: string,
  plan: PlanId
): Promise<WeeklyForecast | null> {
  // Server-side gate: free users never get a forecast generated, even if
  // a stale row from their trial period still sits in the cache.
  if (!canUseFeature("weeklyForecast", plan)) return null;
  if (!isOpenRouterConfigured()) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile?.timezone) return null;

  const chart = await ensureChartFor(userId, plan);
  if (!chart) return null;

  const now = new Date();
  const weekStart = localDateString(now, profile.timezone);

  const [existing] = await db
    .select()
    .from(weeklyForecasts)
    .where(eq(weeklyForecasts.userId, userId))
    .limit(1);

  if (
    existing &&
    existing.weekStart === weekStart &&
    existing.promptVersion === WEEKLY_PROMPT_VERSION &&
    existing.natalInputHash === chart.inputHash
  ) {
    return existing;
  }

  // Compute deterministic scores + drivers for each of the next 7 days.
  const ctx = computeWeeklyForecast(chart.data, now, profile.timezone);

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const firstName = user?.name?.split(" ")[0] ?? null;

  const reading = await generateWeeklyForecast({
    firstName,
    chart: chart.data,
    days: ctx.map((d) => ({
      dateIso: d.dateIso,
      promptLabel: d.promptLabel,
      moonSignKa: d.moonSignKa,
      harmonyScore: d.harmonyScore,
      challengeScore: d.challengeScore,
      drivers: d.drivers.slice(0, 6).map((dr) => ({
        transit: dr.transit,
        natal: dr.natal,
        kind: dr.kind,
        family: dr.family,
        orb: dr.orb,
      })),
    })),
  });
  if (!reading) return existing ?? null;

  // Stitch deterministic fields with AI narrative by dateIso. The model is
  // instructed to preserve dateIso exactly, but we tolerate ordering mismatch
  // by indexing the response into a map.
  const byDate = new Map(reading.days.map((d) => [d.dateIso, d]));
  const days: WeeklyForecastDay[] = ctx.map((d) => {
    const ai = byDate.get(d.dateIso);
    return {
      dateIso: d.dateIso,
      weekdayKa: d.weekdayKa,
      harmonyScore: d.harmonyScore,
      challengeScore: d.challengeScore,
      moonSignKa: d.moonSignKa,
      moonSignEn: d.moonSignEn,
      headline: ai?.headline ?? "",
      harmonicReason: ai?.harmonicReason ?? "",
      challengingReason: ai?.challengingReason ?? "",
      advice: ai?.advice ?? "",
      drivers: d.drivers.slice(0, 4).map((dr) => ({
        transit: dr.transit,
        natal: dr.natal,
        kind: dr.kind,
        family: dr.family,
        orb: dr.orb,
      })),
    };
  });

  const [inserted] = await db
    .insert(weeklyForecasts)
    .values({
      userId,
      weekStart,
      days,
      promptVersion: WEEKLY_PROMPT_VERSION,
      natalInputHash: chart.inputHash,
      model: OPENROUTER_MODEL,
      language: "ka",
    })
    .onConflictDoUpdate({
      target: weeklyForecasts.userId,
      set: {
        weekStart,
        days,
        promptVersion: WEEKLY_PROMPT_VERSION,
        natalInputHash: chart.inputHash,
        model: OPENROUTER_MODEL,
        language: "ka",
      },
    })
    .returning();

  return inserted ?? null;
}
