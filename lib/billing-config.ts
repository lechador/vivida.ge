/** Client-safe, country-aware product catalogue. Stripe IDs never come from clients. */

export type BillingCurrency =
  "gel" | "gbp" | "amd" | "usd" | "cad" | "aud" | "nzd";

export type CreditPack = {
  id: "s" | "m" | "l";
  credits: number;
  amountMinor: number;
  currency: BillingCurrency;
};

export type PremiumPlan = {
  key: string;
  countryCode: string;
  amountMinor: number;
  currency: BillingCurrency;
  interval: "month";
  /** Months per billing cycle. Absent means 1 — the standard monthly plans. */
  intervalCount?: number;
  stripeLookupKey: string;
};

/**
 * Acquisition prompts stop once a user has enough balance for a substantial
 * paid action. Dedicated billing pages remain available when they deliberately
 * choose to visit them.
 */
export const PURCHASE_PROMOTION_CREDIT_THRESHOLD = 25;

export function shouldShowPurchasePromotion({
  isPremium,
  balance,
}: {
  isPremium: boolean;
  balance: number;
}): boolean {
  return !isPremium && balance < PURCHASE_PROMOTION_CREDIT_THRESHOLD;
}

/**
 * Georgian one-time alternatives to the ₾19.90/month unlimited plan.
 *
 * Priced for the local market rather than converted from the UK sheet: the
 * previous ladder charged ₾50 for 130 credits (more, in absolute terms, than
 * the UK paid for 180) and got *worse* per credit as the pack grew — ₾20/45
 * was the weakest rung of the three. Credits per lari now rises with pack
 * size, and PRO undercuts the largest pack, same shape as GB.
 */
const GE_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 690, currency: "gel" },
  { id: "m", credits: 75, amountMinor: 1490, currency: "gel" },
  { id: "l", credits: 180, amountMinor: 2990, currency: "gel" },
];

/** UK one-time alternatives to the £9.99/month unlimited plan. */
const GB_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 299, currency: "gbp" },
  { id: "m", credits: 75, amountMinor: 599, currency: "gbp" },
  { id: "l", credits: 180, amountMinor: 1199, currency: "gbp" },
];

/**
 * Armenian one-time alternatives to the ֏2,990/month unlimited plan.
 *
 * The Georgian ladder converted at parity (~142 AMD to the lari) rather than
 * discounted — Armenia and Georgia sit within a few percent of each other on
 * GDP per capita, so the same real price is the right starting point. Shape is
 * preserved from GE and GB: credits per dram rises with pack size, and PRO
 * undercuts the largest pack.
 *
 * CAUTION: Stripe treats AMD as a two-decimal currency (it is absent from the
 * zero-decimal list), so these minor units are luma — 100 to the dram. ֏990 is
 * 99_000 here, not 990. Getting this wrong is a 100x pricing error.
 */
const AM_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 99_000, currency: "amd" },
  { id: "m", credits: 75, amountMinor: 219_000, currency: "amd" },
  { id: "l", credits: 180, amountMinor: 429_000, currency: "amd" },
];

/**
 * US one-time alternatives to the $9.99/month unlimited plan.
 *
 * Same shape as GB: credits per dollar rises with pack size, and PRO
 * undercuts the largest pack. All four dollar markets are standard
 * two-decimal Stripe currencies — amounts here are plain cents.
 */
const US_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 299, currency: "usd" },
  { id: "m", credits: 75, amountMinor: 599, currency: "usd" },
  { id: "l", credits: 180, amountMinor: 1199, currency: "usd" },
];

/** Canadian one-time alternatives to the CA$13.99/month unlimited plan. */
const CA_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 399, currency: "cad" },
  { id: "m", credits: 75, amountMinor: 799, currency: "cad" },
  { id: "l", credits: 180, amountMinor: 1599, currency: "cad" },
];

/** Australian one-time alternatives to the A$14.99/month unlimited plan. */
const AU_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 499, currency: "aud" },
  { id: "m", credits: 75, amountMinor: 899, currency: "aud" },
  { id: "l", credits: 180, amountMinor: 1699, currency: "aud" },
];

/** New Zealand one-time alternatives to the NZ$16.99/month unlimited plan. */
const NZ_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 599, currency: "nzd" },
  { id: "m", credits: 75, amountMinor: 999, currency: "nzd" },
  { id: "l", credits: 180, amountMinor: 1899, currency: "nzd" },
];

const CREDIT_PACKS_BY_COUNTRY: Record<string, readonly CreditPack[]> = {
  AM: AM_CREDIT_PACKS,
  AU: AU_CREDIT_PACKS,
  CA: CA_CREDIT_PACKS,
  GB: GB_CREDIT_PACKS,
  GE: GE_CREDIT_PACKS,
  NZ: NZ_CREDIT_PACKS,
  US: US_CREDIT_PACKS,
};

