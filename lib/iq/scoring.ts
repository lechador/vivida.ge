import {
  IQ_ITEMS,
  DOMAIN_LABELS_EN,
  DOMAIN_LABELS_KA,
  type IqDomain,
  type IqItem,
} from "@/lib/iq/items";

/**
 * IQ scoring, the same shape a professional test uses, scaled to what an
 * online single-sitting can honestly claim.
 *
 * 1. Ability θ is estimated with a Rasch (1-parameter IRT) model from the
 *    *pattern* of right/wrong against each item's difficulty `b`, getting a
 *    hard item right lifts θ more than getting an easy one right. (Bayesian EAP,
 *    which stays finite at the extremes instead of running off to ±∞.)
 * 2. θ is placed on the deviation-IQ scale: IQ = 100 + 15·(θ − θ_mean)/σθ, where
 *    θ_mean and σθ are FIXED constants (not the mean difficulty of the items a
 *    given person saw), so static and adaptive runs share one scale.
 * 3. We report a *range* (± the measurement error from the test information),
 *    a percentile from the normal curve, a band, and per-domain subscores.
 *
 * ⚠️ The θ→IQ mapping was recalibrated in Oct 2026 from 881 completed real
 * attempts (joint Rasch calibration of item difficulties and abilities,
 * scripts/recalibrate-iq.mjs). Before that, the hand-set difficulties and
 * anchors produced a stored mean IQ of 119 (median 120, 34% of takers at
 * 130+), roughly +19 points of inflation. The norming sample is Vivida's own
 * test-takers, a self-selected group, not a representative population
 * sample, so percentiles mean "against people who took this test", not a
 * clinical population norm. No age banding is applied.
 */

// θ→IQ mapping constants. FIXED, deliberately NOT derived from which items a
// taker saw, so a full-bank (static) run and an adaptive subset land on the
// same scale. Calibrated Oct 2026: the mean/SD of EAP θ over 881 completed
// attempts scored with the jointly calibrated item difficulties.
export const THETA_MEAN = 2.06; // ability in logits that maps to IQ 100
export const THETA_SD = 1.23; // logits per 15-point (1-SD) IQ block
/**
 * EAP prior width, deliberately WIDER than THETA_SD. A prior as narrow as
 * the population SD shrinks genuine extremes toward 100 so hard that a
 * perfect 39/39 run scored only 135 and just 0.1% of rescored real takers
 * reached 130 (the norm curve expects ~2%). Centred on THETA_MEAN, wide
 * enough to let 25 informative items speak.
 */
const PRIOR_SD = 2.0;
const IQ_MIN = 55;
const IQ_MAX = 145;

/**
 * Minimum administered items for a score to be reported or stored. The
 * adaptive test administers 25; below 20 the EAP estimate is mostly prior,
 * so a timed-out run that only reached a handful of items must not produce
 * (or persist) a precise-looking IQ. One stored attempt had scored 145
 * from 10 answered items before this gate existed.
 */
export const IQ_MIN_SCORED_ITEMS = 20;

/** Fastest plausible honest completion: 25 items in under a minute is
 *  click-through, not reasoning (<3% of real completions, avg IQ ~77). */
export const IQ_MIN_PLAUSIBLE_SEC = 60;

export function isScorableIqAttempt(
  total: number,
  timeUsedSec?: number | null,
): boolean {
  if (total < IQ_MIN_SCORED_ITEMS) return false;
  if (timeUsedSec != null && timeUsedSec < IQ_MIN_PLAUSIBLE_SEC) return false;
  return true;
}

export type IqBandKey =
  "very_high" | "high" | "above" | "average" | "below" | "low";

