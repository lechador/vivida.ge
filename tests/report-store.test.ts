import { describe, expect, it } from "vitest";

import { SIGNUP_BONUS } from "@/lib/credits-config";
import {
  REPORT_BUNDLES,
  REPORT_PRODUCTS,
  bundleSavings,
  bundleRemainingPrice,
  reportEditionKey,
  type ReportBundleKey,
} from "@/lib/report-catalog";

describe("paid report store catalog", () => {
  it("keeps individual reports meaningfully above the free economy", () => {
    expect(REPORT_PRODUCTS.career.credits).toBe(18);
    expect(REPORT_PRODUCTS.timing.credits).toBe(20);
    expect(REPORT_PRODUCTS.annual.credits).toBe(25);
    expect(REPORT_PRODUCTS.relationship.credits).toBe(25);
    expect(Math.min(...Object.values(REPORT_BUNDLES).map((bundle) => bundle.credits))).toBeGreaterThan(SIGNUP_BONUS);
  });

  it("discounts every 2–3 report bundle without giving it away", () => {
    for (const key of Object.keys(REPORT_BUNDLES) as ReportBundleKey[]) {
      const bundle = REPORT_BUNDLES[key];
      expect(bundle.products.length).toBeGreaterThanOrEqual(2);
      expect(bundle.products.length).toBeLessThanOrEqual(3);
      expect(bundleSavings(key)).toBeGreaterThan(0);
      expect(bundle.credits).toBeGreaterThan(SIGNUP_BONUS);
    }
  });

  it("charges only the discounted share that is not already owned", () => {
    expect(bundleRemainingPrice("year_ahead", ["annual", "career", "timing"])).toBe(54);
    expect(bundleRemainingPrice("year_ahead", ["career"])).toBe(16);
    expect(bundleRemainingPrice("year_ahead", [])).toBe(0);
  });

  it("versions dated reports and keeps chart-based reports stable", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    expect(reportEditionKey("annual", now)).toBe("2026");
    expect(reportEditionKey("timing", now)).toBe("2026-08");
    expect(reportEditionKey("career", now, "chart-v2")).toBe("chart-v2");
    expect(reportEditionKey("relationship", now, "pair-v2", "partner-1")).toBe("partner-1:pair-v2");
  });
});
