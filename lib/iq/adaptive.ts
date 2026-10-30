import { IQ_ITEMS, type IqDomain, type IqItem } from "@/lib/iq/items";
import { estimateTheta, THETA_MEAN } from "@/lib/iq/scoring";

/**
 * Adaptive item selection (computerised adaptive testing) for the IQ test.
 *
 * After each answer we re-estimate the taker's ability θ (EAP) from everything
 * they've done so far, then serve the item whose difficulty sits closest to θ,
 * for a Rasch item that's the most *informative* choice, so the test hones in
 * on ability fast. Strong takers get pulled up into the hard tier; weaker ones
 * settle onto items they can actually reason about. Fixed length so the taker
 * sees a determinate progress bar; scoring is difficulty-aware, not raw-count,
 * so seeing a different subset than someone else is fine.
 *
 * Runs entirely client-side (the bank already ships to the client for the local
 * score), so there's no per-item server round-trip.
 */

/** How many items each taker answers (a subset of the full bank). */
export const IQ_ADAPTIVE_LENGTH = 25;

/**
 * Content quota per domain across the administered set (sums to LENGTH). Without
 * it, a high-θ taker would be fed almost only numeric/pattern items (that's
 * where the hard tier lives); the quota guarantees every reasoning domain is
 * represented so the subscores mean something.
 */
const DOMAIN_TARGET: Record<IqDomain, number> = {
  numeric: 8,
  pattern: 8,
  logic: 5,
  spatial: 4,
};

/**
 * Display order for an item's options in one attempt: a deterministic
 * shuffle seeded by (attempt seed, item id), returning canonical option
 * indices in display order. The bank's authored order puts the correct
 * answer at index 1 in nearly half the items, so always picking the
 * second option scored 86, twenty points above honest guessing, before
 * this existed. Answers are always recorded by canonical index, so
 * scoring is untouched; only the on-screen position moves.
 */
export function optionOrderFor(
  itemId: string,
  seed: number,
  count: number,
): number[] {
  let h = seed >>> 0;
  for (let i = 0; i < itemId.length; i++)
    h = (h * 31 + itemId.charCodeAt(i)) >>> 0;
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Opening item: difficulty nearest THETA_MEAN (the calibrated ability that
 * maps to IQ 100), so the test starts neither trivial nor brutal before we
 * know anything about the taker. On the calibrated scale that mean sits at
 * θ ≈ 2, not at 0, the previous "closest to 0" opener was an easy item for
 * the typical taker.
 */
export function firstAdaptiveItem(): IqItem {
  return [...IQ_ITEMS].sort(
    (a, b) => Math.abs(a.b - THETA_MEAN) - Math.abs(b.b - THETA_MEAN),
  )[0];
}

/**
 * Pick the next item given what's been administered and whether each was
 * answered correctly. Returns null only if the bank is exhausted (shouldn't
 * happen before LENGTH, since every domain has more items than its quota).
 */
export function nextAdaptiveItem(
  administered: IqItem[],
  correct: boolean[],
): IqItem | null {
  const { theta } = estimateTheta(administered, correct);

  const seen = new Set(administered.map((i) => i.id));
  const count: Record<IqDomain, number> = {
    numeric: 0,
    logic: 0,
    spatial: 0,
    pattern: 0,
  };
  for (const it of administered) count[it.domain]++;

  const remaining = IQ_ITEMS.filter((it) => !seen.has(it.id));
  if (remaining.length === 0) return null;

  // Prefer domains still under quota; fall back to anything if all are met.
  const underQuota = remaining.filter(
    (it) => count[it.domain] < DOMAIN_TARGET[it.domain],
  );
  const pool = underQuota.length > 0 ? underQuota : remaining;

  // Closest difficulty to θ = most informative Rasch item.
  let best = pool[0];
  let bestGap = Math.abs(best.b - theta);
  for (const it of pool) {
    const gap = Math.abs(it.b - theta);
    if (gap < bestGap) {
      best = it;
      bestGap = gap;
    }
  }
  return best;
}
