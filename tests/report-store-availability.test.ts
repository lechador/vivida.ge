import { describe, expect, it } from "vitest";

import {
  canStartReportCheckout,
  REPORT_STORE_VISIBLE,
} from "@/lib/report-store-availability";

describe("report-store gate (launched 2026-09-05, growth plan P2 item 9)", () => {
  it("keeps the expanded report store visible", () => {
    expect(REPORT_STORE_VISIBLE).toBe(true);
  });

  it("allows store reports, bundles, and the legacy natal PDF", () => {
    expect(canStartReportCheckout({ type: "annual", bundleKey: null })).toBe(true);
    expect(canStartReportCheckout({ type: "relationship", bundleKey: null })).toBe(true);
    expect(canStartReportCheckout({ type: "career", bundleKey: null })).toBe(true);
    expect(canStartReportCheckout({ type: "timing", bundleKey: null })).toBe(true);
    expect(canStartReportCheckout({ type: null, bundleKey: "year_ahead" })).toBe(true);
    expect(canStartReportCheckout({ type: "natal", bundleKey: null })).toBe(true);
  });
});
