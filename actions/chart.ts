"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, profiles, users, type Chart } from "@/db/schema";
import { computeAspectsFor, computeChart, hashInput } from "@/lib/astrology";
import {
  generateInterpretation,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
} from "@/lib/openrouter";
import { staticInterpretation } from "@/lib/interpretations";
import { BODIES, bodyMeta, signByIndex } from "@/lib/zodiac";
import { HOUSE_NUMBERS, houseDef } from "@/lib/houses";
import { canUseFeature } from "@/lib/features";
import { aspectKey } from "@/lib/aspects";
import type { PlanId } from "@/lib/pricing";
import type { NatalChartJson } from "@/db/schema";

/**
 * Returns the user's natal chart, generating + caching it if needed.
 * Always returns *something* — local computation is the floor.
 *
 * Caching strategy:
 *   1. If the cached chart's `inputHash` matches the current profile, reuse it.
 *   2. Otherwise, recompute the chart and (re)generate the interpretation.
 *   3. If interpretation generation fails, persist the chart anyway so the
 *      static fallback can render.
 */
export async function ensureChartFor(
  userId: string,
  plan: PlanId = "free"
): Promise<Chart | null> {
  // AI summary gates through the feature flag layer. While the flag is off,
  // every plan gets AI generation — so long as OpenRouter is configured.
  const aiEnabled =
    canUseFeature("aiSummary", plan) && isOpenRouterConfigured();
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (
    !profile ||
    !profile.dateOfBirth ||
    profile.latitude === null ||
    profile.longitude === null ||
    !profile.timezone
  ) {
    return null;
  }

  const input = {
    date: profile.dateOfBirth,
    time: profile.timeOfBirth ? profile.timeOfBirth.slice(0, 5) : null,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
  };
  const expectedHash = hashInput(input);

  const [existing] = await db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);

  // Cache hit only when birth data hasn't changed AND we don't need to
  // upgrade the interpretation. Triggers regeneration when:
  //  - Cached as static + AI is now available (first-time AI), or
  //  - Cached AI but missing the new planets/houses fields (schema bumped)
  if (
    existing &&
    existing.inputHash === expectedHash &&
    existing.interpretation
  ) {
    // Always recompute aspects with current orbs, then layer cached AI text
    // on top. New aspects fall back to static templates; vanished aspects
    // simply disappear. Lets us tweak orb tolerances without busting cache.
    const liveAspects = computeAspectsFor(existing.data);
    existing.data = { ...existing.data, aspects: liveAspects };
    const liveStaticAspects = buildStaticAspectTexts(existing.data);
    existing.interpretation = {
      ...existing.interpretation,
      aspects: {
        ...liveStaticAspects,
        ...(existing.interpretation.aspects ?? {}),
      },
    };

    const interp = existing.interpretation;
    const missingExpansion =
      !interp.planets ||
      !interp.houses ||
      !interp.aspects ||
      Object.keys(interp.planets).length === 0 ||
      Object.keys(interp.houses).length === 0 ||
      Object.keys(interp.aspects).length === 0;
    const canUpgrade =
      aiEnabled &&
      (existing.interpretationModel === "static" || missingExpansion);
    if (!canUpgrade) return existing;
  }

  // Compute (or recompute) the natal chart
  const computed = await computeChart(input);

  // Always seed with the static dictionary; AI augments if available.
  const ascSign = signByIndex(computed.data.ascendant.signIndex).key;
  const sunSign =
    computed.data.bodies.sun &&
    signByIndex(computed.data.bodies.sun.signIndex).key;
  const moonSign =
    computed.data.bodies.moon &&
    signByIndex(computed.data.bodies.moon.signIndex).key;

  const staticBigThree = {
    sun: sunSign ? staticInterpretation("sun", sunSign) : undefined,
    moon: moonSign ? staticInterpretation("moon", moonSign) : undefined,
    ascendant: staticInterpretation("ascendant", ascSign),
  };

  const staticPlanets = buildStaticPlanetTexts(computed.data);
  const staticHouses = buildStaticHouseTexts(computed.data);

  const staticAspects = buildStaticAspectTexts(computed.data);

  let interpretation: NonNullable<Chart["interpretation"]> = {
    bigThree: staticBigThree,
    highlights: [],
    planets: staticPlanets,
    houses: staticHouses,
    aspects: staticAspects,
  };

  let interpretationModel = "static";
  const interpretedAt = new Date();

  if (aiEnabled) {
    try {
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const firstName = user?.name?.split(" ")[0] ?? null;

      const ai = await generateInterpretation({
        firstName,
        chart: computed.data,
        staticBigThree,
      });
      if (ai) {
        // Merge AI fields into static defaults so any missing key still has
        // sensible content. AI text wins where present.
        interpretation = {
          summary: ai.summary,
          bigThree: {
            sun: ai.bigThree?.sun ?? staticBigThree.sun,
            moon: ai.bigThree?.moon ?? staticBigThree.moon,
            ascendant: ai.bigThree?.ascendant ?? staticBigThree.ascendant,
          },
          highlights: ai.highlights ?? [],
          planets: { ...staticPlanets, ...(ai.planets ?? {}) },
          houses: { ...staticHouses, ...(ai.houses ?? {}) },
          aspects: { ...staticAspects, ...(ai.aspects ?? {}) },
        };
        interpretationModel = OPENROUTER_MODEL;
      }
    } catch (err) {
      console.warn(
        "[chart] AI interpretation failed; using static fallback:",
        (err as Error).message
      );
    }
  }

  // Upsert
  await db
    .insert(charts)
    .values({
      userId,
      inputHash: expectedHash,
      source: computed.source,
      data: computed.data,
      interpretation,
      interpretationModel,
      language: "ka",
      interpretedAt,
    })
    .onConflictDoUpdate({
      target: charts.userId,
      set: {
        inputHash: expectedHash,
        source: computed.source,
        data: computed.data,
        interpretation,
        interpretationModel,
        language: "ka",
        generatedAt: new Date(),
        interpretedAt,
      },
    });

  const [fresh] = await db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  return fresh ?? null;
}

