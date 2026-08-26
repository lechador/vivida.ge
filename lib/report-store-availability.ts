/**
 * Temporary product gate for the expanded paid-report store. Keep the store,
 * catalogue and generated report detail routes intact while the report content
 * is being expanded. The legacy natal PDF on /report remains available.
 */
export const REPORT_STORE_VISIBLE = false;

export function canStartReportCheckout(input: {
  type: string | null;
  bundleKey: string | null;
}): boolean {
  return REPORT_STORE_VISIBLE || (!input.bundleKey && input.type === "natal");
}
