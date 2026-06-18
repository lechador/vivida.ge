"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  charts,
  dailyHoroscopes,
  profiles,
  users,
  type DailyHoroscope,
} from "@/db/schema";
import { ensureChartFor } from "@/actions/chart";
import {
  computeTransits,
  detectCrossAspects,
  houseOfLongitude,
  localDateString,
} from "@/lib/transits";
import {
  DAILY_PROMPT_VERSION,
  generateDailyReading,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
  type DailyDayContext,
} from "@/lib/openrouter";
import { canUseFeature } from "@/lib/features";
import { signByIndex } from "@/lib/zodiac";
import type { PlanId } from "@/lib/pricing";

/**
 * Returns today's horoscope for the user, generating + caching it on first
 * request of the day. Cache invalidates when:
 *  - User's birth data changes (via natal inputHash)
 *  - We bump DAILY_PROMPT_VERSION after a prompt-quality change
 */
export async function ensureDailyFor(
  userId: string,
  plan: PlanId
): Promise<DailyHoroscope | null> {
  if (!canUseFeature("dailyHoroscope", plan)) return null;
  if (!isOpenRouterConfigured()) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile?.timezone) return null;

  // Only positions are needed here (for transits) — never the AI narrative,
  // so don't wait on or trigger a chart AI generation.
  const chart = await ensureChartFor(userId, plan, { aiUpgrade: "skip" });
  if (!chart) return null;

  const today = localDateString(new Date(), profile.timezone);

  // Cache check — same date, same prompt version, same natal data
  const [existing] = await db
    .select()
    .from(dailyHoroscopes)
    .where(
      and(
        eq(dailyHoroscopes.userId, userId),
        eq(dailyHoroscopes.date, today)
      )
    )
    .limit(1);
  if (existing) {
    const meta = existing.transits;
    const versionMatches = meta?.promptVersion === DAILY_PROMPT_VERSION;
    const chartMatches = meta?.natalInputHash === chart.inputHash;
    if (versionMatches && chartMatches) return existing;
    // Otherwise fall through and regenerate (upsert below)
  }

  const now = new Date();
  const transits = computeTransits(
    now,
    profile.latitude ?? 0,
    profile.longitude ?? 0
  );

  // Map natal bodies for aspect detection
  const natalBodies = Object.fromEntries(
    Object.entries(chart.data.bodies).map(([k, v]) => [
      k,
      { longitude: v.longitude },
    ])
  );

  // All transit-natal aspects, sorted by tightness
  const allAspects = detectCrossAspects(transits, natalBodies);

  // Categorize by transiting body's speed
  const moonAspects = allAspects
    .filter((a) => a.transit === "moon" && a.orb <= 4)
    .slice(0, 5);
  const innerKeys = new Set(["mercury", "venus", "mars"]);
  const outerKeys = new Set([
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ]);
  const innerAspects = allAspects
    .filter((a) => innerKeys.has(a.transit) && a.orb <= 3)
    .slice(0, 5);
  const outerAspects = allAspects
    .filter((a) => outerKeys.has(a.transit))
    .slice(0, 4);

  // Transit-house assignments (which natal house each transit falls in)
  const houseFor = (lng: number) =>
    houseOfLongitude(lng, chart.data.houses);

  const moonPos = transits.moon;
  const sunPos = transits.sun;
  const moonHouse = moonPos ? houseFor(moonPos.longitude) : null;
  const sunHouse = sunPos ? houseFor(sunPos.longitude) : null;

  const innerPlanets: DailyDayContext["innerPlanets"] = (
    ["mercury", "venus", "mars"] as const
  )
    .filter((k) => transits[k])
    .map((k) => ({
      key: k,
      signEn: signByIndex(Math.floor(transits[k].longitude / 30)).labelEn,
      natalHouse: houseFor(transits[k].longitude),
    }));

  const localizedDate = new Intl.DateTimeFormat("ka-GE", {
    timeZone: profile.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const weekday = new Intl.DateTimeFormat("ka-GE", {
    timeZone: profile.timezone,
    weekday: "long",
  }).format(now);

  const context: DailyDayContext = {
    localizedDate,
    weekday,
    moon: {
      signEn: moonPos
        ? signByIndex(Math.floor(moonPos.longitude / 30)).labelEn
        : "Unknown",
      natalHouse: moonHouse,
      aspectsToNatal: moonAspects,
    },
    sun: {
      signEn: sunPos
        ? signByIndex(Math.floor(sunPos.longitude / 30)).labelEn
        : "Unknown",
      natalHouse: sunHouse,
    },
    innerPlanets,
    innerAspects,
    outerAspects,
  };

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const firstName = user?.name?.split(" ")[0] ?? null;

  const reading = await generateDailyReading({
    firstName,
    chart: chart.data,
    context,
  });

  if (!reading) return null;

  const [inserted] = await db
    .insert(dailyHoroscopes)
    .values({
      userId,
      date: today,
      headline: reading.headline,
      summary: reading.summary,
      body: reading.body,
      themes: reading.themes,
      transits: {
        topAspects: allAspects.slice(0, 10),
        promptVersion: DAILY_PROMPT_VERSION,
        natalInputHash: chart.inputHash,
        moonHouse,
        moonSignEn: context.moon.signEn,
      },
      model: OPENROUTER_MODEL,
      language: "ka",
    })
    .onConflictDoUpdate({
      target: [dailyHoroscopes.userId, dailyHoroscopes.date],
      set: {
        headline: reading.headline,
        summary: reading.summary,
        body: reading.body,
        themes: reading.themes,
        transits: {
          topAspects: allAspects.slice(0, 10),
          promptVersion: DAILY_PROMPT_VERSION,
          natalInputHash: chart.inputHash,
          moonHouse,
          moonSignEn: context.moon.signEn,
        },
        model: OPENROUTER_MODEL,
        language: "ka",
      },
    })
    .returning();

  return inserted ?? null;
}