// ────────────────────────────────────────────────────────────────────────
// Static fallbacks
//
// We need *something* in the planets/houses fields even when AI hasn't
// run. Templates compose the planet/house meaning + the user's actual
// sign placement so the dashboard doesn't render blank cards.
// ────────────────────────────────────────────────────────────────────────

const PLANET_KEYS = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

function buildStaticPlanetTexts(chart: NatalChartJson): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of PLANET_KEYS) {
    const body = chart.bodies[key];
    if (!body) continue;
    const meta = bodyMeta(key);
    const sign = signByIndex(body.signIndex);
    const housePart = body.house ? `, ${body.house}-ე სახლში` : "";
    const retro = body.retrograde ? " რეტროგრადული მოძრაობით" : "";
    out[key] = `${meta?.labelKa ?? key} (${meta?.meaningKa ?? ""}) ${sign.labelKa}-შია${housePart}${retro}. ${sign.element}-ის ენერგია ფერავს ამ სფეროს.`;
  }
  return out;
}

const ASPECT_KIND_KA: Record<string, string> = {
  conjunction: "შერწყმაშია",
  sextile: "სექსტილში დგას",
  square: "კვადრატშია",
  trine: "სამკუთხაშია",
  opposition: "ოპოზიციაშია",
};

const ASPECT_FAMILY_LINE: Record<string, string> = {
  harmonic: "ბუნებრივი ურთიერთობა — ენერგია მარტივად მიედინება.",
  tense: "დაძაბული ურთიერთობა — გასაკეთებელი სამუშაო და ზრდის წყარო.",
  neutral: "ენერგიები ერთად მუშაობენ, ერთიანი ხმა იქცევიან.",
};

function buildStaticAspectTexts(chart: NatalChartJson): Record<string, string> {
  const out: Record<string, string> = {};
  for (const aspect of chart.aspects ?? []) {
    const aMeta = BODIES[aspect.a];
    const bMeta = BODIES[aspect.b];
    const aLabel = aMeta?.labelKa ?? aspect.a;
    const bLabel = bMeta?.labelKa ?? aspect.b;
    const verb = ASPECT_KIND_KA[aspect.kind] ?? aspect.kind;
    const tail = ASPECT_FAMILY_LINE[aspect.family] ?? "";
    out[aspectKey(aspect.a, aspect.b, aspect.kind)] =
      `შენი ${aLabel} და ${bLabel} ${verb} (ორბი ${aspect.orb.toFixed(1)}°). ${tail}`;
  }
  return out;
}

function buildStaticHouseTexts(chart: NatalChartJson): Record<string, string> {
  const occupants: Record<number, string[]> = {};
  for (const [k, body] of Object.entries(chart.bodies)) {
    if (body.house) {
      const meta = BODIES[k];
      (occupants[body.house] ??= []).push(meta?.labelKa ?? k);
    }
  }

  const out: Record<string, string> = {};
  for (const n of HOUSE_NUMBERS) {
    const def = houseDef(n);
    const cusp = chart.houses.find((h) => h.number === n);
    const cuspSign = cusp ? signByIndex(cusp.signIndex) : null;
    const occ = occupants[n] ?? [];

    const cuspLine = cuspSign
      ? `${cuspSign.labelKa} მართავს ამ სფეროს.`
      : "";
    const occLine =
      occ.length > 0
        ? ` შიგნით — ${occ.join(", ")}.`
        : " ცარიელი სახლი — გავლენას ნიშანი ანიჭებს.";

    out[String(n)] = `${def.meaningKa} ${cuspLine}${occLine}`;
  }
  return out;
}