export const PREMIUM_PLANS_BY_COUNTRY: Record<string, PremiumPlan> = {
  AM: {
    key: "premium_am_monthly",
    countryCode: "AM",
    // ֏2,990/month — see AM_CREDIT_PACKS on the luma minor unit.
    amountMinor: 299_000,
    currency: "amd",
    interval: "month",
    stripeLookupKey: "vivida_premium_am_monthly_299000_v1",
  },
  GB: {
    key: "premium_gb_monthly",
    countryCode: "GB",
    amountMinor: 999,
    currency: "gbp",
    interval: "month",
    stripeLookupKey: "vivida_premium_gb_monthly_999_v1",
  },
  GE: {
    key: "premium_ge_monthly",
    countryCode: "GE",
    amountMinor: 1990,
    currency: "gel",
    interval: "month",
    stripeLookupKey: "vivida_premium_ge_monthly_1990_v1",
  },
  US: {
    key: "premium_us_monthly",
    countryCode: "US",
    amountMinor: 999,
    currency: "usd",
    interval: "month",
    stripeLookupKey: "vivida_premium_us_monthly_999_v1",
  },
  CA: {
    key: "premium_ca_monthly",
    countryCode: "CA",
    amountMinor: 1399,
    currency: "cad",
    interval: "month",
    stripeLookupKey: "vivida_premium_ca_monthly_1399_v1",
  },
  AU: {
    key: "premium_au_monthly",
    countryCode: "AU",
    amountMinor: 1499,
    currency: "aud",
    interval: "month",
    stripeLookupKey: "vivida_premium_au_monthly_1499_v1",
  },
  NZ: {
    key: "premium_nz_monthly",
    countryCode: "NZ",
    amountMinor: 1699,
    currency: "nzd",
    interval: "month",
    stripeLookupKey: "vivida_premium_nz_monthly_1699_v1",
  },
};

/**
 * Three months of PRO for ₾29. It started as a targeted win-back offer and is
 * now also the public discounted Georgian plan.
 *
 * A real quarterly Stripe subscription rather than a one-off grant, so every
 * existing entitlement path works untouched — syncPremiumSubscription writes
 * `premiumUntil` from the subscription's period end, which a 3-month interval
 * puts three months out, and the buyer can cancel from the billing portal like
 * any other subscriber. It renews at ₾29 per quarter, NOT at the ₾19.90
 * monthly rate, so this is a standing discount for as long as they stay.
 *
 * The plan stays separate from PREMIUM_PLANS_BY_COUNTRY so legacy callers that
 * explicitly need the standard monthly price keep receiving it. Public sales
 * surfaces opt into the discounted plan through the helpers below.
 */
export const LOW_CREDIT_PROMO_PLAN: PremiumPlan = {
  key: "promo_ge_quarterly",
  countryCode: "GE",
  amountMinor: 2900,
  currency: "gel",
  interval: "month",
  intervalCount: 3,
  stripeLookupKey: "vivida_promo_ge_quarterly_2900_v1",
};

/**
 * Public discounted PRO plan for Georgia.
 *
 * This intentionally reuses the battle-tested quarterly Stripe price that was
 * launched for the low-credit campaign. Keeping the key stable means existing
 * subscribers, webhook metadata, and billing-portal records continue to line
 * up while the offer becomes available across the product.
 */
export const DISCOUNTED_PREMIUM_PLANS_BY_COUNTRY: Partial<
  Record<string, PremiumPlan>
> = {
  GE: LOW_CREDIT_PROMO_PLAN,
};

/** Months of PRO one purchase of the promo buys — used in the offer copy. */
export const LOW_CREDIT_PROMO_MONTHS = 3;

/**
 * Months in one billing cycle, read back from a subscription's own period.
 *
 * Derived rather than stored: `premium_subscription` never recorded an
 * interval count (every plan was monthly when it was written), and the period
 * bounds Stripe already gives us are the authoritative answer for any cadence
 * without a migration. Rounded because months are not equal lengths — a
 * quarter spans 89 to 92 days depending on where in the year it starts.
 */
export function billingPeriodMonths(start: Date, end: Date): number {
  const days = (end.getTime() - start.getTime()) / 86_400_000;
  return Math.max(1, Math.round(days / 30.44));
}

