import type { PlanId } from "./pricing";

/**
 * Monthly cap on partner creations per plan. Counted across both active
 * and soft-deleted rows in the current calendar month so users can't
 * dodge the cap by deleting and re-creating.
 *
 * Lives outside actions/partners.ts because that file is "use server" —
 * which restricts exports to async functions only.
 */
export const PARTNER_CAP_PER_MONTH: Record<PlanId, number> = {
  free: 1,
  pro: 10,
};
