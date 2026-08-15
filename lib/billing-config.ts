/** Client-safe, country-aware product catalogue. Stripe IDs never come from clients. */

export type CreditPack = {
  id: "s" | "m" | "l";
  credits: number;
  amountMinor: number;
  currency: "gel" | "gbp";
};

export type PremiumPlan = {
  key: string;
  countryCode: string;
  amountMinor: number;
  currency: "gbp";
  interval: "month";
  stripeLookupKey: string;
};

const GE_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 1000, currency: "gel" },
  { id: "m", credits: 45, amountMinor: 2000, currency: "gel" },
  { id: "l", credits: 130, amountMinor: 5000, currency: "gel" },
];

/** UK one-time alternatives to the £9.99/month unlimited plan. */
const GB_CREDIT_PACKS: readonly CreditPack[] = [
  { id: "s", credits: 30, amountMinor: 299, currency: "gbp" },
  { id: "m", credits: 75, amountMinor: 599, currency: "gbp" },
  { id: "l", credits: 180, amountMinor: 1199, currency: "gbp" },
];

const CREDIT_PACKS_BY_COUNTRY: Record<string, readonly CreditPack[]> = {
  GB: GB_CREDIT_PACKS,
  GE: GE_CREDIT_PACKS,
};

export const PREMIUM_PLANS_BY_COUNTRY: Record<string, PremiumPlan> = {
  GB: {
    key: "premium_gb_monthly",
    countryCode: "GB",
    amountMinor: 999,
    currency: "gbp",
    interval: "month",
    stripeLookupKey: "vivida_premium_gb_monthly_999_v1",
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

export function formatBillingAmount(
  amountMinor: number,
  currency: string,
  locale: "ka" | "en" = "en",
): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "ka-GE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100);
}
