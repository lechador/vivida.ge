import { IQ_ITEMS, type IqDomain, type IqItem } from "@/lib/iq/items";
import { estimateTheta } from "@/lib/iq/scoring";

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
  numeric: 9,
  pattern: 8,
  logic: 5,
  spatial: 3,
};

/**
 * Opening item: difficulty nearest 0 (population-average ability), so the test
 * starts neither trivial nor brutal before we know anything about the taker.
 */
export function firstAdaptiveItem(): IqItem {
  return [...IQ_ITEMS].sort((a, b) => Math.abs(a.b) - Math.abs(b.b))[0];
}

/**
 * Pick the next item given what's been administered and whether each was
 * answered correctly. Returns null only if the bank is exhausted (shouldn't
 * happen before LENGTH, since every domain has more items than its quota).
 */
export function nextAdaptiveItem(
  administered: IqItem[],
  correct: boolean[]
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
    (it) => count[it.domain] < DOMAIN_TARGET[it.domain]
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
