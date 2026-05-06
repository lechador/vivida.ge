import type { PlanId } from "./pricing";

/**
 * Feature gating — single source of truth for which features require Pro.
 *
 * Every new signup gets 30 days of trialing Pro automatically, so these
 * gates only kick in after the trial expires. The pricing page mirrors
 * this list — keep them in sync.
 *
 * Flipping a flag to `true` is the only change required to lock a feature
 * — every consumer goes through `requiresPro()` / `canUseFeature()`.
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
  | "privateProfile"   // Hide profile from friend discovery
  | "yearlyPdf"        // Downloadable yearly report
  | "adFree";          // No ads (placeholder until we ship ads)

const REQUIRES_PRO: Record<Feature, boolean> = {
  aiSummary:       true,
  aiBigThree:      true,
  aiHighlights:    true,
  aiHouses:        true,
  aiAspects:       true,
  dailyHoroscope:  true,
  weeklyForecast:  true,
  synastry:        true,
  privateProfile:  true,
  yearlyPdf:       true,
  // Ads aren't shipped yet — leaving false until we have a Pro-only
  // suppression to actually skip.
  adFree:          false,
};

export function requiresPro(feature: Feature): boolean {
  return REQUIRES_PRO[feature];
}

export function canUseFeature(feature: Feature, plan: PlanId): boolean {
  if (!requiresPro(feature)) return true;
  return plan === "pro";
}
