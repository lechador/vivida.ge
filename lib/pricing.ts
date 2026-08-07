/**
 * Legacy plan shape kept while older component APIs are migrated to credits.
 *
 * Vivida no longer sells a recurring Pro subscription: paid actions use the
 * credit economy in `lib/credits-config.ts`. `getCurrentPlan()` therefore
 * always returns `free`; the `pro` union member remains temporarily so those
 * older component props can be removed incrementally without unsafe casts.
 */
export type PlanId = "free" | "pro";
