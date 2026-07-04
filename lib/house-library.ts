/**
 * Reusable per-house interpretation library.
 *
 * A house's full meaning depends on BOTH its cusp sign AND whichever
 * (variable, unbounded) set of planets occupy it — unlike a planet-in-sign
 * or a two-body aspect, that's not a single finite fact. We decompose it
 * into two reusable, finite pieces instead:
 *
 *   - "cusp"     — (house, sign): what this life area looks like colored by
 *                  this sign. 12 houses × 12 signs = 144 combos.
 *   - "occupant" — (house, planet): what it means for this planet's energy
 *                  to be active in this life area. 12 houses × 11 planets
 *                  (the 10 traditional planets + Chiron; Ascendant/Midheaven
 *                  never "occupy" a house — they define houses 1 and 10) =
 *                  132 combos.
 *
 * At render time the cusp text plus each occupant's text are composed into
 * the single string the report shows for that house (see actions/chart.ts).
 * All entries are AI-generated with a high-quality model (rich, natural
 * Georgian). Rows flagged `edited` are never overwritten by regeneration.
 */

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { houseInterpretationLibrary } from "@/db/schema";
import { BODIES, SIGNS } from "./zodiac";
import { HOUSE_NUMBERS, houseDef } from "./houses";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Same higher-quality model used for the sign/aspect libraries. */
export const HOUSE_LIBRARY_MODEL = "google/gemini-3.1-pro-preview";

/** The 11 chart bodies that can occupy a house (Asc/MC define houses instead). */
export const HOUSE_OCCUPANT_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
] as const;

export type HouseLibraryKind = "cusp" | "occupant";

export function houseLibraryKey(
  kind: HouseLibraryKind,
  house: number,
  subject: string
): string {
  return `${kind}:${house}:${subject}`;
}

export type HouseCuspPlacement = { house: number; sign: string };
export type HouseOccupantPlacement = { house: number; planet: string };

/** Every possible cusp combo: 12 houses × 12 signs = 144. */
export function allHouseCuspCombos(): HouseCuspPlacement[] {
  const out: HouseCuspPlacement[] = [];
  for (const house of HOUSE_NUMBERS) {
    for (const sign of SIGNS) out.push({ house, sign: sign.key });
  }
  return out;
}

/** Every possible occupant combo: 12 houses × 11 planets = 132. */
export function allHouseOccupantCombos(): HouseOccupantPlacement[] {
  const out: HouseOccupantPlacement[] = [];
  for (const house of HOUSE_NUMBERS) {
    for (const planet of HOUSE_OCCUPANT_BODIES) out.push({ house, planet });
  }
  return out;
}

/**
 * Batched read: returns a Map of key → body for the requested keys. Pure
 * read — never generates. Used by the read-time overlay so editing a library
 * row reflects for every user on their next view.
 */
export async function getHouseLibraryEntries(
  keys: string[]
): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  const rows = await db
    .select({
      key: houseInterpretationLibrary.key,
      body: houseInterpretationLibrary.body,
    })
    .from(houseInterpretationLibrary)
    .where(inArray(houseInterpretationLibrary.key, keys));
  return new Map(rows.map((r) => [r.key, r.body]));
}

const SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  "თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები " +
  '("ვარსკვლავები გელიან", "მიენდე სამყაროს").';

function cuspPrompt(house: number, signKey: string): string {
  const def = houseDef(house);
  const sign = SIGNS.find((s) => s.key === signKey);
  const signLabel = sign?.labelKa ?? signKey;
  const signNature = sign
    ? `${sign.element}ის ${sign.modality} ნიშანი, რომელსაც განაგებს ${sign.ruler}`
    : "";
  return (
    `დაწერე ინტერპრეტაცია: "${def.labelKa} (${def.themeKa}) — კუსპი ${signLabel}-ში".\n` +
    `ეს სახლი მართავს: ${def.meaningKa}\n` +
    `${signLabel} — ${signNature}.\n\n` +
    `5-7 წინადადება (დაახ. 110-150 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ახსენი, როგორ ფერავს ${signLabel}-ის ბუნება ამ კონკრეტულ ცხოვრების სფეროს — ` +
    `ერთი ცოცხალი მაგალითით. დააბრუნე მხოლოდ ტექსტი — სათაურის, ` +
    `ფორმატირების და ფრჩხილების გარეშე.`
  );
}

