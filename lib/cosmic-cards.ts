/**
 * The dashboard "ცის ბანქო" — daily flip card backed by real astro data.
 *
 * Three resolution paths, in order:
 *
 *   1. AI forecast: if a cached weekly forecast exists with today's row,
 *      use the AI-generated headline + advice. Pro path.
 *   2. Compute fallback: deterministically score today's transits against
 *      the user's natal chart (no AI). Picks a tilt-appropriate message
 *      from a small pool seeded by (userId, date) so it's consistent all
 *      day but varies tomorrow.
 *   3. Pure fallback: no natal chart yet (e.g., onboarding incomplete).
 *      Lightweight gentle nudge with no astro grounding.
 */

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, weeklyForecasts } from "@/db/schema";
import type { NatalChartJson } from "@/db/schema";
import { computeWeeklyForecast } from "./weekly-forecast";
import { ensureChartFor } from "@/actions/chart";

export type CosmicCardTilt = "harmonic" | "challenging" | "balanced";

export type CosmicCard = {
  /** Tone label that drives accent color in the UI. */
  tilt: CosmicCardTilt;
  emoji: string;
  /** Small caption above the body — e.g. "მთვარე სასწორში · ჰარმონიული დღე". */
  caption: string;
  /** Main message — 1-2 sentences. */
  body: string;
  /** Where the message came from, for telemetry / debug. */
  source: "ai" | "compute" | "fallback";
  /** Optional one-line advice on top of the body (AI path only). */
  advice?: string;
  /** Moon sign in Georgian if known. */
  moonSignKa: string | null;
};

