/**
 * Single source of truth for plan catalog. Used by:
 *  - /pricing page (display)
 *  - /api/flitt/checkout (amount validation)
 *  - dashboard paywall labels
 *
 * Prices in tetri (1 GEL = 100 tetri). Mirror of how Stripe stores cents.
 */

export type PlanId = "free" | "pro";
export type IntervalId = "month" | "year";

export type FeatureRow = {
  /** Short label shown in the comparison table. Georgian. */
  label: string;
  free: boolean | string;
  pro: boolean | string;
};

export type PlanDef = {
  id: PlanId;
  /** Public-facing name (Georgian). */
  name: string;
  tagline: string;
  ctaLabel: string;
  /** Price in tetri (₾). Free is 0. */
  price: Record<IntervalId, number>;
};

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "უფასო",
    tagline: "დაიწყე — შენი პირველი კოსმიური რუკა.",
    ctaLabel: "უკვე იყენებ",
    price: { month: 0, year: 0 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "შენი სრული, პერსონალური კოსმოსი — ყოველდღე, ყოველთვის.",
    ctaLabel: "გადადი Pro-ზე",
    price: {
      month: 1990, // ₾19.90
      year: 19900, // ₾199.00 (10 თვის ფასი — 2 თვე უფასოდ)
    },
  },
};

/**
 * Comparison table rows shown on the pricing page.
 *
 * Mirror of `lib/features.ts` — when you flip a flag there, update the
 * matching row here so the marketing page doesn't lie about what the
 * code actually gates.
 */
export const FEATURES: FeatureRow[] = [
  {
    label: "ნატალური რუკის შედგენა",
    free: true,
    pro: true,
  },
  {
    label: "მზე / მთვარე / ამომავალი",
    free: true,
    pro: true,
  },
  {
    label: "პლანეტების სრული განლაგება",
    free: true,
    pro: true,
  },
  {
    label: "მთვარის ფაზა — დღევანდელი",
    free: true,
    pro: true,
  },
  {
    label: "მეგობრების აღმოჩენა (Discover)",
    free: true,
    pro: true,
  },
  {
    label: "დიდი სამეულის AI ანალიზი",
    free: false,
    pro: true,
  },
  {
    label: "პერსონალური AI ნარატივი მთელ რუკაზე",
    free: false,
    pro: true,
  },
  {
    label: "რუკის უნიკალური აქცენტები (AI)",
    free: false,
    pro: true,
  },
  {
    label: "12 სახლი — სრული ახსნა",
    free: false,
    pro: true,
  },
  {
    label: "პლანეტთა ასპექტების ახსნა",
    free: false,
    pro: true,
  },
  {
    label: "ყოველდღიური პერსონალური ჰოროსკოპი",
    free: false,
    pro: true,
  },
  {
    label: "კვირეული პერსონალური ფორექასტი",
    free: false,
    pro: true,
  },
  {
    label: "თავსებადობა (სინასტრია) საყვარელ ადამიანებთან",
    free: "1 პარტნიორი თვეში",
    pro: "ულიმიტო",
  },
  {
    label: "ნატალური ანგარიში (PDF)",
    free: false,
    pro: true,
  },
  {
    label: "ჰოროსკოპის მოსმენა (აუდიო)",
    free: false,
    pro: true,
  },
  {
    label: "ჰკითხე ვარსკვლავებს — AI ასტროლოგი ჩატი",
    free: false,
    pro: true,
  },
  {
    label: "საუკეთესო დღეები — პერსონალური დროის კალენდარი",
    free: false,
    pro: true,
  },
  {
    label: "ღრმა AI თავსებადობის ანგარიში",
    free: false,
    pro: true,
  },
];

/** Curated Pro highlights for the subscription page (Georgian). */
export const PRO_HIGHLIGHTS: string[] = [
  "ჰკითხე ვარსკვლავებს — AI ასტროლოგი, რომელიც შენს რუკას იცნობს",
  "ჰოროსკოპის მოსმენა ხმით (აუდიო)",
  "საუკეთესო დღეები — პერსონალური დროის კალენდარი",
  "ღრმა AI თავსებადობის ანგარიში ნებისმიერ ადამიანთან",
  "სრული ნატალური რუკის AI ანალიზი — 12 სახლი, ასპექტები, ყველა პლანეტა",
  "ყოველდღიური და კვირეული პერსონალური ჰოროსკოპი",
  "ნატალური რუკის ანგარიში PDF-ში",
];

/** Format tetri as "₾12.90" */
export function formatPrice(tetri: number): string {
  if (tetri === 0) return "უფასო";
  const lari = tetri / 100;
  return `₾${lari.toFixed(2)}`;
}

/**
 * Effective monthly price for either interval (so we can show
 * "₾16.59/თვეში" under the yearly toggle).
 */
export function effectiveMonthlyPrice(planId: PlanId, interval: IntervalId): number {
  const tetri = PLANS[planId].price[interval];
  return interval === "year" ? Math.round(tetri / 12) : tetri;
}

export function yearlySavingsPercent(planId: PlanId): number {
  const monthly = PLANS[planId].price.month;
  const yearly = PLANS[planId].price.year;
  if (!monthly || !yearly) return 0;
  const fullYear = monthly * 12;
  return Math.round(((fullYear - yearly) / fullYear) * 100);
}
