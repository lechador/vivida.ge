"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  signHoroscopes,
  type SignHoroscope,
  type SignHoroscopePeriod,
} from "@/db/schema";
import {
  generateSignHoroscope,
  isOpenRouterConfigured,
  OPENROUTER_MODEL,
  SIGN_HOROSCOPE_PROMPT_VERSION,
  type SignHoroscopeTransitFact,
} from "@/lib/openrouter";
import { computeTransits } from "@/lib/transits";
import { ASPECTS, angularDistance } from "@/lib/aspects";
import {
  periodAnchorDate,
  signHoroscopePeriodKey,
  signHoroscopePeriodLabel,
} from "@/lib/sign-horoscope";
import { ALL_SLUGS, signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { signFromLongitude } from "@/lib/zodiac";

/**
 * SEO daily/weekly/monthly horoscope per sun sign.
 *
 * - Universal (no natal chart). Computes transits once per period anchor
 *   (today UTC for "day", Monday for "week", first-of-month for "month"),
 *   then prompts the AI to narrate them for the given sign.
 * - Idempotent on (sign, period, periodKey, promptVersion). A concurrent
 *   first-request after the period rollover will trigger one generation;
 *   subsequent requests read the cached row.
 */

const PLANET_LABELS_KA: Record<string, string> = {
  sun: "მზე",
  moon: "მთვარე",
  mercury: "მერკური",
  venus: "ვენერა",
  mars: "მარსი",
  jupiter: "იუპიტერი",
  saturn: "სატურნი",
  uranus: "ურანი",
  neptune: "ნეპტუნი",
  pluto: "პლუტონი",
};

/** Bodies emphasized per period. Daily leans on fast-moving (Moon, Mercury,
 *  Venus, Mars); weekly adds the inner planets in full; monthly brings in
 *  Saturn/Jupiter as the slow-changing backdrop. */
const PERIOD_BODIES: Record<SignHoroscopePeriod, string[]> = {
  day: ["moon", "mercury", "venus", "mars", "sun"],
  week: ["moon", "mercury", "venus", "mars", "sun", "jupiter"],
  month: ["sun", "mercury", "venus", "mars", "jupiter", "saturn"],
};

const ASPECT_LABEL_KA: Record<string, string> = {
  conjunction: "კონიუნქცია (გაერთიანება)",
  sextile: "სექსტილი (ჰარმონიული)",
  square: "კვადრატი (დაძაბული)",
  trine: "ტრინი (ჰარმონიული)",
  opposition: "ოპოზიცია (დაძაბული)",
};

/**
 * Aspect string from a transiting body's longitude to the reader's
 * sun-sign center (sign index × 30° + 15°). One-line cue for the AI;
 * not used as authoritative astrology.
 */
function aspectToSignCenter(
  bodyLongitude: number,
  signIndex: number
): string | undefined {
  const signCenter = signIndex * 30 + 15;
  const d = angularDistance(bodyLongitude, signCenter);
  let best: { kind: string; orb: number } | null = null;
  for (const a of ASPECTS) {
    const orb = Math.abs(d - a.angle);
    if (orb <= a.orb && (!best || orb < best.orb)) {
      best = { kind: a.kind, orb };
    }
  }
  return best ? ASPECT_LABEL_KA[best.kind] : undefined;
}

/**
 * Resolve the cached horoscope row, generating + upserting on miss.
 * Returns null when OpenRouter isn't configured (callers render a
 * placeholder instead of erroring the page).
 */
export async function ensureSignHoroscope(
  slug: ZodiacSlug,
  period: SignHoroscopePeriod,
  now: Date = new Date()
): Promise<SignHoroscope | null> {
  if (!(ALL_SLUGS as string[]).includes(slug)) return null;
  const periodKey = signHoroscopePeriodKey(now, period);

  const [existing] = await db
    .select()
    .from(signHoroscopes)
    .where(
      and(
        eq(signHoroscopes.sign, slug),
        eq(signHoroscopes.period, period),
        eq(signHoroscopes.periodKey, periodKey)
      )
    )
    .limit(1);
  if (existing && existing.promptVersion === SIGN_HOROSCOPE_PROMPT_VERSION) {
    return existing;
  }

  if (!isOpenRouterConfigured()) return existing ?? null;

  const meta = signMetaBySlug(slug);
  if (!meta) return null;

  const anchor = periodAnchorDate(now, period);
  const transits = computeTransits(anchor);
  const bodyKeys = PERIOD_BODIES[period];

  const transitFacts: SignHoroscopeTransitFact[] = [];
  for (const key of bodyKeys) {
    const pos = transits[key];
    if (!pos) continue;
    const transitSign = signFromLongitude(pos.longitude);
    const aspect = aspectToSignCenter(pos.longitude, meta.index);
    transitFacts.push({
      planet: PLANET_LABELS_KA[key] ?? key,
      planetEn: key,
      signKa: transitSign.labelKa,
      signEn: transitSign.labelEn,
      aspectToReaderSign: aspect,
    });
  }

  const reading = await generateSignHoroscope({
    signKa: meta.labelKa,
    signEn: meta.labelEn,
    element: meta.element,
    modality: meta.modality,
    ruler: meta.ruler,
    period,
    periodLabel: signHoroscopePeriodLabel(now, period),
    transits: transitFacts,
  });

  if (!reading) return existing ?? null;

  await db
    .insert(signHoroscopes)
    .values({
      sign: slug,
      period,
      periodKey,
      headline: reading.headline,
      summary: reading.summary,
      body: reading.body,
      themes: reading.themes,
      promptVersion: SIGN_HOROSCOPE_PROMPT_VERSION,
      model: OPENROUTER_MODEL,
      language: "ka",
    })
    .onConflictDoUpdate({
      target: [
        signHoroscopes.sign,
        signHoroscopes.period,
        signHoroscopes.periodKey,
      ],
      set: {
        headline: reading.headline,
        summary: reading.summary,
        body: reading.body,
        themes: reading.themes,
        promptVersion: SIGN_HOROSCOPE_PROMPT_VERSION,
        model: OPENROUTER_MODEL,
      },
    });

  const [refreshed] = await db
    .select()
    .from(signHoroscopes)
    .where(
      and(
        eq(signHoroscopes.sign, slug),
        eq(signHoroscopes.period, period),
        eq(signHoroscopes.periodKey, periodKey)
      )
    )
    .limit(1);
  return refreshed ?? null;
}
