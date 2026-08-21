/**
 * Store product catalogue for the app's in-app purchases.
 *
 * Client-safe (no DB imports), same split as credits-config vs credits, so a
 * client component can name a product without dragging server code in.
 *
 * These ids are configured in App Store Connect, Play Console and RevenueCat,
 * and they are **permanent**: both stores burn a product identifier forever
 * once it is used, so a typo here is not fixable by deleting and recreating.
 *
 * Pricing deliberately lives in the stores, not here. Apple and Google take one
 * product and let you set a price per storefront, so the GE/GB/AM ladders in
 * lib/billing-config.ts do not need porting — four products cover all three
 * countries. Nothing in this file should ever carry an amount.
 */

export const IAP_CREDIT_PRODUCTS = {
  "ge.vivida.credits.s": 30,
  "ge.vivida.credits.m": 75,
  "ge.vivida.credits.l": 180,
} as const satisfies Record<string, number>;

export type IapCreditProductId = keyof typeof IAP_CREDIT_PRODUCTS;

/** The one auto-renewable product, carrying the `pro` RevenueCat entitlement. */
export const IAP_PREMIUM_PRODUCT_ID = "ge.vivida.pro.monthly";

/**
 * `planKey` recorded on the entitlement row for a store subscription.
 * Distinct from the Stripe plan keys in billing-config so support can tell at
 * a glance which processor a PRO row came from — as can any later query.
 */
export const IAP_PREMIUM_PLAN_KEY = "premium_iap_monthly";

/**
 * How many credits a store product is worth, or null if it isn't a credit pack.
 *
 * The webhook maps product id → credits **here, on the server**. RevenueCat's
 * payload does carry the price, but a client-influenced quantity must never
 * decide how much we award.
 */
export function creditsForProduct(productId: string | null | undefined): number | null {
  if (!productId) return null;
  return (
    IAP_CREDIT_PRODUCTS[productId as IapCreditProductId] ??
    // Play appends the base plan to subscription ids ("id:base-plan"); credit
    // packs are one-time products and never carry a suffix, so an exact match
    // is right — but strip any suffix before giving up, in case a future pack
    // is modelled as a one-time product with an offer attached.
    IAP_CREDIT_PRODUCTS[productId.split(":")[0] as IapCreditProductId] ??
    null
  );
}

/** Is this the PRO subscription product (tolerating Play's base-plan suffix)? */
export function isPremiumProduct(productId: string | null | undefined): boolean {
  if (!productId) return false;
  return productId.split(":")[0] === IAP_PREMIUM_PRODUCT_ID;
}
