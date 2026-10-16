/**
 * First-purchase offer experiment, pure config shared by client and server.
 *
 * Question: does a never-payer who hits a credit shortfall convert better
 * when the paywall leads with one concrete one-time result (the shipped
 * `single_offer`, e.g. "3 more tarot readings, ₾6.90") than with the older
 * generic credits-vs-PRO choice (`current_choice`)? Price and free quota are
 * identical in both arms; only the offer framing changes.
 *
 * Eligibility is never-payer only and is enforced server-side at assignment
 * time (the experiments API checks the payment ledger before creating an
 * assignment), so a user who pays mid-experiment keeps their assignment for
 * analysis but no payer is ever newly enrolled. The primary outcome,
 * `purchase_completed`, is recorded only from the Stripe webhook against
 * server-confirmed payments, never from browser success pages.
 */
import { EXPERIMENTS } from "@/lib/experiment-catalog";

export const FIRST_PURCHASE_EXPERIMENT = EXPERIMENTS.firstPurchaseOffer;

export const FIRST_PURCHASE_VARIANTS = [
  "current_choice",
  "single_offer",
] as const;
export type FirstPurchaseVariant = (typeof FIRST_PURCHASE_VARIANTS)[number];

export function isFirstPurchaseVariant(
  value: string | null | undefined,
): value is FirstPurchaseVariant {
  return value === "current_choice" || value === "single_offer";
}

/** Enrollment gate, evaluated before any assignment row is created. */
export function firstPurchaseEligible(input: {
  authenticated: boolean;
  hasEverPaid: boolean;
  isPremium: boolean;
}): boolean {
  return input.authenticated && !input.hasEverPaid && !input.isPremium;
}

/**
 * Render rule for the paywall: only an explicit control assignment gets the
 * legacy generic choice. Treatment, still-loading, and ineligible users
 * (payers, who are never enrolled) all keep the single-offer framing.
 */
export function showSingleOffer(variant: string | null | undefined): boolean {
  return variant !== "current_choice";
}
