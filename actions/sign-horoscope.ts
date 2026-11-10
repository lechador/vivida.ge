// Server-only module, deliberately NOT a "use server" file: as a server
// action, any visitor could call ensureSignHoroscope with arbitrary dates and
// languages and run up unbounded AI generations.
import "server-only";

import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

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
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signFromLongitude } from "@/lib/zodiac";
import { claimGeneration, releaseGeneration } from "@/lib/generation-lock";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { PLANET_LABELS_PL } from "@/lib/openrouter";

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

const ASPECT_LABELS: Record<UserLocale, Record<string, string>> = {
  ka: {
    conjunction: "კონიუნქცია (გაერთიანება)",
    sextile: "სექსტილი (ჰარმონიული)",
    square: "კვადრატი (დაძაბული)",
    trine: "ტრინი (ჰარმონიული)",
    opposition: "ოპოზიცია (დაძაბული)",
  },
  en: {
    conjunction: "conjunction (merging)",
    sextile: "sextile (harmonious)",
    square: "square (tense)",
    trine: "trine (harmonious)",
    opposition: "opposition (tense)",
  },
  pl: {
    conjunction: "koniunkcja (połączenie)",
    sextile: "sekstyl (harmonijny)",
    square: "kwadratura (napięta)",
    trine: "trygon (harmonijny)",
    opposition: "opozycja (napięta)",
  },
};

const ELEMENT_LABELS: Record<string, { en: string; pl: string }> = {
  ცეცხლი: { en: "Fire", pl: "Ogień" },
  მიწა: { en: "Earth", pl: "Ziemia" },
  ჰაერი: { en: "Air", pl: "Powietrze" },
  წყალი: { en: "Water", pl: "Woda" },
};

const MODALITY_LABELS: Record<string, { en: string; pl: string }> = {
  კარდინალური: { en: "Cardinal", pl: "Kardynalny" },
  ფიქსირებული: { en: "Fixed", pl: "Stały" },
  მუტაბელური: { en: "Mutable", pl: "Zmienny" },
};

/** Georgian label → English planet key, for translating a sign's ruler. */
const PLANET_KEY_BY_KA = Object.fromEntries(
  Object.entries(PLANET_LABELS_KA).map(([key, ka]) => [ka, key]),
);

/** Georgian sign-meta field (element/modality/ruler) in the reading's language. */
function localizedMeta(
  value: string,
  table: Record<string, { en: string; pl: string }> | "planet",
  language: UserLocale,
): string {
  if (language === "ka") return value;
  if (table === "planet") {
    const key = PLANET_KEY_BY_KA[value];
    if (!key) return value;
    if (language === "pl") return PLANET_LABELS_PL[key] ?? key;
    return key[0].toUpperCase() + key.slice(1);
  }
  return table[value]?.[language] ?? value;
}

/**
 * Storage key. The table's primary key is (sign, period, periodKey) and
 * predates other languages, so English/Polish rows live under a prefixed key
 * ("en:2026-11-10") next to the untouched Georgian one; `language` mirrors it.
 */
export function signHoroscopeStorageKey(
  periodKey: string,
  language: UserLocale,
): string {
  return language === "ka" ? periodKey : `${language}:${periodKey}`;
}

