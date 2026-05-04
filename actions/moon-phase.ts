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
export async function ensureMoonPhase(): Promise<MoonPhaseRow | null> {
  const now = new Date();
  const snapshot = computeMoonPhase(now);
  if (!snapshot) return null;

  const today = utcDateString(now);

  const [existing] = await db
    .select()
    .from(moonPhases)
    .where(eq(moonPhases.date, today))
    .limit(1);

  if (existing && existing.promptVersion === MOON_PHASE_PROMPT_VERSION) {
    return { ...existing, snapshot };
  }

  if (!isOpenRouterConfigured()) {
    // No API key — return what we have if anything, else null. The UI can
    // then render a placeholder using just the live snapshot.
    return existing ? { ...existing, snapshot } : null;
  }

  const reading = await generateMoonPhaseReading({
    phaseLabelKa: snapshot.phaseLabelKa,
    phaseKey: snapshot.phaseKey,
    signKa: snapshot.signKa,
    signEn: snapshot.signEn,
    illumination: snapshot.illumination,
    ageDays: snapshot.ageDays,
    phaseAngle: snapshot.phaseAngle,
  });
  if (!reading) return existing ? { ...existing, snapshot } : null;

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
      model: OPENROUTER_MODEL,
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
        model: OPENROUTER_MODEL,
        language: "ka",
      },
    })
    .returning();

  return inserted ? { ...inserted, snapshot } : null;
}
