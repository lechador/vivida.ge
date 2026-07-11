import {
  IQ_ITEMS,
  DOMAIN_LABELS_KA,
  type IqDomain,
  type IqItem,
} from "@/lib/iq/items";

/**
 * IQ scoring — the same shape a professional test uses, scaled to what an
 * online single-sitting can honestly claim.
 *
 * 1. Ability θ is estimated with a Rasch (1-parameter IRT) model from the
 *    *pattern* of right/wrong against each item's difficulty `b` — getting a
 *    hard item right lifts θ more than getting an easy one right. (Bayesian EAP,
 *    which stays finite at the extremes instead of running off to ±∞.)
 * 2. θ is placed on the deviation-IQ scale: IQ = 100 + 15·(θ − θ_mean)/σθ, where
 *    θ_mean and σθ are FIXED constants (not the mean difficulty of the items a
 *    given person saw), so static and adaptive runs share one scale.
 * 3. We report a *range* (± the measurement error from the test information),
 *    a percentile from the normal curve, a band, and per-domain subscores.
 *
 * ⚠️ The θ→IQ mapping (σθ, θ₀) is provisional — calibrated from item difficulty,
 * not a norming sample. Once enough real responses accumulate we re-derive both
 * from the actual score distribution (see the self-norming note in the admin).
 */

// θ→IQ mapping constants. FIXED — deliberately NOT derived from which items a
// taker saw, so a full-bank (static) run and an adaptive subset land on the
// same scale. Provisional until self-norming replaces them from real data.
const THETA_MEAN = 0.55; // ability in logits that maps to IQ 100
const THETA_SD = 1.05; // logits per 15-point (1-SD) IQ block
const PRIOR_SD = 2.0; // EAP prior N(0, PRIOR_SD), in logits
const IQ_MIN = 55;
const IQ_MAX = 145;

export type IqBandKey = "very_high" | "high" | "above" | "average" | "below" | "low";

export type IqDomainScore = {
  domain: IqDomain;
  labelKa: string;
  correct: number;
  total: number;
  /** 0–100 percent correct within the domain. */
  pct: number;
};

export type IqResult = {
  iq: number;
  /** [low, high] confidence band (± measurement error). */
  range: [number, number];
  /** Percent of the population scored at or below this IQ (1–99). */
  percentile: number;
  /** For high scorers: "top X%". 100 − percentile, clamped ≥1. */
  topPercent: number;
  band: { key: IqBandKey; labelKa: string; descKa: string };
  correct: number;
  total: number;
  theta: number;
  domains: IqDomainScore[];
};

// ── math helpers ─────────────────────────────────────────────────────────────
function erf(x: number): number {
  // Abramowitz–Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
function normCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function p1pl(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)));
}

/**
 * Bayesian (EAP) ability estimate: the posterior mean of θ under a Rasch
 * likelihood and a N(0, PRIOR_SD) prior, computed by grid integration. Chosen
 * over plain MLE because it stays finite and smooth for perfect / near-perfect
 * runs (MLE runs off to ±∞ there, which produced a cliff at the top of the
 * scale) and because a stable interim estimate is exactly what the adaptive
 * selector needs after only a handful of answers. Also returns Fisher test
 * information at the estimate, for the measurement-error band.
 */
export function estimateTheta(
  items: IqItem[],
  correct: boolean[]
): { theta: number; info: number } {
  let num = 0;
  let den = 0;
  for (let t = -5; t <= 5; t += 0.05) {
    let like = Math.exp(-(t * t) / (2 * PRIOR_SD * PRIOR_SD)); // prior
    for (let i = 0; i < items.length; i++) {
      const p = p1pl(t, items[i].b);
      like *= correct[i] ? p : 1 - p;
    }
    num += t * like;
    den += like;
  }
  const theta = den > 0 ? num / den : 0;
  let info = 0;
  for (const it of items) {
    const p = p1pl(theta, it.b);
    info += p * (1 - p);
  }
  return { theta, info };
}

