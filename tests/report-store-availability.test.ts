import { describe, expect, it } from "vitest";

import {
  canStartReportCheckout,
  REPORT_STORE_VISIBLE,
} from "@/lib/report-store-availability";

describe("temporary report-store gate", () => {
  it("keeps the expanded report store hidden", () => {
    expect(REPORT_STORE_VISIBLE).toBe(false);
  });

  it("blocks store reports and bundles while preserving the legacy natal PDF", () => {
    expect(canStartReportCheckout({ type: "annual", bundleKey: null })).toBe(false);
    expect(canStartReportCheckout({ type: null, bundleKey: "year_focus" })).toBe(false);
    expect(canStartReportCheckout({ type: "natal", bundleKey: null })).toBe(true);
  });
});
