/**
 * Product gate for the paid-report store. Launched 2026-09-05 (growth plan
 * P2 item 9): annual, relationship, career, and timing reports plus bundles
 * are live alongside the legacy natal PDF on /report.
 */
export const REPORT_STORE_VISIBLE = true;

export function canStartReportCheckout(input: {
  type: string | null;
  bundleKey: string | null;
}): boolean {
  return REPORT_STORE_VISIBLE || (!input.bundleKey && input.type === "natal");
}
