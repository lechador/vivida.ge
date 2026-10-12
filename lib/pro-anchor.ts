import {
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
  type BillingCurrency,
} from "./billing-config";

/** Below this 30-day spend the line stays hidden, not a real pattern yet. */
export const PRO_ANCHOR_MIN_SPEND = 10;

export type ProAnchorKind = "saves" | "pace";

export type ProAnchor = {
  kind: ProAnchorKind;
  /** Credits consumed in the trailing window. */
  spendCredits: number;
  /** Spend valued at the market's best per-credit pack rate, minor units. */
  spendCashMinor: number;
  /** Featured PRO plan as a monthly equivalent, minor units. */
  proMonthlyMinor: number;
  /** Positive only for "saves": what PRO would have kept in pocket. */
  saveMinor: number;
  currency: BillingCurrency;
};

/**
 * Anchor PRO against the user's real trailing spend. Spend is valued at the
 * best per-credit pack rate (conservative, small-pack buyers paid more) and
 * compared against the featured plan's monthly equivalent, so multi-month
 * deals anchor honestly instead of against the legacy monthly sticker.
 *
 * Returns null when there is no meaningful spend to anchor against.
 */
export function proAnchorFor(
  spendCredits: number,
  countryCode: string | null | undefined,
): ProAnchor | null {
  if (!Number.isFinite(spendCredits) || spendCredits < PRO_ANCHOR_MIN_SPEND) {
    return null;
  }
  const packs = creditPacksForCountry(countryCode);
  const bestRate = Math.min(...packs.map((p) => p.amountMinor / p.credits));
  if (!Number.isFinite(bestRate) || bestRate <= 0) return null;
  const pro = featuredPremiumPlanForCountry(countryCode);
  const months = pro.intervalCount ?? 1;
  const proMonthlyMinor = Math.round(pro.amountMinor / months);
  const spendCashMinor = Math.round(spendCredits * bestRate);
  const saveMinor = spendCashMinor - proMonthlyMinor;
  return {
    kind: saveMinor > 0 ? "saves" : "pace",
    spendCredits: Math.round(spendCredits),
    spendCashMinor,
    proMonthlyMinor,
    saveMinor: Math.max(0, saveMinor),
    currency: pro.currency,
  };
}
