import type { PlanId } from "./pricing";

/**
 * Feature gating — single source of truth for which features require Pro.
 *
 * The site is currently 100% free while we focus on the mobile app launch.
 * Every flag is `false` so `canUseFeature()` always returns `true`. The
 * Feature type, PlanId, and `canUseFeature()` API are intentionally kept
 * intact so flipping any flag back to `true` is the only change required to
 * re-enable Pro gating when paid plans return.
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
  | "deepSynastry";    // Connect — deep AI compatibility report

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
  // The premium pillars — Pro only.
  audioHoroscope:  true,
  chartChat:       true,
  timing:          true,
  deepSynastry:    true,
};

export function requiresPro(feature: Feature): boolean {
  return REQUIRES_PRO[feature];
}

export function canUseFeature(feature: Feature, plan: PlanId): boolean {
  if (!requiresPro(feature)) return true;
  return plan === "pro";
}
