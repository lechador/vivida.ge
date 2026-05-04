import type { PlanId } from "./pricing";

/**
 * Feature gating — single source of truth for which features require Pro.
 *
 * During the build-out phase we keep everything available to all users so
 * we can polish the full experience. Before launch we'll flip individual
 * features to true here and the dashboard / actions will gate them.
 *
 * Flipping a flag to `true` is the only change required to lock a feature
 * — every consumer goes through `requiresPro()` / `canUseFeature()`.
 */

export type Feature =
  | "aiSummary"        // AI-generated narrative summary on dashboard
  | "aiBigThree"       // AI-personalized Sun/Moon/Asc text
  | "aiHighlights"     // AI-generated chart highlights
  | "dailyHoroscope"   // Personalized daily reading
  | "synastry"         // Compatibility / partner chart
  | "yearlyPdf"        // Downloadable yearly report
  | "adFree";          // No ads (placeholder until we ship ads)

const REQUIRES_PRO: Record<Feature, boolean> = {
  aiSummary:      false,
  aiBigThree:     false,
  aiHighlights:   false,
  dailyHoroscope: false,
  synastry:       false,
  yearlyPdf:      false,
  adFree:         false,
};

export function requiresPro(feature: Feature): boolean {
  return REQUIRES_PRO[feature];
}

export function canUseFeature(feature: Feature, plan: PlanId): boolean {
  if (!requiresPro(feature)) return true;
  return plan === "pro";
}
