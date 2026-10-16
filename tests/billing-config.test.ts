import { describe, expect, it } from "vitest";

import {
  creditPackForCountry,
  creditPacksForCountry,
  billingPeriodMonths,
  formatBillingAmount,
  LOW_CREDIT_PROMO_MONTHS,
  LOW_CREDIT_PROMO_PLAN,
  PREMIUM_PLANS_BY_COUNTRY,
  discountedPremiumPlanForCountry,
  featuredPremiumPlanForCountry,
  premiumPlanByKeyForCountry,
  premiumPlanSavingsPercent,
  monthlyPlanOffered,
  premiumPlanForCountry,
  PURCHASE_PROMOTION_CREDIT_THRESHOLD,
  shouldShowPurchasePromotion,
} from "@/lib/billing-config";

describe("country billing catalogue", () => {
  it("offers the UK £9.99 monthly PRO plan", () => {
    expect(premiumPlanForCountry("gb")).toEqual({
      key: "premium_gb_monthly",
      countryCode: "GB",
      amountMinor: 999,
      currency: "gbp",
      interval: "month",
      stripeLookupKey: "vivida_premium_gb_monthly_999_v1",
    });
  });

  it("offers the Georgian ₾19.90 monthly PRO plan", () => {
    expect(premiumPlanForCountry("ge")).toEqual({
      key: "premium_ge_monthly",
      countryCode: "GE",
      amountMinor: 1990,
      currency: "gel",
      interval: "month",
      stripeLookupKey: "vivida_premium_ge_monthly_1990_v1",
    });
  });

  it("prices each market in its own currency", () => {
    expect(premiumPlanForCountry("GE")!.currency).toBe("gel");
    expect(premiumPlanForCountry("GB")!.currency).toBe("gbp");
    expect(premiumPlanForCountry("US")!.currency).toBe("usd");
    expect(premiumPlanForCountry("CA")!.currency).toBe("cad");
    expect(premiumPlanForCountry("AU")!.currency).toBe("aud");
    expect(premiumPlanForCountry("NZ")!.currency).toBe("nzd");
    expect(premiumPlanForCountry("GE")!.amountMinor).not.toBe(
      premiumPlanForCountry("GB")!.amountMinor,
    );
  });

  it("uses UK-local credit packs for GB residents", () => {
    expect(creditPacksForCountry("GB")).toEqual([
      { id: "s", credits: 30, amountMinor: 299, currency: "gbp" },
      { id: "m", credits: 75, amountMinor: 599, currency: "gbp" },
      { id: "l", credits: 180, amountMinor: 1199, currency: "gbp" },
    ]);
  });

  it("uses Georgian-local credit packs for GE residents", () => {
    expect(creditPacksForCountry("GE")).toEqual([
      { id: "s", credits: 30, amountMinor: 690, currency: "gel" },
      { id: "m", credits: 75, amountMinor: 1490, currency: "gel" },
      { id: "l", credits: 180, amountMinor: 2990, currency: "gel" },
    ]);
  });

  it("offers the four dollar-market monthly PRO plans", () => {
    expect(premiumPlanForCountry("us")).toEqual({
      key: "premium_us_monthly",
      countryCode: "US",
      amountMinor: 999,
      currency: "usd",
      interval: "month",
      stripeLookupKey: "vivida_premium_us_monthly_999_v1",
    });
    expect(premiumPlanForCountry("CA")).toEqual({
      key: "premium_ca_monthly",
      countryCode: "CA",
      amountMinor: 1399,
      currency: "cad",
      interval: "month",
      stripeLookupKey: "vivida_premium_ca_monthly_1399_v1",
    });
    expect(premiumPlanForCountry("AU")).toEqual({
      key: "premium_au_monthly",
      countryCode: "AU",
      amountMinor: 1499,
      currency: "aud",
      interval: "month",
      stripeLookupKey: "vivida_premium_au_monthly_1499_v1",
    });
    expect(premiumPlanForCountry("NZ")).toEqual({
      key: "premium_nz_monthly",
      countryCode: "NZ",
      amountMinor: 1699,
      currency: "nzd",
      interval: "month",
      stripeLookupKey: "vivida_premium_nz_monthly_1699_v1",
    });
  });

  it("uses dollar-market credit packs for US/CA/AU/NZ residents", () => {
    expect(creditPacksForCountry("US")).toEqual([
      { id: "s", credits: 30, amountMinor: 299, currency: "usd" },
      { id: "m", credits: 75, amountMinor: 599, currency: "usd" },
      { id: "l", credits: 180, amountMinor: 1199, currency: "usd" },
    ]);
    expect(creditPacksForCountry("CA")).toEqual([
      { id: "s", credits: 30, amountMinor: 399, currency: "cad" },
      { id: "m", credits: 75, amountMinor: 799, currency: "cad" },
      { id: "l", credits: 180, amountMinor: 1599, currency: "cad" },
    ]);
    expect(creditPacksForCountry("AU")).toEqual([
      { id: "s", credits: 30, amountMinor: 499, currency: "aud" },
      { id: "m", credits: 75, amountMinor: 899, currency: "aud" },
      { id: "l", credits: 180, amountMinor: 1699, currency: "aud" },
    ]);
    expect(creditPacksForCountry("NZ")).toEqual([
      { id: "s", credits: 30, amountMinor: 599, currency: "nzd" },
      { id: "m", credits: 75, amountMinor: 999, currency: "nzd" },
      { id: "l", credits: 180, amountMinor: 1899, currency: "nzd" },
    ]);
  });

  it("never trusts a client-supplied pack", () => {
    expect(creditPackForCountry("GB", "custom")).toBeNull();
  });

  it("keeps the Georgian catalogue as the rollout fallback", () => {
    expect(creditPackForCountry("DE", "s")).toEqual({
      id: "s",
      credits: 30,
      amountMinor: 690,
      currency: "gel",
    });
    expect(premiumPlanForCountry("DE")).toEqual(PREMIUM_PLANS_BY_COUNTRY.GE);
    expect(premiumPlanForCountry(null)).toEqual(PREMIUM_PLANS_BY_COUNTRY.GE);
  });

  it.each(["GE", "GB", "AM", "US", "CA", "AU", "NZ"])(
    "makes every %s pack a better per-credit deal than the one below it",
    (country) => {
      const packs = creditPacksForCountry(country);
      const perUnit = packs.map((pack) => pack.credits / pack.amountMinor);
      expect(perUnit).toEqual([...perUnit].sort((a, b) => a - b));
      expect(new Set(perUnit).size).toBe(packs.length);
    },
  );

  it.each(["GE", "GB", "AM", "US", "CA", "AU", "NZ"])(
    "keeps %s PRO cheaper than the largest credit pack",
    (country) => {
      const plan = premiumPlanForCountry(country)!;
      const largest = creditPacksForCountry(country).at(-1)!;
      expect(largest.currency).toBe(plan.currency);
      expect(plan.amountMinor).toBeLessThan(largest.amountMinor);
    },
  );
});