/** Period label in the reading's language, quoted to the model. */
function periodLabelFor(
  now: Date,
  period: SignHoroscopePeriod,
  language: UserLocale,
): string {
  if (language === "ka") return signHoroscopePeriodLabel(now, period);
  const tag = language === "pl" ? "pl-PL" : "en-GB";
  const anchor = periodAnchorDate(now, period);
  if (period === "day") {
    return new Intl.DateTimeFormat(tag, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(anchor);
  }
  if (period === "month") {
    return new Intl.DateTimeFormat(tag, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(anchor);
  }
  const end = new Date(anchor);
  end.setUTCDate(end.getUTCDate() + 6);
  const dayMonth = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `${dayMonth.format(anchor)} – ${dayMonth.format(end)} ${end.getUTCFullYear()}`;
}

/**
 * Aspect string from a transiting body's longitude to the reader's
 * sun-sign center (sign index × 30° + 15°). One-line cue for the AI;
 * not used as authoritative astrology.
 */
function aspectToSignCenter(
  bodyLongitude: number,
  signIndex: number,
  language: UserLocale,
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
  return best ? ASPECT_LABELS[language][best.kind] : undefined;
}

/**
 * Resolve the cached horoscope row, generating + upserting on miss.
 * Returns null when OpenRouter isn't configured (callers render a
 * placeholder instead of erroring the page).
 */
async function ensureSignHoroscopeUncached(
  slug: ZodiacSlug,
  period: SignHoroscopePeriod,
  now: Date,
  language: UserLocale,
): Promise<SignHoroscope | null> {
  if (!(ALL_SLUGS as string[]).includes(slug)) return null;
  const periodKey = signHoroscopeStorageKey(
    signHoroscopePeriodKey(now, period),
    language,
  );

  const [existing] = await db
    .select()
    .from(signHoroscopes)
    .where(
      and(
        eq(signHoroscopes.sign, slug),
        eq(signHoroscopes.period, period),
        eq(signHoroscopes.periodKey, periodKey),
      ),
    )
    .limit(1);
  if (existing && existing.promptVersion === SIGN_HOROSCOPE_PROMPT_VERSION) {
    return existing;
  }

  if (!isOpenRouterConfigured()) return existing ?? null;

  // periodKey already carries the language prefix for en/pl.
  const lockKey = `sign-horoscope:${slug}:${period}:${periodKey}:v${SIGN_HOROSCOPE_PROMPT_VERSION}`;
  if (!(await claimGeneration(lockKey, 3 * 60 * 1000))) {
    return existing ?? null;
  }

  try {
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
      const aspect = aspectToSignCenter(pos.longitude, meta.index, language);
      transitFacts.push({
        planet: PLANET_LABELS_KA[key] ?? key,
        planetEn: key,
        planetPl: PLANET_LABELS_PL[key],
        signKa: transitSign.labelKa,
        signEn: transitSign.labelEn,
        signPl: transitSign.labelPl,
        aspectToReaderSign: aspect,
      });
    }

    const reading = await generateSignHoroscope({
      signKa: meta.labelKa,
      signEn: meta.labelEn,
      signPl: meta.labelPl,
      element: localizedMeta(meta.element, ELEMENT_LABELS, language),
      modality: localizedMeta(meta.modality, MODALITY_LABELS, language),
      ruler: localizedMeta(meta.ruler, "planet", language),
      period,
      periodLabel: periodLabelFor(now, period, language),
      transits: transitFacts,
      locale: language,
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
        language,
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
          eq(signHoroscopes.periodKey, periodKey),
        ),
      )
      .limit(1);
    return refreshed ?? null;
  } finally {
    await releaseGeneration(lockKey).catch(() => {});
  }
}

/** Thrown inside the cache scope so a failed generation is never cached. */
class NoSignHoroscope extends Error {}

const cachedSignHoroscope = unstable_cache(
  async (
    slug: ZodiacSlug,
    period: SignHoroscopePeriod,
    anchorIso: string,
    language: UserLocale,
  ) => {
    const row = await ensureSignHoroscopeUncached(
      slug,
      period,
      new Date(anchorIso),
      language,
    );
    // unstable_cache stores `null` like any value (for the full hour), which
    // would pin a transient AI failure. Thrown errors are not cached.
    if (!row) throw new NoSignHoroscope();
    return row;
  },
  ["sign-horoscope", String(SIGN_HOROSCOPE_PROMPT_VERSION)],
  { revalidate: 60 * 60 },
);

/**
 * Shared cross-request cache. Using the period anchor (rather than the current
 * timestamp) gives every request in the same day/week/month one cache key and
 * prevents crawler bursts from repeating the same DB/AI work. Only successful
 * readings are cached; a miss returns null and is retried on the next request.
 */
export async function ensureSignHoroscope(
  slug: ZodiacSlug,
  period: SignHoroscopePeriod,
  now: Date = new Date(),
  language: UserLocale = "ka",
): Promise<SignHoroscope | null> {
  const anchor = periodAnchorDate(now, period);
  try {
    return await cachedSignHoroscope(
      slug,
      period,
      anchor.toISOString(),
      language,
    );
  } catch (err) {
    if (err instanceof NoSignHoroscope) return null;
    throw err;
  }
}
