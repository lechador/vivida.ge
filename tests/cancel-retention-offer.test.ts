import { describe, expect, it } from "vitest";

import {
  cheaperAlternativePlan,
  monthlyAmountMinor,
  PREMIUM_PLANS_BY_COUNTRY,
  LOW_CREDIT_PROMO_PLAN,
  type PremiumPlan,
} from "@/lib/billing-config";

/**
 * The cancellation retention offer must never upsell.
 *
 * The Georgian catalogue mixes cadences: the promo is ₾29 per 3 months
 * (₾9.67/month) while the standard plan is ₾19.90/month. Comparing raw
 * `amountMinor` would rank the promo as the more expensive option and could
 * offer someone on ₾9.67/month a "cheaper" plan at ₾19.90. These tests pin the
 * per-month comparison that prevents that.
 */

const GE_MONTHLY = PREMIUM_PLANS_BY_COUNTRY.GE;

describe("monthlyAmountMinor", () => {
  it("spreads a multi-month cycle across its interval", () => {
    // ₾29.00 over 3 months = ₾9.6666…/month, the figure that makes the promo
    // cheaper than the ₾19.90 monthly plan.
    expect(monthlyAmountMinor(LOW_CREDIT_PROMO_PLAN)).toBeCloseTo(2900 / 3, 5);
  });

  it("leaves a monthly plan unchanged", () => {
    expect(monthlyAmountMinor(GE_MONTHLY)).toBe(1990);
  });

  it("treats a missing or zero interval as one month", () => {
    expect(monthlyAmountMinor({ amountMinor: 1000 })).toBe(1000);
    expect(monthlyAmountMinor({ amountMinor: 1000, intervalCount: 0 })).toBe(
      1000,
    );
  });
});

describe("cheaperAlternativePlan", () => {
  it("offers the quarterly promo to someone on the standard monthly plan", () => {
    const result = cheaperAlternativePlan({
      candidate: LOW_CREDIT_PROMO_PLAN,
      currentAmountMinor: GE_MONTHLY.amountMinor,
      currentCurrency: "gel",
    });

    expect(result?.key).toBe("promo_ge_quarterly");
  });

  it("does NOT offer a more expensive plan as a saving", () => {
    // The core regression: monthly cost must be compared, not headline price.
    const result = cheaperAlternativePlan({
      candidate: GE_MONTHLY,
      currentAmountMinor: LOW_CREDIT_PROMO_PLAN.amountMinor,
      currentIntervalMonths: 3,
      currentCurrency: "gel",
    });

    expect(result).toBeNull();
  });

  it("returns null when the candidate is the same plan the user is on", () => {
    const result = cheaperAlternativePlan({
      candidate: GE_MONTHLY,
      currentAmountMinor: GE_MONTHLY.amountMinor,
      currentCurrency: "gel",
    });

    expect(result).toBeNull();
  });

  it("ignores a difference too small to be a real saving", () => {
    // 4% cheaper falls inside the margin, so it is not dressed up as a deal.
    const slightlyCheaper: PremiumPlan = {
      ...GE_MONTHLY,
      key: "slightly_cheaper",
      amountMinor: Math.round(GE_MONTHLY.amountMinor * 0.96),
    };

    expect(
      cheaperAlternativePlan({
        candidate: slightlyCheaper,
        currentAmountMinor: GE_MONTHLY.amountMinor,
        currentCurrency: "gel",
      }),
    ).toBeNull();
  });

  it("accepts a genuinely cheaper plan beyond the margin", () => {
    const clearlyCheaper: PremiumPlan = {
      ...GE_MONTHLY,
      key: "clearly_cheaper",
      amountMinor: Math.round(GE_MONTHLY.amountMinor * 0.8),
    };

    expect(
      cheaperAlternativePlan({
        candidate: clearlyCheaper,
        currentAmountMinor: GE_MONTHLY.amountMinor,
        currentCurrency: "gel",
      })?.key,
    ).toBe("clearly_cheaper");
  });

  it("refuses to compare across currencies", () => {
    const result = cheaperAlternativePlan({
      candidate: LOW_CREDIT_PROMO_PLAN,
      currentAmountMinor: PREMIUM_PLANS_BY_COUNTRY.GB.amountMinor,
      currentCurrency: "gbp",
    });

    expect(result).toBeNull();
  });

  it("returns null for a missing candidate or a non-positive current price", () => {
    expect(
      cheaperAlternativePlan({
        candidate: null,
        currentAmountMinor: 1990,
        currentCurrency: "gel",
      }),
    ).toBeNull();

    expect(
      cheaperAlternativePlan({
        candidate: LOW_CREDIT_PROMO_PLAN,
        currentAmountMinor: 0,
        currentCurrency: "gel",
      }),
    ).toBeNull();
  });
});
