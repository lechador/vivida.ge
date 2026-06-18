"use server";

import { and, eq } from "drizzle-orm";
import { after } from "next/server";

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
/**
 * How the AI narrative is handled relative to the caller:
 *  - "wait"  (default): generate + persist AI inline, blocking until done.
 *            Use where the page genuinely renders the narrative server-side
 *            (e.g. /report, mobile chart API).
 *  - "defer": persist the fast static chart, return it immediately, and run
 *            the AI upgrade in the background via `after()`. Use on the
 *            dashboard so the user never stares at a spinner — the chart
 *            renders instantly and the richer text lands on the next view.
 *  - "skip":  only chart *data* (positions) is needed, never the narrative.
 *            Neither waits for nor schedules AI. Used by the daily/weekly
 *            generators, which read positions for transits.
 */
type AiUpgradeMode = "wait" | "defer" | "skip";

export async function ensureChartFor(
  userId: string,
  plan: PlanId = "free",
  opts: { aiUpgrade?: AiUpgradeMode } = {}
): Promise<Chart | null> {
  const mode = opts.aiUpgrade ?? "wait";
  // AI summary gates through the feature flag layer. While the flag is off,
  // every plan gets AI generation — so long as OpenRouter is configured.
  // `skip` callers opt out entirely.
  const wantAi =
    mode !== "skip" &&
    canUseFeature("aiSummary", plan) &&
    isOpenRouterConfigured();
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
      wantAi &&
      (existing.interpretationModel === "static" || missingExpansion);
    if (!canUpgrade) return existing;
    // Positions are already current — only the AI narrative needs work, and
    // we have the data to do it without recomputing. In "defer" mode we hand
    // that to the background and return the (renderable) static chart now.
    if (mode === "defer") {
      scheduleAiUpgrade(userId, expectedHash, existing.data);
      return existing;
    }
    // "wait" mode falls through to recompute + inline AI below.
  }

  // Compute (or recompute) the natal chart.
  const computed = await computeChart(input);

  // Seed with the static dictionary so the chart is fully renderable with
  // zero AI latency. AI text is layered on top afterwards.
  const interpretation = buildStaticInterpretation(computed.data);

  // Persist the static chart immediately. Every caller — especially the
  // dashboard right after signup — gets a fast, complete chart back; the AI
  // narrative is layered on via a guarded update that never blocks the page.
  await upsertChartRow(
    userId,
    expectedHash,
    computed.source,
    computed.data,
    interpretation,
    "static"
  );

  if (wantAi) {
    if (mode === "defer") {
      scheduleAiUpgrade(userId, expectedHash, computed.data);
    } else {
      await upgradeChartAi(userId, expectedHash, computed.data);
    }
  }

  const [fresh] = await db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  return fresh ?? null;
}

/** Static (zero-latency) interpretation seed for a freshly computed chart. */
function buildStaticInterpretation(
  data: NatalChartJson
): NonNullable<Chart["interpretation"]> {
  const ascSign = signByIndex(data.ascendant.signIndex).key;
  const sunSign = data.bodies.sun && signByIndex(data.bodies.sun.signIndex).key;
  const moonSign =
    data.bodies.moon && signByIndex(data.bodies.moon.signIndex).key;
  return {
    bigThree: {
      sun: sunSign ? staticInterpretation("sun", sunSign) : undefined,
      moon: moonSign ? staticInterpretation("moon", moonSign) : undefined,
      ascendant: staticInterpretation("ascendant", ascSign),
    },
    highlights: [],
    planets: buildStaticPlanetTexts(data),
    houses: buildStaticHouseTexts(data),
    aspects: buildStaticAspectTexts(data),
  };
}

async function upsertChartRow(
  userId: string,
  inputHash: string,
  source: string,
  data: NatalChartJson,
  interpretation: NonNullable<Chart["interpretation"]>,
  interpretationModel: string
): Promise<void> {
  const now = new Date();
  await db
    .insert(charts)
    .values({
      userId,
      inputHash,
      source,
      data,
      interpretation,
      interpretationModel,
      language: "ka",
      interpretedAt: now,
    })
    .onConflictDoUpdate({
      target: charts.userId,
      set: {
        inputHash,
        source,
        data,
        interpretation,
        interpretationModel,
        language: "ka",
        generatedAt: now,
        interpretedAt: now,
      },
    });
}

/**
 * Run the AI interpretation in the background after the response is sent.
 * Falls back to fire-and-forget if we're somehow outside a request scope so
 * the hot path never throws.
 */
function scheduleAiUpgrade(
  userId: string,
  inputHash: string,
  data: NatalChartJson
): void {
  const run = () =>
    upgradeChartAi(userId, inputHash, data).catch((err) =>
      console.warn(
        "[chart] background AI upgrade failed:",
        (err as Error).message
      )
    );
  try {
    after(run);
  } catch {
    void run();
  }
}

/**
 * Generate the AI narrative for an already-persisted chart and merge it in.
 * Guarded so concurrent schedules (e.g. signup pre-gen + dashboard) don't
 * double-spend an AI call, and so a birth-data change mid-flight can't
 * clobber the row.
 */
async function upgradeChartAi(
  userId: string,
  inputHash: string,
  data: NatalChartJson
): Promise<void> {
  const [current] = await db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  if (!current || current.inputHash !== inputHash) return;

  // Already has a full AI interpretation? Nothing to do.
  const interp = current.interpretation;
  const missingExpansion =
    !interp?.planets ||
    !interp?.houses ||
    !interp?.aspects ||
    Object.keys(interp.planets).length === 0 ||
    Object.keys(interp.houses).length === 0 ||
    Object.keys(interp.aspects).length === 0;
  if (current.interpretationModel !== "static" && !missingExpansion) return;

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const firstName = user?.name?.split(" ")[0] ?? null;

  const ascSign = signByIndex(data.ascendant.signIndex).key;
  const sunSign = data.bodies.sun && signByIndex(data.bodies.sun.signIndex).key;
  const moonSign =
    data.bodies.moon && signByIndex(data.bodies.moon.signIndex).key;
  const staticBigThree = {
    sun: sunSign ? staticInterpretation("sun", sunSign) : undefined,
    moon: moonSign ? staticInterpretation("moon", moonSign) : undefined,
    ascendant: staticInterpretation("ascendant", ascSign),
  };
  const staticPlanets = buildStaticPlanetTexts(data);
  const staticHouses = buildStaticHouseTexts(data);
  const staticAspects = buildStaticAspectTexts(data);

  const ai = await generateInterpretation({
    firstName,
    chart: data,
    staticBigThree,
  });
  if (!ai) return;

  // Merge AI fields into static defaults so any missing key still has
  // sensible content. AI text wins where present.
  const interpretation: NonNullable<Chart["interpretation"]> = {
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

  // Only write if the chart still matches the positions we interpreted.
  await db
    .update(charts)
    .set({
      interpretation,
      interpretationModel: OPENROUTER_MODEL,
      interpretedAt: new Date(),
    })
    .where(and(eq(charts.userId, userId), eq(charts.inputHash, inputHash)));
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
