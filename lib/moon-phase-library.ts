/**
 * Reusable moon-phase reading library, the moon counterpart of the transit
 * library. A moon-phase reading is collective (identical for every user) and
 * fully determined by (phase, moon sign): 8 × 12 = 96 combos, each storing
 * the complete reading shape (headline/summary/body/themes). ensureMoonPhase
 * copies today's combo from here instead of calling the model.
 *
 * Bulk seeding uses scripts/seed-moon-library.mjs (Vertex AI). The live
 * fallback path doubles as self-heal: when a combo is missing, the one-off
 * OpenRouter reading that fills today's row is also saved here, so the same
 * combo never generates twice.
 */

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { moonPhaseInterpretationLibrary } from "@/db/schema";
import type { MoonPhaseSnapshot, PhaseKey } from "./moon-phase";
import type { MoonPhaseReadingResult } from "./openrouter";
import type { UserLocale } from "./i18n/user-locale";
import { signByIndex } from "./zodiac";
import { englishMoonPhaseReading } from "./moon-phase-en";
import { polishMoonPhaseReading } from "./moon-phase-pl";

export function moonPhaseLibraryKey(phase: PhaseKey, sign: string): string {
  return `${phase}:${sign}`;
}

/** Pure read, never generates. Admin edits reflect on the next new day. */
export async function getMoonPhaseLibraryEntry(
  phase: PhaseKey,
  sign: string,
): Promise<MoonPhaseReadingResult | null> {
  const [row] = await db
    .select({
      headline: moonPhaseInterpretationLibrary.headline,
      summary: moonPhaseInterpretationLibrary.summary,
      body: moonPhaseInterpretationLibrary.body,
      themes: moonPhaseInterpretationLibrary.themes,
    })
    .from(moonPhaseInterpretationLibrary)
    .where(
      eq(moonPhaseInterpretationLibrary.key, moonPhaseLibraryKey(phase, sign)),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Returns localized moon phase reading:
 * - for "pl": deterministic Polish reading via `polishMoonPhaseReading`
 * - for "en": deterministic English reading via `englishMoonPhaseReading`
 * - for "ka": loads from the collective Georgian library
 */
export async function getLocalizedMoonPhaseReading(
  snapshot: MoonPhaseSnapshot,
  locale: UserLocale = "ka",
): Promise<MoonPhaseReadingResult | null> {
  if (locale === "pl") return polishMoonPhaseReading(snapshot);
  if (locale === "en") return englishMoonPhaseReading(snapshot);
  const signKey = signByIndex(snapshot.signIndex).key;
  return getMoonPhaseLibraryEntry(snapshot.phaseKey, signKey);
}

/**
 * Save a generated reading as the library entry for its combo (self-heal).
 * Never overwrites, seeded or curated rows win over one-off generations.
 */
export async function saveMoonPhaseLibraryEntry(
  phase: PhaseKey,
  sign: string,
  reading: MoonPhaseReadingResult,
  model: string,
): Promise<void> {
  await db
    .insert(moonPhaseInterpretationLibrary)
    .values({
      key: moonPhaseLibraryKey(phase, sign),
      phase,
      sign,
      headline: reading.headline,
      summary: reading.summary,
      body: reading.body,
      themes: reading.themes,
      model,
    })
    .onConflictDoNothing();
}
