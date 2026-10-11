import { describe, expect, it } from "vitest";

import {
  USDC_CREDIT_PACKS,
  USDC_PREMIUM_PASS,
  usdcCreditPack,
} from "@/lib/crypto-config";
import { formatBillingAmount } from "@/lib/billing-config";

/**
 * Pins the USDC catalogue's shape invariants — the same guarantees the Stripe
 * markets carry: the per-credit rate improves with pack size, and the PRO
 * pass undercuts the largest pack (a pass must never cost more than buying
 * credits for the same month).
 */
describe("USDC crypto catalogue", () => {
  it("improves the per-credit rate as packs grow", () => {
    const rates = USDC_CREDIT_PACKS.map((p) => p.credits / p.amountMinor);
    for (let i = 1; i < rates.length; i += 1) {
      expect(rates[i]).toBeGreaterThan(rates[i - 1]);
    }
  });

  it("keeps the PRO pass under the largest pack", () => {
    const largest = USDC_CREDIT_PACKS[USDC_CREDIT_PACKS.length - 1];
    expect(USDC_PREMIUM_PASS.amountMinor).toBeLessThan(largest.amountMinor);
  });

  it("mirrors the US price points", () => {
    expect(USDC_CREDIT_PACKS).toEqual([
      { id: "s", credits: 30, amountMinor: 299 },
      { id: "m", credits: 75, amountMinor: 599 },
      { id: "l", credits: 180, amountMinor: 1199 },
    ]);
    expect(USDC_PREMIUM_PASS).toEqual({
      key: "premium_crypto_30d",
      days: 30,
      amountMinor: 999,
    });
  });

  it("resolves packs by id and rejects unknown ids", () => {
    expect(usdcCreditPack("m")).toEqual({
      id: "m",
      credits: 75,
      amountMinor: 599,
    });
    expect(usdcCreditPack("custom")).toBe(null);
    expect(usdcCreditPack(null)).toBe(null);
  });

  it("formats USDC amounts in both locales", () => {
    expect(formatBillingAmount(299, "usdc", "en")).toBe("2.99 USDC");
    expect(formatBillingAmount(999, "usdc", "ka")).toBe("9.99 USDC");
  });
});