describe("low-credit win-back promo", () => {
  it("bills ₾29 once per three months, not once per month", () => {
    expect(LOW_CREDIT_PROMO_PLAN.amountMinor).toBe(2900);
    expect(LOW_CREDIT_PROMO_PLAN.currency).toBe("gel");
    expect(LOW_CREDIT_PROMO_PLAN.interval).toBe("month");
    expect(LOW_CREDIT_PROMO_PLAN.intervalCount).toBe(LOW_CREDIT_PROMO_MONTHS);
    expect(LOW_CREDIT_PROMO_MONTHS).toBe(3);
  });

  it("keeps the standard monthly lookup stable for existing callers", () => {
    expect(premiumPlanForCountry("GE")!.key).toBe("premium_ge_monthly");
    expect(Object.values(PREMIUM_PLANS_BY_COUNTRY)).not.toContain(
      LOW_CREDIT_PROMO_PLAN,
    );
  });

  it("undercuts paying the standard Georgian rate for the same span", () => {
    const standard = premiumPlanForCountry("GE")!;
    expect(LOW_CREDIT_PROMO_PLAN.currency).toBe(standard.currency);
    expect(LOW_CREDIT_PROMO_PLAN.amountMinor).toBeLessThan(
      standard.amountMinor * LOW_CREDIT_PROMO_MONTHS,
    );
  });

  it("carries its own Stripe lookup key", () => {
    expect(LOW_CREDIT_PROMO_PLAN.stripeLookupKey).toBe(
      "vivida_promo_ge_quarterly_2900_v1",
    );
    expect(LOW_CREDIT_PROMO_PLAN.stripeLookupKey).not.toBe(
      premiumPlanForCountry("GE")!.stripeLookupKey,
    );
  });
});