const BANDS: Record<IqBandKey, { labelKa: string; descKa: string }> = {
  very_high: {
    labelKa: "ძალიან მაღალი",
    descKa: "მოსახლეობის მხოლოდ მცირე ნაწილი აღწევს ამ დონეს — გამორჩეული აბსტრაქტული აზროვნება.",
  },
  high: {
    labelKa: "მაღალი",
    descKa: "საშუალოზე მკვეთრად მაღალი შედეგი — ძლიერი ლოგიკური და ანალიტიკური უნარი.",
  },
  above: {
    labelKa: "საშუალოზე მაღალი",
    descKa: "საშუალოზე მაღალი შედეგი — კარგად ართმევ თავს რთულ, არასტანდარტულ ამოცანებს.",
  },
  average: {
    labelKa: "საშუალო",
    descKa: "მოსახლეობის უმეტესობა სწორედ ამ დიაპაზონშია — დაბალანსებული აზროვნება.",
  },
  below: {
    labelKa: "საშუალოზე დაბალი",
    descKa: "ზოგიერთი ტიპის ამოცანა უფრო მეტ დროსა და ვარჯიშს ითხოვს — ეს სავსებით ნორმალურია.",
  },
  low: {
    labelKa: "დაბალი",
    descKa: "ერთ ჯერზე გავლილი ონლაინ ტესტი ბევრ ფაქტორზეა დამოკიდებული — არ იჩქარო დასკვნებით.",
  },
};

function bandFor(iq: number): IqBandKey {
  if (iq >= 130) return "very_high";
  if (iq >= 120) return "high";
  if (iq >= 110) return "above";
  if (iq >= 90) return "average";
  if (iq >= 80) return "below";
  return "low";
}

/**
 * Score a full set of answers. `answers` maps itemId → chosen option index;
 * a missing / -1 entry counts as incorrect (standard for a timed test).
 */
export function scoreIq(answers: Record<string, number>): IqResult {
  // Score only the items actually administered — the whole bank for the static
  // test, an adaptive subset otherwise. (Skips are recorded as -1, so they stay
  // in `answers` and count as incorrect; unadministered items are absent.)
  const items = IQ_ITEMS.filter((it) => it.id in answers);
  const correctArr = items.map((it) => answers[it.id] === it.answer);
  const correct = correctArr.filter(Boolean).length;
  const total = items.length;

  const { theta, info } = estimateTheta(items, correctArr);

  const iqRaw = 100 + (15 * (theta - THETA_MEAN)) / THETA_SD;
  const iq = clamp(Math.round(iqRaw), IQ_MIN, IQ_MAX);

  // Measurement error → IQ band. Posterior SD folds in the prior information.
  const semTheta = 1 / Math.sqrt(info + 1 / (PRIOR_SD * PRIOR_SD));
  const semIq = clamp((15 * semTheta) / THETA_SD, 4, 10);
  const range: [number, number] = [
    clamp(Math.round(iq - semIq), IQ_MIN, IQ_MAX),
    clamp(Math.round(iq + semIq), IQ_MIN, IQ_MAX),
  ];

  const percentile = clamp(Math.round(normCdf((iq - 100) / 15) * 100), 1, 99);
  const topPercent = clamp(100 - percentile, 1, 99);

  const key = bandFor(iq);

  // Per-domain subscores.
  const domainKeys: IqDomain[] = ["numeric", "logic", "spatial", "pattern"];
  const domains: IqDomainScore[] = domainKeys.map((d) => {
    const inDomain = items.filter((i) => i.domain === d);
    const c = inDomain.filter((i) => answers[i.id] === i.answer).length;
    const t = inDomain.length;
    return {
      domain: d,
      labelKa: DOMAIN_LABELS_KA[d],
      correct: c,
      total: t,
      pct: t > 0 ? Math.round((c / t) * 100) : 0,
    };
  });

  return {
    iq,
    range,
    percentile,
    topPercent,
    band: { key, ...BANDS[key] },
    correct,
    total,
    theta,
    domains,
  };
}