export function normalizeCountryCode(
  value: string | null | undefined,
): string | null {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

/** Preserve the Georgian catalogue as the fallback while markets roll out. */
export function creditPacksForCountry(
  countryCode: string | null | undefined,
): readonly CreditPack[] {
  const code = normalizeCountryCode(countryCode);
  return (code && CREDIT_PACKS_BY_COUNTRY[code]) || GE_CREDIT_PACKS;
}

export function creditPackForCountry(
  countryCode: string | null | undefined,
  packId: unknown,
): CreditPack | null {
  return (
    creditPacksForCountry(countryCode).find((pack) => pack.id === packId) ??
    null
  );
}

/** Use Georgian PRO pricing until a country-specific market is launched. */
export function premiumPlanForCountry(
  countryCode: string | null | undefined,
): PremiumPlan {
  const code = normalizeCountryCode(countryCode);
  return (
    (code && PREMIUM_PLANS_BY_COUNTRY[code]) || PREMIUM_PLANS_BY_COUNTRY.GE
  );
}

/** The public multi-month deal for this market, when one is available. */
export function discountedPremiumPlanForCountry(
  countryCode: string | null | undefined,
): PremiumPlan | null {
  const code = normalizeCountryCode(countryCode);
  // Match the standard catalogue's Georgian fallback for markets that do not
  // yet have their own prices. Launched GB and AM keep their local plans.
  const market = code && PREMIUM_PLANS_BY_COUNTRY[code] ? code : "GE";
  return DISCOUNTED_PREMIUM_PLANS_BY_COUNTRY[market] ?? null;
}

/**
 * Resolve a user-selectable plan without trusting any client-supplied price.
 * Only plans belonging to the user's market can be returned.
 */
export function premiumPlanByKeyForCountry(
  countryCode: string | null | undefined,
  planKey: unknown,
): PremiumPlan | null {
  if (typeof planKey !== "string") return null;
  const standard = premiumPlanForCountry(countryCode);
  const discounted = discountedPremiumPlanForCountry(countryCode);
  return [standard, discounted].find((plan) => plan?.key === planKey) ?? null;
}

/** Prefer the discounted multi-month plan anywhere a single PRO price is shown. */
export function featuredPremiumPlanForCountry(
  countryCode: string | null | undefined,
): PremiumPlan {
  return (
    discountedPremiumPlanForCountry(countryCode) ??
    premiumPlanForCountry(countryCode)
  );
}

export function premiumPlanSavingsPercent(
  standard: PremiumPlan,
  discounted: PremiumPlan,
): number {
  const months = discounted.intervalCount ?? 1;
  const regularTotal = standard.amountMinor * months;
  if (regularTotal <= 0 || standard.currency !== discounted.currency) return 0;
  return Math.max(
    0,
    Math.round((1 - discounted.amountMinor / regularTotal) * 100),
  );
}

const CURRENCY_SYMBOL: Record<string, string> = {
  gel: "₾",
  gbp: "£",
  amd: "֏",
  usd: "$",
  cad: "CA$",
  aud: "A$",
  nzd: "NZ$",
};

/**
 * Currencies conventionally written without a fractional part.
 *
 * Distinct from Stripe's zero-decimal list: the dram *is* two-decimal to
 * Stripe (amounts are luma), but nobody prices in luma, so "֏2,990.00" reads
 * as a machine artefact. The minor unit stays 1/100 everywhere in the
 * catalogue; only the display drops the decimals.
 */
const WHOLE_UNIT_DISPLAY_CURRENCIES = new Set(["amd"]);

/**
 * Georgian prices that do not depend on the runtime's ICU data — the same
 * hazard lib/i18n/ka-date.ts exists for, in the money half of the UI.
 *
 * Node's full-ICU build formats GEL under `ka-GE` as "19,90 ₾"; browsers ship
 * no Georgian data at all, resolve the locale to en-GB, and render "GEL 19.90"
 * from the identical call. React saw the two disagree and discarded the server
 * markup on every card showing a lari price, so Georgian gets its symbol
 * attached here instead, over digits grouped by a locale both runtimes have.
 *
 * English stays on Intl — en-GB data is universal — leaving "£9.99" and the
 * explicit "GEL 19.90" (where ₾ would be unfamiliar) exactly as they were.
 */
import type { UserLocale } from "./i18n/user-locale";

export function formatBillingAmount(
  amountMinor: number,
  currency: string,
  locale: UserLocale = "en",
): string {
  const code = currency.toLowerCase();
  const symbol = CURRENCY_SYMBOL[code];
  const fractionDigits = WHOLE_UNIT_DISPLAY_CURRENCIES.has(code) ? 0 : 2;
  const amount = amountMinor / 100;

  // Card-direct buyers pay fiat USD (Privy converts behind the scenes), so
  // the English-site catalogue renders as dollars — not the USDC the chain
  // settles in. (On-chain amounts still use formatUsdc, which keeps "USDC".)
  if (code === "usdc") {
    const digits = new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `$${digits}`;
  }

  // Browsers ship no `ka` locale data, so an Intl call under it resolves
  // differently on the server than in the client and React throws the markup
  // away. Georgian gets its symbol attached here, over digits grouped by a
  // locale every runtime has.
  if (locale === "ka" && symbol) {
    const digits = new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
    // The dram sign follows the amount in Armenian usage; ₾ precedes it.
    return code === "amd" ? `${digits} ${symbol}` : `${symbol}${digits}`;
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