describe("public discounted PRO plan", () => {
  it("features the quarterly ₾29 plan in Georgia", () => {
    expect(discountedPremiumPlanForCountry("GE")).toEqual(
      LOW_CREDIT_PROMO_PLAN,
    );
    expect(featuredPremiumPlanForCountry("GE")).toEqual(LOW_CREDIT_PROMO_PLAN);
  });

  it("keeps monthly PRO featured in markets without a quarterly plan", () => {
    expect(discountedPremiumPlanForCountry("GB")).toBeNull();
    expect(featuredPremiumPlanForCountry("GB")).toEqual(
      premiumPlanForCountry("GB"),
    );
    for (const market of ["US", "CA", "AU", "NZ"]) {
      expect(discountedPremiumPlanForCountry(market)).toBeNull();
      expect(featuredPremiumPlanForCountry(market)).toEqual(
        premiumPlanForCountry(market),
      );
    }
  });

  it("only resolves server-approved plans for the user's market", () => {
    expect(premiumPlanByKeyForCountry("GE", LOW_CREDIT_PROMO_PLAN.key)).toEqual(
      LOW_CREDIT_PROMO_PLAN,
    );
    expect(
      premiumPlanByKeyForCountry("GB", LOW_CREDIT_PROMO_PLAN.key),
    ).toBeNull();
    expect(premiumPlanByKeyForCountry("GE", "made_up_price")).toBeNull();
  });

  it("calculates the displayed discount against three monthly payments", () => {
    expect(
      premiumPlanSavingsPercent(
        premiumPlanForCountry("GE"),
        LOW_CREDIT_PROMO_PLAN,
      ),
    ).toBe(51);
  });
});

describe("purchase-promotion eligibility", () => {
  it("shows acquisition prompts below 25 credits", () => {
    expect(PURCHASE_PROMOTION_CREDIT_THRESHOLD).toBe(25);
    expect(shouldShowPurchasePromotion({ isPremium: false, balance: 24 })).toBe(
      true,
    );
  });

  it("suppresses acquisition prompts at 25 credits and above", () => {
    expect(shouldShowPurchasePromotion({ isPremium: false, balance: 25 })).toBe(
      false,
    );
    expect(
      shouldShowPurchasePromotion({ isPremium: false, balance: 180 }),
    ).toBe(false);
  });

  it("always suppresses acquisition prompts for PRO subscribers", () => {
    expect(shouldShowPurchasePromotion({ isPremium: true, balance: 0 })).toBe(
      false,
    );
  });
});

describe("billingPeriodMonths", () => {
  const at = (y: number, m: number, d = 1) => new Date(Date.UTC(y, m - 1, d));

  it("reads a monthly cycle as one month", () => {
    expect(billingPeriodMonths(at(2026, 1), at(2026, 2))).toBe(1);
    // February is the shortest cycle of the year and must not round to zero.
    expect(billingPeriodMonths(at(2026, 2), at(2026, 3))).toBe(1);
  });

  /** A quarter is 89–92 days depending on where it starts; all are 3 months. */
  it("reads every quarter in the year as three months", () => {
    for (let month = 1; month <= 12; month++) {
      const start = at(2026, month);
      const end = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 1),
      );
      expect(billingPeriodMonths(start, end)).toBe(3);
    }
  });

  it("never reports a cycle shorter than a month", () => {
    expect(billingPeriodMonths(at(2026, 1, 1), at(2026, 1, 2))).toBe(1);
  });
});

