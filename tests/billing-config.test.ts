import { describe, expect, it } from "vitest";

import {
  creditPackForCountry,
  creditPacksForCountry,
  formatBillingAmount,
  premiumPlanForCountry,
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

  it("never trusts a client-supplied pack", () => {
    expect(creditPackForCountry("GB", "custom")).toBeNull();
  });

  it("keeps the Georgian catalogue as the rollout fallback", () => {
    expect(creditPackForCountry("US", "s")).toEqual({
      id: "s",
      credits: 30,
      amountMinor: 690,
      currency: "gel",
    });
  });

  it.each(["GE", "GB"])(
    "makes every %s pack a better per-credit deal than the one below it",
    (country) => {
      const packs = creditPacksForCountry(country);
      const perUnit = packs.map((pack) => pack.credits / pack.amountMinor);
      expect(perUnit).toEqual([...perUnit].sort((a, b) => a - b));
      expect(new Set(perUnit).size).toBe(packs.length);
    },
  );

  it.each(["GE", "GB"])(
    "keeps %s PRO cheaper than the largest credit pack",
    (country) => {
      const plan = premiumPlanForCountry(country)!;
      const largest = creditPacksForCountry(country).at(-1)!;
      expect(largest.currency).toBe(plan.currency);
      expect(plan.amountMinor).toBeLessThan(largest.amountMinor);
    },
  );
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
    function ReducedIcu(this: unknown, _locales?: unknown, options?: Intl.NumberFormatOptions) {
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
