import { describe, expect, it } from "vitest";

import { IQ_ITEMS, iqItemById } from "@/lib/iq/items";
import {
  IQ_ADAPTIVE_LENGTH,
  firstAdaptiveItem,
  nextAdaptiveItem,
  optionOrderFor,
} from "@/lib/iq/adaptive";
import {
  IQ_MIN_SCORED_ITEMS,
  THETA_MEAN,
  estimateTheta,
  isScorableIqAttempt,
  scoreIq,
} from "@/lib/iq/scoring";

function answersWhere(
  predicate: (b: number) => boolean,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of IQ_ITEMS) {
    out[it.id] = predicate(it.b)
      ? it.answer
      : (it.answer + 1) % it.options.length;
  }
  return out;
}

describe("IQ item bank", () => {
  it("has unique ids, in-range answers and at least four options per item", () => {
    expect(IQ_ITEMS.length).toBe(39);
    expect(new Set(IQ_ITEMS.map((i) => i.id)).size).toBe(IQ_ITEMS.length);
    for (const it of IQ_ITEMS) {
      expect(it.options.length).toBeGreaterThanOrEqual(4);
      expect(it.answer).toBeGreaterThanOrEqual(0);
      expect(it.answer).toBeLessThan(it.options.length);
      expect(Number.isFinite(it.b)).toBe(true);
    }
  });

  it("no longer contains the two items that measured nothing", () => {
    // Point-biserial ≈ 0.05 against the rest of the test in 881 real
    // attempts; the odd-one-out was passed by 12%, below the guessing floor.
    expect(iqItemById("l2")).toBeUndefined();
    expect(iqItemById("l4")).toBeUndefined();
  });

  it("covers every domain with enough items for the adaptive quotas", () => {
    const counts = new Map<string, number>();
    for (const it of IQ_ITEMS)
      counts.set(it.domain, (counts.get(it.domain) ?? 0) + 1);
    expect(counts.get("numeric")).toBeGreaterThanOrEqual(8);
    expect(counts.get("pattern")).toBeGreaterThanOrEqual(8);
    expect(counts.get("logic")).toBeGreaterThanOrEqual(5);
    expect(counts.get("spatial")).toBeGreaterThanOrEqual(4);
  });
});

describe("IQ scoring (calibrated Oct 2026)", () => {
  it("puts a perfect run at the top of the scale and a zero run at the bottom", () => {
    expect(scoreIq(answersWhere(() => true)).iq).toBe(145);
    expect(scoreIq(answersWhere(() => false)).iq).toBe(55);
  });

  it("scores an average pattern (items below the mean right, above it wrong) near 100", () => {
    const r = scoreIq(answersWhere((b) => b < THETA_MEAN));
    expect(r.iq).toBeGreaterThanOrEqual(90);
    expect(r.iq).toBeLessThanOrEqual(110);
    expect(r.total).toBe(IQ_ITEMS.length);
  });

  it("rewards a hard item more than an easy one", () => {
    const byDifficulty = [...IQ_ITEMS].sort((a, b) => a.b - b.b);
    const easiest = byDifficulty[0];
    const hardest = byDifficulty[byDifficulty.length - 1];
    // One correct answer, nothing else administered: the hard item must
    // lift the ability estimate further than the easy one.
    expect(estimateTheta([hardest], [true]).theta).toBeGreaterThan(
      estimateTheta([easiest], [true]).theta,
    );
    expect(scoreIq({ [hardest.id]: hardest.answer }).iq).toBeGreaterThan(
      scoreIq({ [easiest.id]: easiest.answer }).iq,
    );
  });

  it("always returns a range, percentile and four domain subscores", () => {
    const r = scoreIq(answersWhere((b) => b < THETA_MEAN));
    expect(r.range[0]).toBeLessThanOrEqual(r.iq);
    expect(r.range[1]).toBeGreaterThanOrEqual(r.iq);
    expect(r.percentile).toBeGreaterThanOrEqual(1);
    expect(r.percentile).toBeLessThanOrEqual(99);
    expect(r.domains).toHaveLength(4);
  });
});

describe("IQ attempt validity gate", () => {
  it("rejects partial runs and click-through completions", () => {
    expect(isScorableIqAttempt(IQ_MIN_SCORED_ITEMS - 1, 900)).toBe(false);
    expect(isScorableIqAttempt(10, 900)).toBe(false);
    expect(isScorableIqAttempt(25, 30)).toBe(false);
    expect(isScorableIqAttempt(25, 900)).toBe(true);
    expect(isScorableIqAttempt(25, null)).toBe(true);
  });
});

describe("IQ adaptive selection", () => {
  it("opens near the calibrated population mean, not near θ=0", () => {
    expect(Math.abs(firstAdaptiveItem().b - THETA_MEAN)).toBeLessThan(0.5);
  });

  it("never repeats an item and fills the spatial quota", () => {
    const administered = [firstAdaptiveItem()];
    const answers: Record<string, number> = {
      [administered[0].id]: administered[0].answer,
    };
    while (administered.length < IQ_ADAPTIVE_LENGTH) {
      const correct = administered.map((it) => answers[it.id] === it.answer);
      const next = nextAdaptiveItem(administered, correct);
      expect(next).not.toBeNull();
      if (!next) break;
      expect(administered.some((it) => it.id === next.id)).toBe(false);
      administered.push(next);
      answers[next.id] = (next.answer + 1) % next.options.length;
    }
    expect(administered).toHaveLength(IQ_ADAPTIVE_LENGTH);
    expect(administered.filter((i) => i.domain === "spatial")).toHaveLength(4);
  });
});

describe("IQ option shuffling", () => {
  it("is a deterministic permutation that varies by item and seed", () => {
    const a = optionOrderFor("n5", 42, 4);
    expect(a).toEqual(optionOrderFor("n5", 42, 4));
    expect([...a].sort((x, y) => x - y)).toEqual([0, 1, 2, 3]);
    const orders = new Set(
      [1, 2, 3, 4, 5].map((s) => optionOrderFor("n5", s, 4).join(",")),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it("spreads the correct answer across display positions over the bank", () => {
    // With a fixed seed, the authored "correct is usually second" bias must
    // not survive the shuffle: every display slot gets a fair share.
    const atSlot = [0, 0, 0, 0];
    for (const seed of [7, 123, 9999]) {
      for (const it of IQ_ITEMS) {
        const order = optionOrderFor(it.id, seed, it.options.length);
        const slot = order.indexOf(it.answer);
        if (slot < 4) atSlot[slot]++;
      }
    }
    for (const n of atSlot) expect(n).toBeGreaterThan(10);
  });
});
