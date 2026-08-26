"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
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
import {
  combosForDay,
  composeDailyFromLibrary,
  ensureTransitLibraryFor,
  getTransitLibraryEntries,
  type TransitDayFacts,
} from "@/lib/transit-library";
import { signByIndex } from "@/lib/zodiac";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { claimGeneration, releaseGeneration } from "@/lib/generation-lock";

/**
 * Returns today's horoscope for the user, generating + caching it on first
 * request of the day. Cache invalidates when:
 *  - User's birth data changes (via natal inputHash)
 *  - We bump DAILY_PROMPT_VERSION after a prompt-quality change
 */
export async function ensureDailyFor(
  userId: string,
  requestedLocale?: UserLocale,
): Promise<DailyHoroscope | null> {
  const locale = requestedLocale ?? (await getUserLocale(userId));
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile?.timezone) return null;

  // Only positions are needed here (for transits) — never the AI narrative,
  // so don't wait on or trigger a chart AI generation.
  const chart = await ensureChartFor(userId, { aiUpgrade: "skip" });
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
    const languageMatches = existing.language === locale;
    if (versionMatches && chartMatches && languageMatches) return existing;
    // Otherwise fall through and regenerate (upsert below)
  }

  const lockKey = `daily:${userId}:${today}:${locale}:v${DAILY_PROMPT_VERSION}`;
  if (!(await claimGeneration(lockKey, 3 * 60 * 1000))) {
    return existing ?? null;
  }

  try {

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

  const dateLocale = locale === "en" ? "en-US" : "ka-GE";
  const localizedDate = new Intl.DateTimeFormat(dateLocale, {
    timeZone: profile.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const weekday = new Intl.DateTimeFormat(dateLocale, {
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

  // Fast path: compose the reading from the pre-generated transit library —
  // zero AI calls, instant. Falls back to the full per-user model call only
  // when a needed library row is missing (self-healed in the background).
  let reading: {
    headline: string;
    summary: string;
    body: string;
    themes: string[];
  } | null = null;
  let model = OPENROUTER_MODEL;
  let source: "library" | "ai" = "ai";

  if (moonPos) {
    const facts: TransitDayFacts = {
      moon: {
        sign: signByIndex(Math.floor(moonPos.longitude / 30)).key,
        house: moonHouse,
        aspects: moonAspects,
      },
      sun: { house: sunHouse },
      innerAspects,
      outerAspects,
    };
    const combos = combosForDay(facts);
    const entries = await getTransitLibraryEntries(
      combos.map((c) => c.key),
      locale,
    );
    const composed = composeDailyFromLibrary(facts, entries, locale, today);
    if (composed) {
      reading = composed;
      model = "library";
      source = "library";
    } else {
      const missing = combos.filter((c) => !entries.has(c.key));
      void ensureTransitLibraryFor(missing).catch(() => {});
    }
  }

  if (!reading) {
    if (!isOpenRouterConfigured()) return null;
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const firstName = user?.name?.split(" ")[0] ?? null;

    reading = await generateDailyReading({
      firstName,
      chart: chart.data,
      context,
    });
  }

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
        headlineAspect: moonAspects[0]
          ? {
              transit: moonAspects[0].transit,
              natal: moonAspects[0].natal,
              kind: moonAspects[0].kind,
            }
          : null,
        source,
      },
      model,
      language: locale,
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
          headlineAspect: moonAspects[0]
            ? {
                transit: moonAspects[0].transit,
                natal: moonAspects[0].natal,
                kind: moonAspects[0].kind,
              }
            : null,
          source,
        },
        model,
        language: locale,
      },
    })
    .returning();

  return inserted ?? null;
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}