/** FNV-1a 32-bit string hash — small, deterministic, no deps. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

const HARMONIC_LINES = [
  "ენერგია გაშლილია — დღეს დაიწყე ის, რასაც სხვა დღეს გადადებდი.",
  "ცა შენ გხვდება — გული მცირე ნაბიჯისთვის გელის.",
  "მცირე საქმე დღეს დიდს ფასობს — ფასი მერე მოვა, მცდელობა ახლა.",
  "ნაკადია — ვინც დღეს გელოდება, ადვილად ხვდები.",
  "სიხალისე ხელის ქვეშაა — ერთი ღია საუბარი ცას ცოცხლავს.",
  "გული ხილული ენით ლაპარაკობს — დღეს ვინც გესმის, შენი ცაა.",
];
const CHALLENGING_LINES = [
  "დღეს ცოტა შეჩერდი — სიჩქარე ფასს კარგავს, სიფრთხილე ფასობს.",
  "დაძაბულობა ერთი მცირე ჯიუტი მოლოდინიდან მოდის — შეცვალე და დაცხრება.",
  "ცა გხვდება, მაგრამ უნდა გადახარისხო პრიორიტეტი — სხვისი საქმე ჯერ კიდევ არ შენია.",
  "დაბალი ენერგიის დღე — მხოლოდ ერთი მცირე საქმე გააკეთე.",
  "სხვისი ემოცია არ წაიღო — დღეს გული მგრძნობიარეა, ფარი დაიდე.",
  "გადაწყვეტა ნუ ერგება დღეს — ხვალ უფრო სუფთად დაინახავ.",
];
const BALANCED_LINES = [
  "შერეული ცა — ნახევარი ნაკადი, ნახევარი დაკავშირება. დღეს რიტმი შენ ახდი.",
  "თხელი ხაზი ცას შორის — მიენდე ინტუიციას, არა მოლოდინს.",
  "ენერგია ცვალებადია — გრძნობას ენდე, არ აიძულო.",
  "ცის ნელი დღეა — ფიქრი მნიშვნელოვანია, მოქმედება — სელექციური.",
  "ერთი ნაბიჯი წინ, ერთი უკან — ჯერ კიდევ ვიხილავთ, რომელი მართალი იქნება.",
  "სიმშვიდე საქმეს არ გამორიცხავს — დღეს ერთი მცირე გადაწყვეტა საკმარისია.",
];

const TILT_EMOJI: Record<CosmicCardTilt, string[]> = {
  harmonic: ["🌟", "💞", "✨", "🌻", "🪴"],
  challenging: ["🌒", "🌪️", "🛡️", "🕯️", "🧭"],
  balanced: ["☯️", "🌗", "🤍", "🪶", "🌙"],
};

const TILT_LABEL: Record<CosmicCardTilt, string> = {
  harmonic: "ჰარმონიული დღე",
  challenging: "გამოწვევის დღე",
  balanced: "შერეული დღე",
};

function tiltFromScores(harmony: number, challenge: number): CosmicCardTilt {
  const total = harmony + challenge;
  if (total <= 0.001) return "balanced";
  const tilt = (harmony - challenge) / total;
  if (tilt > 0.18) return "harmonic";
  if (tilt < -0.18) return "challenging";
  return "balanced";
}

function pickFromPool<T>(pool: T[], seed: number): T {
  return pool[seed % pool.length];
}

export async function buildCosmicCard(
  userId: string,
  dateLocal: string
): Promise<CosmicCard> {
  const seed = hash(`${userId}|${dateLocal}`);

  // ── Path 1: cached AI forecast ────────────────────────────────────
  try {
    const [forecast] = await db
      .select()
      .from(weeklyForecasts)
      .where(eq(weeklyForecasts.userId, userId))
      .limit(1);

    if (forecast?.days?.length) {
      const today = forecast.days.find((d) => d.dateIso === dateLocal);
      if (today && (today.headline || today.advice)) {
        const tilt = tiltFromScores(today.harmonyScore, today.challengeScore);
        return {
          tilt,
          emoji: pickFromPool(TILT_EMOJI[tilt], seed),
          caption: `მთვარე ${today.moonSignKa}-ში · ${TILT_LABEL[tilt]}`,
          body:
            today.headline ||
            pickFromPool(linePoolFor(tilt), seed),
          advice: today.advice || undefined,
          source: "ai",
          moonSignKa: today.moonSignKa,
        };
      }
    }
  } catch {
    // Swallow — drop to compute path
  }

  // ── Path 2: deterministic compute (no AI) ─────────────────────────
  try {
    const [profile] = await db
      .select({ tz: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (profile?.tz) {
      const chart = await ensureChartFor(userId, "free");
      if (chart?.data) {
        const ctx = computeWeeklyForecast(
          chart.data as NatalChartJson,
          new Date(),
          profile.tz
        );
        const today = ctx[0];
        if (today) {
          const tilt = tiltFromScores(
            today.harmonyScore,
            today.challengeScore
          );
          return {
            tilt,
            emoji: pickFromPool(TILT_EMOJI[tilt], seed),
            caption: `მთვარე ${today.moonSignKa}-ში · ${TILT_LABEL[tilt]}`,
            body: pickFromPool(linePoolFor(tilt), seed),
            source: "compute",
            moonSignKa: today.moonSignKa,
          };
        }
      }
    }
  } catch {
    // Drop to fallback
  }

  // ── Path 3: pure fallback (onboarding incomplete) ─────────────────
  return {
    tilt: "balanced",
    emoji: "✨",
    caption: "ცის რიტმი",
    body: pickFromPool(BALANCED_LINES, seed),
    source: "fallback",
    moonSignKa: null,
  };
}

function linePoolFor(tilt: CosmicCardTilt): string[] {
  if (tilt === "harmonic") return HARMONIC_LINES;
  if (tilt === "challenging") return CHALLENGING_LINES;
  return BALANCED_LINES;
}

export const COSMIC_TILT_COLOR: Record<CosmicCardTilt, string> = {
  harmonic: "oklch(0.78 0.18 200)",   // cyan
  challenging: "oklch(0.72 0.22 350)", // pink
  balanced: "oklch(0.65 0.24 305)",    // violet
};