function occupantPrompt(house: number, planetKey: string): string {
  const def = houseDef(house);
  const planet = BODIES[planetKey];
  const planetLabel = planet?.labelKa ?? planetKey;
  return (
    `დაწერე ინტერპრეტაცია: "${planetLabel} ${def.labelKa}-ში (${def.themeKa})".\n` +
    `ეს სახლი მართავს: ${def.meaningKa}\n` +
    `${planetLabel} — ${planet?.meaningKa ?? ""}.\n\n` +
    `5-7 წინადადება (დაახ. 110-150 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ახსენი, როგორ გამოხატავს ${planetLabel}-ის ენერგია თავს კონკრეტულად ამ ` +
    `ცხოვრების სფეროში — ერთი ცოცხალი მაგალითით. დააბრუნე მხოლოდ ტექსტი — ` +
    `სათაურის, ფორმატირების და ფრჩხილების გარეშე.`
  );
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida house library",
    },
    body: JSON.stringify({
      model: HOUSE_LIBRARY_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      // gemini-3.1-pro always reasons; leave headroom beyond the thinking
      // budget so the answer isn't truncated.
      max_tokens: 12000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as OpenRouterJson;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const body = json.choices?.[0]?.message?.content?.trim();
  if (!body) throw new Error("empty house entry");
  return body;
}

/** Generate a single reusable cusp interpretation. Throws on API/empty errors. */
export async function generateHouseCuspEntry(
  house: number,
  signKey: string
): Promise<string> {
  return callOpenRouter(cuspPrompt(house, signKey));
}

/** Generate a single reusable occupant interpretation. Throws on API/empty errors. */
export async function generateHouseOccupantEntry(
  house: number,
  planetKey: string
): Promise<string> {
  return callOpenRouter(occupantPrompt(house, planetKey));
}

/**
 * Ensure library rows exist for the given cusp + occupant placements,
 * generating any missing ones (one AI call each) and persisting them.
 * Returns a key → body map. Background path — never blocks a page render.
 */
export async function ensureHouseLibraryFor(
  cusps: HouseCuspPlacement[],
  occupants: HouseOccupantPlacement[]
): Promise<Map<string, string>> {
  const cuspKeys = cusps.map((c) => houseLibraryKey("cusp", c.house, c.sign));
  const occKeys = occupants.map((o) =>
    houseLibraryKey("occupant", o.house, o.planet)
  );
  const have = await getHouseLibraryEntries([...cuspKeys, ...occKeys]);

  const missingCusps = cusps.filter(
    (c) => !have.has(houseLibraryKey("cusp", c.house, c.sign))
  );
  const missingOccupants = occupants.filter(
    (o) => !have.has(houseLibraryKey("occupant", o.house, o.planet))
  );
  if (missingCusps.length === 0 && missingOccupants.length === 0) return have;

  for (const c of missingCusps) {
    try {
      const body = await generateHouseCuspEntry(c.house, c.sign);
      const key = houseLibraryKey("cusp", c.house, c.sign);
      await db
        .insert(houseInterpretationLibrary)
        .values({ key, kind: "cusp", house: c.house, subject: c.sign, body, model: HOUSE_LIBRARY_MODEL })
        .onConflictDoNothing();
      have.set(key, body);
    } catch (err) {
      console.warn(
        `[house-library] cusp generate failed for house ${c.house}/${c.sign}:`,
        (err as Error).message
      );
    }
  }
  for (const o of missingOccupants) {
    try {
      const body = await generateHouseOccupantEntry(o.house, o.planet);
      const key = houseLibraryKey("occupant", o.house, o.planet);
      await db
        .insert(houseInterpretationLibrary)
        .values({ key, kind: "occupant", house: o.house, subject: o.planet, body, model: HOUSE_LIBRARY_MODEL })
        .onConflictDoNothing();
      have.set(key, body);
    } catch (err) {
      console.warn(
        `[house-library] occupant generate failed for house ${o.house}/${o.planet}:`,
        (err as Error).message
      );
    }
  }
  return have;
}
