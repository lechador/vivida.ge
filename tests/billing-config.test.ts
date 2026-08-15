import { describe, expect, it } from "vitest";

import {
  creditPackForCountry,
  creditPacksForCountry,
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

  it("uses UK-local credit packs for GB residents", () => {
    expect(creditPacksForCountry("GB")).toEqual([
      { id: "s", credits: 30, amountMinor: 299, currency: "gbp" },
      { id: "m", credits: 75, amountMinor: 599, currency: "gbp" },
      { id: "l", credits: 180, amountMinor: 1199, currency: "gbp" },
    ]);
  });

  it("never trusts a client-supplied pack", () => {
    expect(creditPackForCountry("GB", "custom")).toBeNull();
  });

  it("keeps the Georgian catalogue as the rollout fallback", () => {
    expect(creditPackForCountry("US", "s")).toEqual({
      id: "s",
      credits: 30,
      amountMinor: 1000,
      currency: "gel",
    });
  });
});
