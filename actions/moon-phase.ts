"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { moonPhases, type MoonPhase } from "@/db/schema";
import {
  computeMoonPhase,
  utcDateString,
  type MoonPhaseSnapshot,
} from "@/lib/moon-phase";
import {
  MOON_PHASE_PROMPT_VERSION,
  OPENROUTER_MODEL,
  generateMoonPhaseReading,
  isOpenRouterConfigured,
} from "@/lib/openrouter";
import {
  getMoonPhaseLibraryEntry,
  saveMoonPhaseLibraryEntry,
} from "@/lib/moon-phase-library";
import { signByIndex } from "@/lib/zodiac";
import { englishMoonPhaseReading } from "@/lib/moon-phase-en";
import type { UserLocale } from "@/lib/i18n/user-locale";

export type MoonPhaseRow = MoonPhase & { snapshot: MoonPhaseSnapshot };

/**
 * Returns today's moon-phase row, generating + caching it on first request
 * of the day. Universal across users — one row per UTC date — so the cache
 * is shared globally. Returns the live snapshot alongside the row so the UI
 * can pull computed fields (signSymbol, etc.) without a second compute pass.
 *
 * Cache invalidates when MOON_PHASE_PROMPT_VERSION is bumped after a prompt
 * change.
 */
export async function ensureMoonPhase(
  locale: UserLocale = "ka",
): Promise<MoonPhaseRow | null> {
  const now = new Date();
  const snapshot = computeMoonPhase(now);
  if (!snapshot) return null;

  const today = utcDateString(now);

  if (locale === "en") {
    const reading = englishMoonPhaseReading(snapshot);
    return {
      date: today,
      phaseKey: snapshot.phaseKey,
      phaseLabelKa: snapshot.phaseLabelKa,
      signEn: snapshot.signEn,
      signKa: snapshot.signKa,
      signIndex: snapshot.signIndex,
      phaseAngle: snapshot.phaseAngle,
      illumination: snapshot.illumination,
      ageDays: snapshot.ageDays,
      headline: reading.headline,
      summary: reading.summary,
      body: reading.body,
      themes: reading.themes,
      promptVersion: MOON_PHASE_PROMPT_VERSION,
      model: "deterministic-en",
      language: "en",
      createdAt: now,
      snapshot,
    };
  }

  const [existing] = await db
    .select()
    .from(moonPhases)
    .where(eq(moonPhases.date, today))
    .limit(1);

  if (existing && existing.promptVersion === MOON_PHASE_PROMPT_VERSION) {
    return { ...existing, snapshot };
  }

  // Fast path: the reading is fully determined by (phase, sign), so copy
  // today's combo from the pre-generated library — no AI call.
  const signKey = signByIndex(snapshot.signIndex).key;
  let reading = await getMoonPhaseLibraryEntry(snapshot.phaseKey, signKey);
  let model = "library";

  if (!reading) {
    if (!isOpenRouterConfigured()) {
      // No API key — return what we have if anything, else null. The UI can
      // then render a placeholder using just the live snapshot.
      return existing ? { ...existing, snapshot } : null;
    }

    reading = await generateMoonPhaseReading({
      phaseLabelKa: snapshot.phaseLabelKa,
      phaseKey: snapshot.phaseKey,
      signKa: snapshot.signKa,
      signEn: snapshot.signEn,
      illumination: snapshot.illumination,
      ageDays: snapshot.ageDays,
      phaseAngle: snapshot.phaseAngle,
    });
    if (!reading) return existing ? { ...existing, snapshot } : null;
    model = OPENROUTER_MODEL;

    // Self-heal: this one-off reading IS the library entry for this combo —
    // save it so the same (phase, sign) never generates twice.
    void saveMoonPhaseLibraryEntry(
      snapshot.phaseKey,
      signKey,
      reading,
      OPENROUTER_MODEL
    ).catch(() => {});
  }

  const [inserted] = await db
    .insert(moonPhases)
    .values({
      date: today,
      phaseKey: snapshot.phaseKey,
      phaseLabelKa: snapshot.phaseLabelKa,
      signEn: snapshot.signEn,
      signKa: snapshot.signKa,
      signIndex: snapshot.signIndex,
      phaseAngle: snapshot.phaseAngle,
      illumination: snapshot.illumination,
      ageDays: snapshot.ageDays,
      headline: reading.headline,
      summary: reading.summary,
      body: reading.body,
      themes: reading.themes,
      promptVersion: MOON_PHASE_PROMPT_VERSION,
      model,
      language: "ka",
    })
    .onConflictDoUpdate({
      target: moonPhases.date,
      set: {
        phaseKey: snapshot.phaseKey,
        phaseLabelKa: snapshot.phaseLabelKa,
        signEn: snapshot.signEn,
        signKa: snapshot.signKa,
        signIndex: snapshot.signIndex,
        phaseAngle: snapshot.phaseAngle,
        illumination: snapshot.illumination,
        ageDays: snapshot.ageDays,
        headline: reading.headline,
        summary: reading.summary,
        body: reading.body,
        themes: reading.themes,
        promptVersion: MOON_PHASE_PROMPT_VERSION,
        model,
        language: "ka",
      },
    })
    .returning();

  return inserted ? { ...inserted, snapshot } : null;
}
