import type { PlanId } from "./pricing";

/**
 * Monthly cap on partner creations per plan. Counted across both active
 * and soft-deleted rows in the current calendar month so users can't
 * dodge the cap by deleting and re-creating.
 *
 * Lives outside actions/partners.ts because that file is "use server" —
 * which restricts exports to async functions only.
 *
 * The site is currently 100% free, so both plans share the same generous
 * cap. Tighten when paid plans come back.
 */
export const PARTNER_CAP_PER_MONTH: Record<PlanId, number> = {
  free: 50,
  pro: 50,
};
