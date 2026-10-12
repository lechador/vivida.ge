"use server";

import { and, eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { charts, profiles, users, type Chart } from "@/db/schema";
import { computeAspectsFor, computeChart, hashInput } from "@/lib/astrology";
import {
  generateChartSummary,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
} from "@/lib/openrouter";
import { staticInterpretation } from "@/lib/interpretations";
import {
  ensureLibraryFor,
  getLibraryEntries,
  libraryKey,
  placementsForChart,
} from "@/lib/interpretation-library";
import {
  aspectLibraryKey,
  ensureAspectLibraryFor,
  getAspectLibraryEntries,
} from "@/lib/aspect-library";
import {
  getHouseLibraryEntries,
  houseLibraryKey,
  ensureHouseLibraryFor,
  type HouseCuspPlacement,
  type HouseOccupantPlacement,
} from "@/lib/house-library";
import { BODIES, bodyMeta, signByIndex } from "@/lib/zodiac";
import { HOUSE_NUMBERS, houseDef } from "@/lib/houses";
import { aspectKey } from "@/lib/aspects";
import type { NatalChartJson } from "@/db/schema";

/**
 * Returns the user's natal chart, generating + caching it if needed.
 * Always returns *something*, local computation is the floor.
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
 *            (e.g. /report).
 *  - "defer": persist the fast static chart, return it immediately, and run
 *            the AI upgrade in the background via `after()`. Use on the
 *            dashboard so the user never stares at a spinner, the chart
 *            renders instantly and the richer text lands on the next view.
 *  - "skip":  only chart *data* (positions) is needed, never the narrative.
 *            Neither waits for nor schedules AI. Used by the daily/weekly
 *            generators, which read positions for transits.
 */
type AiUpgradeMode = "wait" | "defer" | "skip";

async function resolveChart(
  userId: string,
  opts: { aiUpgrade?: AiUpgradeMode } = {},
): Promise<Chart | null> {
  const mode = opts.aiUpgrade ?? "wait";
  // AI summaries are available to every account when OpenRouter is configured.
  // `skip` callers opt out entirely.
  const wantAi = mode !== "skip" && isOpenRouterConfigured();
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

    // The only per-user AI work left is the summary + highlights, the
    // per-placement text comes from the shared library at read time. So we
    // only need an upgrade when the summary hasn't been generated yet.
    const canUpgrade = wantAi && !existing.interpretation.summary;
    if (!canUpgrade) return existing;
    // Positions are already current, only the AI narrative needs work, and
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

  // Persist the static chart immediately. Every caller, especially the
  // dashboard right after signup, gets a fast, complete chart back; the AI
  // narrative is layered on via a guarded update that never blocks the page.
  await upsertChartRow(
    userId,
    expectedHash,
    computed.source,
    computed.data,
    interpretation,
    "static",
  );

  if (wantAi) {
    if (mode === "defer") {
      scheduleAiUpgrade(userId, expectedHash, computed.data);
    } else {
      // The static chart above is already fully renderable (library/static
      // text covers every placement); the AI only adds the summary paragraph.
      // So an AI failure must NEVER crash the page, log it and return the
      // static chart. This was the "/report errors right after onboarding,
      // works on refresh" bug: a transient OpenRouter/Gemini error threw
      // straight through the Server Component with no error boundary to catch
      // it. A later visit hits the cached static chart and (if the background
      // upgrade landed) the summary.
      try {
        await upgradeChartAi(userId, expectedHash, computed.data);
      } catch (err) {
        console.warn(
          "[resolveChart] inline AI upgrade failed; serving static chart:",
          (err as Error).message,
        );
      }
    }
  }

  const [fresh] = await db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  return fresh ?? null;
}

/**
 * True for transient network/connection failures (Neon HTTP driver blips,
 * DNS hiccups) as opposed to real query errors (bad SQL, constraint
 * violations), walks the `.cause` chain since drizzle/neon wrap the
 * original TypeError a couple of layers deep.
 */
function isTransientDbError(err: unknown): boolean {
  let e: unknown = err;
  for (let i = 0; i < 4 && e; i++) {
    const msg = (e as { message?: string }).message ?? "";
    if (
      /fetch failed|error connecting to database|econnreset|etimedout/i.test(
        msg,
      )
    ) {
      return true;
    }
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

/**
 * Public accessor, resolves the chart, then overlays the shared per-placement
 * interpretation library (Big Three + planet sections) so every consumer
 * renders the same reusable text and an admin edit reflects for all users at
 * once. Falls back to the chart's own static/AI text when a row isn't seeded.
 *
 * This is the heaviest DB path in the app on a cache miss, profile select,
 * chart select/upsert, computeChart, plus a handful of per-placement library
 * selects, which is exactly the first /report view right after signup. A
 * single transient Neon connection blip anywhere in that burst previously
 * surfaced as an opaque Server Component crash ("reload to try again"). One
 * silent retry recovers the same way the manual reload did.
 */
export async function ensureChartFor(
  userId: string,
  opts: { aiUpgrade?: AiUpgradeMode } = {},
): Promise<Chart | null> {
  try {
    const chart = await resolveChart(userId, opts);
    return chart ? overlayLibrary(chart) : chart;
  } catch (err) {
    if (!isTransientDbError(err)) throw err;
    console.warn(
      "[ensureChartFor] transient DB error, retrying once:",
      (err as Error).message,
    );
    await new Promise((r) => setTimeout(r, 300));
    const chart = await resolveChart(userId, opts);
    return chart ? overlayLibrary(chart) : chart;
  }
}

/** The chart's house cusp signs + occupant planets, for library lookups. */
function houseCombosForChart(data: NatalChartJson): {
  cusps: HouseCuspPlacement[];
  occupants: HouseOccupantPlacement[];
} {
  const cusps: HouseCuspPlacement[] = [];
  for (const n of HOUSE_NUMBERS) {
    const cusp = data.houses.find((h) => h.number === n);
    if (cusp) cusps.push({ house: n, sign: signByIndex(cusp.signIndex).key });
  }
  const occupants: HouseOccupantPlacement[] = [];
  for (const [key, body] of Object.entries(data.bodies)) {
    if (body.house) occupants.push({ house: body.house, planet: key });
  }
  return { cusps, occupants };
}

async function overlayLibrary(chart: Chart): Promise<Chart> {
  const interp = chart.interpretation;
  if (!interp) return chart;
  const placements = placementsForChart(chart.data);
  const { cusps, occupants } = houseCombosForChart(chart.data);
  // Never let a library lookup break a chart render, if the table isn't
  // migrated yet or the query fails, fall back to the chart's own text.
  let lib: Map<string, string>;
  let aspectLib: Map<string, string>;
  let houseLib: Map<string, string>;
  try {
    [lib, aspectLib, houseLib] = await Promise.all([
      getLibraryEntries(placements.map((p) => libraryKey(p.subject, p.sign))),
      getAspectLibraryEntries(
        (chart.data.aspects ?? []).map((a) =>
          aspectLibraryKey(a.a, a.b, a.kind),
        ),
      ),
      getHouseLibraryEntries([
        ...cusps.map((c) => houseLibraryKey("cusp", c.house, c.sign)),
        ...occupants.map((o) => houseLibraryKey("occupant", o.house, o.planet)),
      ]),
    ]);
  } catch (err) {
    console.warn("[chart] library overlay skipped:", (err as Error).message);
    return chart;
  }
  if (lib.size === 0 && aspectLib.size === 0 && houseLib.size === 0) {
    return chart; // nothing seeded yet
  }

  const bigThree = { ...interp.bigThree };
  const planets = { ...(interp.planets ?? {}) };
  for (const p of placements) {
    const body = lib.get(libraryKey(p.subject, p.sign));
    if (!body) continue;
    if (p.subject === "sun") bigThree.sun = body;
    else if (p.subject === "moon") bigThree.moon = body;
    else if (p.subject === "ascendant") bigThree.ascendant = body;
    else planets[p.subject] = body;
  }

  const aspects = { ...(interp.aspects ?? {}) };
  for (const a of chart.data.aspects ?? []) {
    const body = aspectLib.get(aspectLibraryKey(a.a, a.b, a.kind));
    if (body) aspects[aspectKey(a.a, a.b, a.kind)] = body;
  }

  // Houses compose two pieces: the cusp-sign text, plus each occupant
  // planet's text (a house can hold zero, one, or several planets). Only
  // override when the cusp is covered, that's the always-present half;
  // occupant coverage layers on top of it.
  const houses = { ...(interp.houses ?? {}) };
  const occupantsByHouse = new Map<number, string[]>();
  for (const o of occupants) {
    const list = occupantsByHouse.get(o.house) ?? [];
    list.push(o.planet);
    occupantsByHouse.set(o.house, list);
  }
  for (const c of cusps) {
    const cuspBody = houseLib.get(houseLibraryKey("cusp", c.house, c.sign));
    if (!cuspBody) continue;
    const occupantBodies = (occupantsByHouse.get(c.house) ?? [])
      .map((planet) =>
        houseLib.get(houseLibraryKey("occupant", c.house, planet)),
      )
      .filter((b): b is string => Boolean(b));
    houses[String(c.house)] = [cuspBody, ...occupantBodies].join("\n\n");
  }

  chart.interpretation = { ...interp, bigThree, planets, aspects, houses };
  return chart;
}

/** Static (zero-latency) interpretation seed for a freshly computed chart. */
function buildStaticInterpretation(
  data: NatalChartJson,
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
  interpretationModel: string,
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
  data: NatalChartJson,
): void {
  const run = () =>
    upgradeChartAi(userId, inputHash, data).catch((err) =>
      console.warn(
        "[chart] background AI upgrade failed:",
        (err as Error).message,
      ),
    );
  try {
    after(run);
  } catch {
    void run();
  }
}

/**
 * Background work for an already-persisted chart:
 *   1. Populate the shared per-placement interpretation library (no-op once
 *      seeded) so Big Three + planet text is reused across all users.
 *   2. Generate the one remaining per-user piece, the summary + highlights.
 * Guarded so concurrent schedules don't double-spend, and so a birth-data
 * change mid-flight can't clobber the row.
 */
async function upgradeChartAi(
  userId: string,
  inputHash: string,
  data: NatalChartJson,
): Promise<void> {
  const [current] = await db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  if (!current || current.inputHash !== inputHash) return;

  // Make sure the reusable libraries cover this chart's placements, aspects,
  // and houses. Cheap once seeded; self-heals for new combos otherwise.
  const { cusps, occupants } = houseCombosForChart(data);
  await Promise.all([
    ensureLibraryFor(placementsForChart(data)).catch((err) =>
      console.warn("[chart] library ensure failed:", (err as Error).message),
    ),
    ensureAspectLibraryFor(
      (data.aspects ?? []).map((a) => ({ a: a.a, b: a.b, kind: a.kind })),
    ).catch((err) =>
      console.warn(
        "[chart] aspect library ensure failed:",
        (err as Error).message,
      ),
    ),
    ensureHouseLibraryFor(cusps, occupants).catch((err) =>
      console.warn(
        "[chart] house library ensure failed:",
        (err as Error).message,
      ),
    ),
  ]);

  // Summary + highlights are the only per-user AI text. Skip if already done.
  if (current.interpretation?.summary) return;

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const firstName = user?.name?.split(" ")[0] ?? null;

  const ai = await generateChartSummary({ firstName, chart: data });
  if (!ai) return;

  const base = current.interpretation ?? buildStaticInterpretation(data);
  const interpretation: NonNullable<Chart["interpretation"]> = {
    ...base,
    summary: ai.summary,
    highlights: ai.highlights,
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
    out[key] =
      `${meta?.labelKa ?? key} (${meta?.meaningKa ?? ""}) ${sign.labelKa}-შია${housePart}${retro}. ${sign.element}-ის ენერგია ფერავს ამ სფეროს.`;
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
  harmonic: "ბუნებრივი ურთიერთობა, ენერგია მარტივად მიედინება.",
  tense: "დაძაბული ურთიერთობა, გასაკეთებელი სამუშაო და ზრდის წყარო.",
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

    const cuspLine = cuspSign ? `${cuspSign.labelKa} მართავს ამ სფეროს.` : "";
    const occLine =
      occ.length > 0
        ? ` შიგნით, ${occ.join(", ")}.`
        : " ცარიელი სახლი, გავლენას ნიშანი ანიჭებს.";

    out[String(n)] = `${def.meaningKa} ${cuspLine}${occLine}`;
  }
  return out;
}
