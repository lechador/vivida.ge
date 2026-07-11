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
 *    hard item right lifts θ more than getting an easy one right. (MLE via
 *    Newton–Raphson.)
 * 2. θ is placed on the deviation-IQ scale: IQ = 100 + 15·(θ − θ₀)/σθ, where θ₀
 *    is the mean item difficulty (so a median performance ≈ 100) and σθ is the
 *    assumed population spread in logits.
 * 3. We report a *range* (± the measurement error from the test information),
 *    a percentile from the normal curve, a band, and per-domain subscores.
 *
 * ⚠️ The θ→IQ mapping (σθ, θ₀) is provisional — calibrated from item difficulty,
 * not a norming sample. Once enough real responses accumulate we re-derive both
 * from the actual score distribution (see the self-norming note in the admin).
 */

// Assumed SD of ability (logits) in the taking population. Re-normed from data
// later; 1.7 keeps the initial spread sensible (most scores land 80–130).
const THETA_SD = 1.7;
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

/** Maximum-likelihood θ (Newton–Raphson) + test information at that θ. */
function estimateTheta(
  items: IqItem[],
  correct: boolean[]
): { theta: number; info: number } {
  let theta = 0;
  for (let iter = 0; iter < 50; iter++) {
    let g = 0; // first derivative of log-likelihood
    let h = 0; // negative second derivative (information)
    for (let i = 0; i < items.length; i++) {
      const p = p1pl(theta, items[i].b);
      g += (correct[i] ? 1 : 0) - p;
      h += p * (1 - p);
    }
    if (h < 1e-6) break;
    const step = g / h;
    theta = clamp(theta + step, -6, 6);
    if (Math.abs(step) < 1e-4) break;
  }
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
  const items = IQ_ITEMS;
  const correctArr = items.map((it) => answers[it.id] === it.answer);
  const correct = correctArr.filter(Boolean).length;
  const total = items.length;

  const { theta, info } = estimateTheta(items, correctArr);

  const theta0 = items.reduce((s, i) => s + i.b, 0) / items.length;
  const iqRaw = 100 + (15 * (theta - theta0)) / THETA_SD;
  const iq = clamp(Math.round(iqRaw), IQ_MIN, IQ_MAX);

  // Measurement error → IQ band.
  const semTheta = info > 0 ? 1 / Math.sqrt(info) : 1.5;
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