export type IqDomainScore = {
  domain: IqDomain;
  labelKa: string;
  labelEn: string;
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
  band: {
    key: IqBandKey;
    labelKa: string;
    descKa: string;
    labelEn: string;
    descEn: string;
  };
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
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
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
 * likelihood and a prior N(THETA_MEAN, PRIOR_SD), computed by grid
 * integration. (The previous prior, N(0, 2), was centred on what is now
 * IQ ≈ 75, so every short or partial run was dragged toward the bottom of
 * the scale; centring it on the calibrated population mean fixes that.)
 * EAP is chosen over plain MLE because it stays
 * finite and smooth for perfect / near-perfect runs (MLE runs off to ±∞
 * there, which produced a cliff at the top of the scale) and because a
 * stable interim estimate is exactly what the adaptive selector needs
 * after only a handful of answers. Also returns Fisher test information
 * at the estimate, for the measurement-error band. The grid extends to
 * +8 logits because IQ 145 sits at θ ≈ 5.6 on the calibrated scale; the
 * old −5…+5 grid truncated the top of the scale.
 */
export function estimateTheta(
  items: IqItem[],
  correct: boolean[],
): { theta: number; info: number } {
  let num = 0;
  let den = 0;
  for (let t = -4; t <= 8; t += 0.05) {
    let like = Math.exp(
      -((t - THETA_MEAN) * (t - THETA_MEAN)) / (2 * PRIOR_SD * PRIOR_SD),
    ); // population prior
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

const BANDS: Record<
  IqBandKey,
  { labelKa: string; descKa: string; labelEn: string; descEn: string }
> = {
  very_high: {
    labelKa: "ძალიან მაღალი",
    descKa:
      "მოსახლეობის მხოლოდ მცირე ნაწილი აღწევს ამ დონეს, გამორჩეული აბსტრაქტული აზროვნება.",
    labelEn: "Very high",
    descEn:
      "Only a small share of the population reaches this range, indicating exceptional performance on abstract reasoning tasks.",
  },
  high: {
    labelKa: "მაღალი",
    descKa:
      "საშუალოზე მკვეთრად მაღალი შედეგი, ძლიერი ლოგიკური და ანალიტიკური უნარი.",
    labelEn: "High",
    descEn:
      "A result clearly above the population average, with strong logical and analytical performance.",
  },
  above: {
    labelKa: "საშუალოზე მაღალი",
    descKa:
      "საშუალოზე მაღალი შედეგი, კარგად ართმევ თავს რთულ, არასტანდარტულ ამოცანებს.",
    labelEn: "Above average",
    descEn:
      "An above-average result, suggesting confidence with complex and unfamiliar reasoning problems.",
  },
  average: {
    labelKa: "საშუალო",
    descKa:
      "მოსახლეობის უმეტესობა სწორედ ამ დიაპაზონშია, დაბალანსებული აზროვნება.",
    labelEn: "Average",
    descEn:
      "Most people fall within this range, reflecting a balanced performance across reasoning tasks.",
  },
  below: {
    labelKa: "საშუალოზე დაბალი",
    descKa:
      "ზოგიერთი ტიპის ამოცანა უფრო მეტ დროსა და ვარჯიშს ითხოვს, ეს სავსებით ნორმალურია.",
    labelEn: "Below average",
    descEn:
      "Some task types may benefit from more time or practice. A single result does not define your ability.",
  },
  low: {
    labelKa: "დაბალი",
    descKa:
      "ერთ ჯერზე გავლილი ონლაინ ტესტი ბევრ ფაქტორზეა დამოკიდებული, არ იჩქარო დასკვნებით.",
    labelEn: "Low",
    descEn:
      "One online attempt is affected by many factors, so avoid drawing broad conclusions from this score alone.",
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

/** Band (key + Georgian labels) for a raw IQ, for saved-result views that
 *  render from stored fields instead of re-scoring from answers. */
export function iqBand(iq: number): {
  key: IqBandKey;
  labelKa: string;
  descKa: string;
  labelEn: string;
  descEn: string;
} {
  const key = bandFor(iq);
  return { key, ...BANDS[key] };
}

/**
 * Score a full set of answers. `answers` maps itemId → chosen option index;
 * a missing / -1 entry counts as incorrect (standard for a timed test).
 */
export function scoreIq(answers: Record<string, number>): IqResult {
  // Score only the items actually administered, the whole bank for the static
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
      labelEn: DOMAIN_LABELS_EN[d],
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
