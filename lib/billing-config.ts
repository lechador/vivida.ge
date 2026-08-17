/** Client-safe, country-aware product catalogue. Stripe IDs never come from clients. */

export type BillingCurrency = "gel" | "gbp" | "amd";

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
  stripeLookupKey: string;
};

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

const CREDIT_PACKS_BY_COUNTRY: Record<string, readonly CreditPack[]> = {
  AM: AM_CREDIT_PACKS,
  GB: GB_CREDIT_PACKS,
  GE: GE_CREDIT_PACKS,
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
};

export function normalizeCountryCode(value: string | null | undefined): string | null {
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
  return creditPacksForCountry(countryCode).find((pack) => pack.id === packId) ?? null;
}

export function premiumPlanForCountry(
  countryCode: string | null | undefined,
): PremiumPlan | null {
  const code = normalizeCountryCode(countryCode);
  return (code && PREMIUM_PLANS_BY_COUNTRY[code]) || null;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  gel: "₾",
  gbp: "£",
  amd: "֏",
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

  // Armenian has the same hazard Georgian does — browsers ship no `hy` locale
  // data either, so an Intl call under it resolves differently on the server
  // than in the client and React throws the markup away. Both get their symbol
  // attached here, over digits grouped by a locale every runtime has.
  if ((locale === "ka" || locale === "am") && symbol) {
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