describe("formatBillingAmount", () => {
  it("writes Georgian prices with the lari symbol", () => {
    expect(formatBillingAmount(1990, "gel", "ka")).toBe("₾19.90");
    expect(formatBillingAmount(690, "gel", "ka")).toBe("₾6.90");
  });

  it("leaves the English catalogue as it was", () => {
    expect(formatBillingAmount(999, "gbp", "en")).toBe("£9.99");
    // Intl separates an ISO code from the digits with U+00A0, not a space.
    expect(formatBillingAmount(1990, "gel", "en")).toBe("GEL\u00A019.90");
  });

  it("writes the dollar markets unambiguously in both locales", () => {
    expect(formatBillingAmount(999, "usd", "en")).toBe("US$9.99");
    expect(formatBillingAmount(1399, "cad", "en")).toBe("CA$13.99");
    expect(formatBillingAmount(1499, "aud", "en")).toBe("A$14.99");
    expect(formatBillingAmount(1699, "nzd", "en")).toBe("NZ$16.99");
    expect(formatBillingAmount(999, "usd", "ka")).toBe("$9.99");
    expect(formatBillingAmount(1399, "cad", "ka")).toBe("CA$13.99");
    expect(formatBillingAmount(1499, "aud", "ka")).toBe("A$14.99");
    expect(formatBillingAmount(1699, "nzd", "ka")).toBe("NZ$16.99");
  });

  /**
   * The regression that matters: browsers carry no `ka` data and resolve the
   * locale to en-GB, so anything Intl decides *because* the locale is Georgian
   * renders differently there than it does under Node's full ICU, and React
   * fails hydration. Nothing Georgian may depend on that data being present.
   */
  it("does not depend on the runtime shipping Georgian locale data", () => {
    expect(Intl.NumberFormat.supportedLocalesOf(["ka-GE"])).not.toHaveLength(0);
    const georgianAware = formatBillingAmount(1990, "gel", "ka");

    const full = Intl.NumberFormat;
    // Stand in for a browser: every locale negotiation lands on en-GB.
    function ReducedIcu(
      this: unknown,
      _locales?: unknown,
      options?: Intl.NumberFormatOptions,
    ) {
      return new full("en-GB", options);
    }
    ReducedIcu.supportedLocalesOf = () => [];
    Intl.NumberFormat = ReducedIcu as unknown as typeof Intl.NumberFormat;
    try {
      expect(formatBillingAmount(1990, "gel", "ka")).toBe(georgianAware);
    } finally {
      Intl.NumberFormat = full;
    }
  });
});

describe("monthly PRO retirement (Georgia, owner decision 2026-10-16)", () => {
  it("no longer offers monthly PRO in Georgia", () => {
    expect(monthlyPlanOffered("GE")).toBe(false);
  });

  it("still offers monthly PRO in markets that did not retire it", () => {
    expect(monthlyPlanOffered("GB")).toBe(true);
    expect(monthlyPlanOffered("US")).toBe(true);
    // Unknown/missing country falls back to the Georgian catalogue for pricing,
    // so it must inherit the retirement too — otherwise a caller could resolve
    // the Georgian monthly plan for a market that has retired it.
    expect(monthlyPlanOffered(null)).toBe(false);
    expect(monthlyPlanOffered("ZZ")).toBe(false);
  });

  it("refuses to enrol anyone in the retired Georgian monthly plan", () => {
    // The server-side gate matters because a client can post any planKey.
    expect(premiumPlanByKeyForCountry("GE", "premium_ge_monthly")).toBeNull();
  });

  it("keeps the quarterly plan purchasable in Georgia", () => {
    expect(
      premiumPlanByKeyForCountry("GE", LOW_CREDIT_PROMO_PLAN.key)?.key,
    ).toBe(LOW_CREDIT_PROMO_PLAN.key);
    expect(featuredPremiumPlanForCountry("GE").key).toBe(
      LOW_CREDIT_PROMO_PLAN.key,
    );
  });

  it("keeps the monthly plan in the catalogue as the price anchor", () => {
    // The discounted saving is computed against it, and one grandfathered
    // subscriber is still on it. Removing the entry would break both.
    const anchor = premiumPlanForCountry("GE");
    expect(anchor.key).toBe("premium_ge_monthly");
    expect(anchor.stripeLookupKey).toBe("vivida_premium_ge_monthly_1990_v1");
    // And the saving is still derived, not hard-coded.
    expect(
      premiumPlanSavingsPercent(anchor, LOW_CREDIT_PROMO_PLAN),
    ).toBeGreaterThan(40);
  });

  it("does not block monthly enrolment in other markets", () => {
    expect(premiumPlanByKeyForCountry("GB", "premium_gb_monthly")?.key).toBe(
      "premium_gb_monthly",
    );
  });
});
