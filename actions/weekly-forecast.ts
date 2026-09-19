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
import { computeWeeklyForecast } from "@/lib/weekly-forecast";
import { localDateString } from "@/lib/transits";
import {
  WEEKLY_PROMPT_VERSION,
  generateWeeklyForecast,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
} from "@/lib/openrouter";
import { composeWeeklyFromLibrary } from "@/lib/transit-library";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { claimGeneration, releaseGeneration } from "@/lib/generation-lock";
import { archiveLibraryEntry } from "@/lib/library";

async function archiveWeeklyForecast(userId: string, forecast: WeeklyForecast) {
  const language = forecast.language;
  await archiveLibraryEntry({
    userId,
    kind: "weekly",
    sourceId: forecast.weekStart,
    title: language === "en" ? "Your 7-day forecast" : "შენი 7-დღიანი პროგნოზი",
    summary:
      language === "en"
        ? "Personal forecast for the next seven days"
        : "პერსონალური პროგნოზი მომდევნო შვიდი დღისთვის",
    content: {
      type: "weekly",
      weekStart: forecast.weekStart,
      days: forecast.days,
    },
    language,
    occurredAt: forecast.createdAt,
  });
}

/**
 * Returns the user's 7-day forecast, regenerating + caching it whenever the
 * local week-start (= today, in the user's TZ) rolls forward. One row per
 * user — the forecast slides daily, no history kept.
 */
export async function ensureWeeklyForecast(
  userId: string,
  requestedLocale?: UserLocale,
): Promise<WeeklyForecast | null> {
  const locale = requestedLocale ?? (await getUserLocale(userId));
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile?.timezone) return null;

  // Only positions are needed here (for transit scoring) — never the AI
  // narrative, so don't wait on or trigger a chart AI generation.
  const chart = await ensureChartFor(userId, { aiUpgrade: "skip" });
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
    existing.natalInputHash === chart.inputHash &&
    existing.language === locale
  ) {
    await archiveWeeklyForecast(userId, existing).catch((error) =>
      console.warn("[library] weekly archive failed:", error),
    );
    return existing;
  }

  const lockKey = `weekly:${userId}:${weekStart}:${locale}:v${WEEKLY_PROMPT_VERSION}`;
  if (!(await claimGeneration(lockKey, 5 * 60 * 1000))) {
    return existing ?? null;
  }

  try {
    // Compute deterministic scores + drivers for each of the next 7 days,
    // starting TOMORROW — today is already covered by the daily horoscope
    // card, so the "next 7 days" card shouldn't repeat it.
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const ctx = computeWeeklyForecast(chart.data, tomorrow, profile.timezone);

    // Fast path: compose all 7 narratives from the pre-generated transit
    // library — zero AI calls. Falls back to the model only when a needed
    // library row is missing.
    let narratives = await composeWeeklyFromLibrary(
      ctx.map((d) => ({
        dateIso: d.dateIso,
        moonSignKey: d.moonSignKey,
        drivers: d.drivers.slice(0, 6).map((dr) => ({
          transit: dr.transit,
          natal: dr.natal,
          kind: dr.kind,
          family: dr.family,
        })),
      })),
      locale,
    );
    let model = "library";

    if (!narratives) {
      if (!isOpenRouterConfigured()) return existing ?? null;
      model = OPENROUTER_MODEL;

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
      narratives = reading.days.map((d) => ({
        dateIso: d.dateIso,
        headline: d.headline ?? "",
        harmonicReason: d.harmonicReason ?? "",
        challengingReason: d.challengingReason ?? "",
        advice: d.advice ?? "",
      }));
    }

    // Stitch deterministic fields with the narratives by dateIso — tolerant
    // of ordering mismatch by indexing into a map.
    const byDate = new Map(narratives.map((d) => [d.dateIso, d]));
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
        model,
        language: locale,
      })
      .onConflictDoUpdate({
        target: weeklyForecasts.userId,
        set: {
          weekStart,
          days,
          promptVersion: WEEKLY_PROMPT_VERSION,
          natalInputHash: chart.inputHash,
          model,
          language: locale,
        },
      })
      .returning();

    if (inserted) {
      await archiveWeeklyForecast(userId, inserted).catch((error) =>
        console.warn("[library] weekly archive failed:", error),
      );
    }
    return inserted ?? null;
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}
