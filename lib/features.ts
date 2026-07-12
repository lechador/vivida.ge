import type { PlanId } from "./pricing";

/**
 * Feature gating — single source of truth for which features require Pro.
 *
 * The subscription/Pro model has been retired in favour of the credit system:
 * the former "Pro pillars" (audio, chat, timing, deep synastry, PDF report,
 * AI avatar) are now paid for with credits at their own call sites, so every
 * flag here is `false` and `canUseFeature()` always returns `true`. The
 * Feature type, PlanId, and `canUseFeature()` API are kept intact so a flag
 * can be flipped back to `true` if plan-based gating ever returns.
 */

export type Feature =
  | "aiSummary"        // AI-generated narrative summary on dashboard
  | "aiBigThree"       // AI-personalized Sun/Moon/Asc text
  | "aiHighlights"     // AI-generated chart highlights
  | "aiHouses"         // 12 houses section + interpretations
  | "aiAspects"        // Planetary aspects section + interpretations
  | "dailyHoroscope"   // Personalized daily reading
  | "weeklyForecast"   // 7-day AI forecast
  | "synastry"         // Unlimited compatibility / partner charts
  | "yearlyPdf"        // Downloadable yearly report
  | "adFree"           // No ads (placeholder until we ship ads)
  // ── The four Pro pillars (gated) ──
  | "audioHoroscope"   // Listen — ElevenLabs audio horoscopes
  | "chartChat"        // Ask — AI astrologer chat
  | "timing"           // Know-when — best-days timing calendar
  | "deepSynastry"     // Connect — deep AI compatibility report
  | "natalReport"      // Downloadable deep natal PDF report (now Pro-included)
  | "aiAvatar";        // AI-generated zodiac avatar (brand-styled)

const REQUIRES_PRO: Record<Feature, boolean> = {
  // Still free during the launch phase — flip to true to gate.
  aiSummary:       false,
  aiBigThree:      false,
  aiHighlights:    false,
  aiHouses:        false,
  aiAspects:       false,
  dailyHoroscope:  false,
  weeklyForecast:  false,
  synastry:        false,
  yearlyPdf:       false,
  adFree:          false,
  // Formerly Pro pillars — now credit-gated at their own call sites, so these
  // no longer depend on plan.
  audioHoroscope:  false,
  chartChat:       false,
  timing:          false,
  deepSynastry:    false,
  natalReport:     false,
  aiAvatar:        false,
};

export function requiresPro(feature: Feature): boolean {
  return REQUIRES_PRO[feature];
}

export function canUseFeature(feature: Feature, plan: PlanId): boolean {
  if (!requiresPro(feature)) return true;
  return plan === "pro";
}
