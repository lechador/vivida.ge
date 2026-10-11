/**
 * Client-safe catalogue for the USDC crypto rail (English site only).
 *
 * Mirrors the US Stripe catalogue's price points — packs 2.99 / 5.99 / 11.99,
 * PRO pass 9.99 — so the two rails never disagree about what something costs.
 * No Stripe IDs live here: the crypto rail prices everything in USDC, and the
 * amounts are plain cents of a dollar-pegged token (6-decimal base units via
 * lib/usdc-pure).
 */

export const USDC_CURRENCY = "usdc";

export type UsdcCreditPack = {
  id: "s" | "m" | "l";
  credits: number;
  /** USDC cents (299 = 2.99 USDC). */
  amountMinor: number;
};

/** Same ladder shape as every Stripe market: credits-per-cent rises with
 *  pack size, and the PRO pass undercuts the largest pack. */
export const USDC_CREDIT_PACKS: readonly UsdcCreditPack[] = [
  { id: "s", credits: 30, amountMinor: 299 },
  { id: "m", credits: 75, amountMinor: 599 },
  { id: "l", credits: 180, amountMinor: 1199 },
];

/**
 * One-time 30-day PRO pass. A crypto transfer cannot auto-renew, so this
 * replaces the subscription on the English site: the buyer pays once and
 * gets `days` of PRO. Buying again while active stacks (extends) the pass.
 */
export const USDC_PREMIUM_PASS = {
  key: "premium_crypto_30d",
  days: 30,
  /** USDC cents (999 = 9.99 USDC). */
  amountMinor: 999,
} as const;

export function usdcCreditPack(packId: unknown): UsdcCreditPack | null {
  return USDC_CREDIT_PACKS.find((pack) => pack.id === packId) ?? null;
}
