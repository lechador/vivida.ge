import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bigFiveResults,
  eqResults,
  iqResults,
  mbtiTestResults,
} from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import {
  BIG5_LIKERT,
  BIG5_QUESTIONS,
  type BigFiveTraitKey,
} from "@/lib/big-five/questions";
import {
  BIG5_LEVEL_LABEL,
  BIG5_TRAIT_INTERP,
  big5HeadlineKa,
  calculateBigFive,
  type BigFiveResult,
} from "@/lib/big-five/scoring";
import { sanitizeBigFiveAnswers, saveBigFiveResult } from "@/lib/big-five/store";
import { EQ_LIKERT, EQ_QUESTIONS, type EqDomainKey } from "@/lib/eq/questions";
import {
  EQ_BAND_META,
  EQ_DOMAIN_INTERP,
  EQ_DOMAIN_TIP,
  calculateEq,
  eqHeadlineKa,
  type EqResult,
} from "@/lib/eq/scoring";
import { sanitizeEqAnswers, saveEqResult } from "@/lib/eq/store";
import { IQ_ADAPTIVE_LENGTH, firstAdaptiveItem, nextAdaptiveItem } from "@/lib/iq/adaptive";
import {
  IQ_ITEMS,
  STEM_PROMPT_KA,
  type IqDomain,
  type IqItem,
} from "@/lib/iq/items";
import { iqBand, scoreIq, type IqResult } from "@/lib/iq/scoring";
import { sanitizeAnswers as sanitizeIqAnswers, saveIqResult } from "@/lib/iq/store";
import { MBTI_LIKERT, AXIS_LABEL_KA, type MbtiAxis } from "@/lib/mbti-questions";
import { getMbtiQuestions } from "@/lib/mbti-questions-db";
import { submitMbtiFor } from "@/lib/mbti-submit-core";
import { isR2Configured, objectExists, publicUrlFor } from "@/lib/r2";
import { ROSENBERG_OPTIONS, ROSENBERG_QUESTIONS } from "@/lib/rosenberg/questions";
import { calculateRosenberg, type RosenbergResult } from "@/lib/rosenberg/scoring";
import { TESTS } from "@/lib/tests-catalog";
import { TS_QUESTIONS, scoreTrueSign } from "@/lib/true-sign/quiz";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";
import {
  FAMOUS_ZODIAC_QUESTIONS,
  FAMOUS_ZODIAC_ROUND,
  ZODIAC_SIGNS,
  signFor,
} from "@/lib/zodiac-famous-quiz";

/**
 * The mobile (`/api/v1/tests/*`) face of the tests hub.
 *
 * The Flutter app used to punt every assessment into an in-app browser. It now
 * runs them natively — but the *content and the scoring stay here*, on the
 * server, exactly where the website reads them from. The app only ever
 * receives (a) questions and (b) an already-rendered result, so a wording fix
 * or a re-calibrated band ships to phones the moment the backend deploys, and
 * there is no second copy of an item bank to drift out of sync.
 *
 * Two consequences worth keeping:
 *  - The IQ answer key never leaves this process. The adaptive selector runs
 *    server-side (`POST …/iq/next`), so the app cannot see which option is
 *    correct — unlike the website, where the bank ships in the JS bundle.
 *  - Every result the app renders is produced by `buildResultView`, a small
 *    presentation envelope (headline / gauge / bars / sections / bullets).
 *    One Flutter screen renders all seven tests, and adding an eighth means
 *    writing a case here, not a new mobile screen.
 *
 * Georgian only: the app talks to www.vivida.ge, which is locale-`ka` by host.
 */

export const MOBILE_TEST_SLUGS = [
  "iq",
  "eq",
  "big-five",
  "astro-mbti",
  "self-esteem",
  "true-sign",
  "famous-zodiac",
] as const;

export type MobileTestSlug = (typeof MOBILE_TEST_SLUGS)[number];

export function isMobileTestSlug(value: string): value is MobileTestSlug {
  return (MOBILE_TEST_SLUGS as readonly string[]).includes(value);
}

/** Test kinds that persist a row and therefore have a "latest result". */
const PERSISTED: Partial<Record<MobileTestSlug, "iq" | "eq" | "big-five" | "mbti">> = {
  iq: "iq",
  eq: "eq",
  "big-five": "big-five",
  "astro-mbti": "mbti",
};

// ── palette ────────────────────────────────────────────────────────────────
// The website tints these with oklch() values that Flutter can't parse, so the
// mobile payload carries plain hex from the same brand axis instead.
const HUE_VIOLET = "#B259FF";
const HUE_PINK = "#FF5CB8";
const HUE_CYAN = "#00D7E4";
const HUE_GOLD = "#FDC436";
const HUE_GREEN = "#3FD9A0";

const EQ_HUE: Record<EqDomainKey, string> = {
  "self-awareness": HUE_VIOLET,
  "self-regulation": HUE_CYAN,
  motivation: HUE_GOLD,
  empathy: HUE_PINK,
  "social-skills": HUE_GREEN,
};

const BIG5_HUE: Record<BigFiveTraitKey, string> = {
  openness: HUE_VIOLET,
  conscientiousness: HUE_CYAN,
  extraversion: HUE_GOLD,
  agreeableness: HUE_GREEN,
  neuroticism: HUE_PINK,
};

const IQ_HUE: Record<IqDomain, string> = {
  numeric: HUE_CYAN,
  logic: HUE_VIOLET,
  spatial: HUE_GOLD,
  pattern: HUE_PINK,
};

const MBTI_HUE: Record<MbtiAxis, string> = {
  EI: HUE_GOLD,
  SN: HUE_VIOLET,
  TF: HUE_PINK,
  JP: HUE_CYAN,
  AT: HUE_GREEN,
};

// ── payload shapes ─────────────────────────────────────────────────────────

/** One entry in the app's tests hub. */
export type MobileTestCatalogEntry = {
  slug: MobileTestSlug;
  kind: "featured" | "quiz";
  title: string;
  tagline: string;
  description: string;
  meta: string;
  /** ISO timestamp of the taker's most recent completed attempt, if any. */
  completedAt: string | null;
  /** One-line summary of that attempt, e.g. "IQ 118" or "INFJ-T · ადვოკატი". */
  summary: string | null;
  /** Whether a saved result can be re-opened via GET …/{slug}/result. */
  hasSavedResult: boolean;
};

export type MobileLikertOption = { value: number; label: string };

export type MobileLikertQuestion = {
  id: number;
  text: string;
  /** Group label (EQ domain / Big Five trait / MBTI axis) — shown as a hint. */
  group: string | null;
};

/** A pick-one question whose options are plain text (true-sign). */
export type MobileChoiceQuestion = {
  id: number;
  text: string;
  options: MobileLikertOption[];
};

/** A pick-one question fronted by a portrait (famous-zodiac). */
export type MobileImageQuestion = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  options: { value: string; label: string; glyph: string }[];
  /** Present only for the arcade-style quizzes that show instant feedback. */
  answer: string;
};

export type MobileTestQuestions =
  | {
      slug: MobileTestSlug;
      title: string;
      intro: string;
      format: "likert";
      /** Shared scale, rendered once by the runner. */
      scale: MobileLikertOption[];
      questions: MobileLikertQuestion[];
    }
  | {
      slug: MobileTestSlug;
      title: string;
      intro: string;
      format: "choice";
      questions: MobileChoiceQuestion[];
    }
  | {
      slug: MobileTestSlug;
      title: string;
      intro: string;
      format: "image-choice";
      questions: MobileImageQuestion[];
    }
  | {
      slug: MobileTestSlug;
      title: string;
      intro: string;
      format: "adaptive";
      /** Fixed administered length, so the app can draw a real progress bar. */
      length: number;
      /** Suggested wall-clock budget for the whole sitting, in seconds. */
      timeLimitSec: number;
      first: MobileIqItem;
    };

/** An IQ item stripped of its answer key. */
export type MobileIqItem = {
  id: string;
  domain: IqDomain;
  domainLabel: string;
  prompt: string;
  stem: IqItem["stem"];
  /** Options with the `answer` index deliberately omitted. */
  options: IqItem["options"];
};

export type MobileResultBar = {
  label: string;
  caption: string | null;
  value: number;
  max: number;
  hue: string;
  detail: string | null;
};

/** The presentation envelope every native result screen renders. */
export type MobileTestResultView = {
  slug: MobileTestSlug;
  title: string;
  headline: { value: string; label: string; caption: string | null };
  gauge: {
    value: number;
    min: number;
    max: number;
    label: string;
    caption: string | null;
    hue: string;
  } | null;
  bars: MobileResultBar[];
  sections: { title: string; body: string }[];
  bullets: { title: string; items: string[] }[];
  /** Per-question review, for quizzes that grade answers. */
  review: { label: string; caption: string; correct: boolean; answer: string }[];
  /** Row id when the attempt was persisted, so the app can deep-link back. */
  savedId: string | null;
  /** Whether this test participates in the public-profile visibility toggle. */
  visibilityKind: "iq" | "eq" | "big-five" | "mbti" | null;
  completedAt: string;
};

// ── catalog ────────────────────────────────────────────────────────────────

/**
 * The tests hub, annotated with what this user has already completed. The
 * catalog itself is the website's `TESTS` list filtered to the Georgian
 * locale, so the two hubs can never list different tests.
 */
export async function mobileTestCatalog(
  userId: string
): Promise<MobileTestCatalogEntry[]> {
  const [mbti, iq, eqRow, big5] = await Promise.all([
    latestMbti(userId),
    latestIq(userId),
    latestEq(userId),
    latestBigFive(userId),
  ]);

  const entries: MobileTestCatalogEntry[] = [];
  for (const test of TESTS) {
    if (!test.available) continue;
    if (test.locales && !test.locales.includes("ka")) continue;
    if (!isMobileTestSlug(test.slug)) continue;

    let completedAt: string | null = null;
    let summary: string | null = null;
    switch (test.slug) {
      case "iq":
        if (iq) {
          completedAt = iq.createdAt.toISOString();
          summary = `IQ ${iq.iq} · ${iqBand(iq.iq).labelKa}`;
        }
        break;
      case "eq":
        if (eqRow) {
          completedAt = eqRow.createdAt.toISOString();
          summary = `${eqRow.overall}/100 · ${EQ_BAND_META[eqRow.band as keyof typeof EQ_BAND_META]?.labelKa ?? ""}`.trim();
        }
        break;
      case "big-five":
        if (big5) {
          completedAt = big5.createdAt.toISOString();
          summary = big5HeadlineKa(calculateBigFive(numericKeys(big5.answers)));
        }
        break;
      case "astro-mbti":
        if (mbti) {
          completedAt = mbti.createdAt.toISOString();
          summary = `${mbti.mbtiType} · ${mbti.archetypeNameGe}`;
        }
        break;
      default:
        break;
    }

    entries.push({
      slug: test.slug,
      kind: test.kind,
      title: test.titleKa,
      tagline: test.taglineKa,
      description: test.descKa,
      meta: test.metaKa,
      completedAt,
      summary,
      hasSavedResult: completedAt !== null,
    });
  }
  return entries;
}

// ── questions ──────────────────────────────────────────────────────────────

export async function mobileTestQuestions(
  slug: MobileTestSlug
): Promise<MobileTestQuestions> {
  const meta = TESTS.find((t) => t.slug === slug);
  const title = meta?.titleKa ?? slug;
  const intro = meta?.descKa ?? "";

  switch (slug) {
    case "eq":
      return {
        slug,
        title,
        intro,
        format: "likert",
        scale: EQ_LIKERT.map((o) => ({ value: o.value, label: o.labelKa })),
        questions: EQ_QUESTIONS.map((q) => ({
          id: q.id,
          text: q.textKa,
          group: null,
        })),
      };

    case "big-five":
      return {
        slug,
        title,
        intro,
        format: "likert",
        scale: BIG5_LIKERT.map((o) => ({ value: o.value, label: o.labelKa })),
        questions: BIG5_QUESTIONS.map((q) => ({
          id: q.id,
          text: q.textKa,
          group: null,
        })),
      };

    case "astro-mbti": {
      const questions = await getMbtiQuestions();
      return {
        slug,
        title,
        intro,
        format: "likert",
        scale: MBTI_LIKERT.map((o) => ({ value: o.value, label: o.labelKa })),
        questions: questions.map((q) => ({
          id: q.id,
          text: q.textKa,
          group: null,
        })),
      };
    }

    case "self-esteem":
      return {
        slug,
        title,
        intro,
        format: "likert",
        scale: ROSENBERG_OPTIONS.map((o) => ({
          value: o.value,
          label: o.labelKa,
        })),
        questions: ROSENBERG_QUESTIONS.map((q) => ({
          id: q.id,
          text: q.textKa,
          group: null,
        })),
      };

    case "true-sign":
      return {
        slug,
        title,
        intro,
        format: "choice",
        questions: TS_QUESTIONS.map((q) => ({
          id: q.id,
          text: q.textKa,
          // The scorer keys on the option INDEX, so that is what travels.
          options: q.options.map((o, i) => ({ value: i, label: o.textKa })),
        })),
      };

    case "famous-zodiac": {
      const images = await famousZodiacImageUrls();
      // A fresh shuffled round per request, exactly like the web quiz.
      const round = shuffled(FAMOUS_ZODIAC_QUESTIONS).slice(0, FAMOUS_ZODIAC_ROUND);
      return {
        slug,
        title,
        intro,
        format: "image-choice",
        questions: round.map((q) => ({
          id: q.id,
          title: q.name,
          subtitle: q.professionKa,
          imageUrl: images[q.imageId] ?? "",
          options: shuffled([
            signFor(q.sign),
            ...shuffled(ZODIAC_SIGNS.filter((s) => s.key !== q.sign)).slice(0, 3),
          ]).map((s) => ({ value: s.key, label: s.nameKa, glyph: s.glyph })),
          answer: q.sign,
        })),
      };
    }

    case "iq":
      return {
        slug,
        title,
        intro,
        format: "adaptive",
        length: IQ_ADAPTIVE_LENGTH,
        timeLimitSec: 25 * 60,
        first: stripAnswer(firstAdaptiveItem()),
      };
  }
}

/**
 * The next adaptive IQ item for a partially-answered attempt.
 *
 * The app posts everything it has answered so far and gets back one item; the
 * server re-derives correctness from its own key, so ability estimation and
 * item selection are identical to the website's while the key stays here.
 * Returns null once the fixed administered length is reached.
 */
export function nextIqItem(rawAnswers: unknown): {
  item: MobileIqItem | null;
  index: number;
  length: number;
} {
  const answers = sanitizeIqAnswers(rawAnswers);
  const administered = IQ_ITEMS.filter((it) => it.id in answers);
  const index = administered.length;
  if (index >= IQ_ADAPTIVE_LENGTH) {
    return { item: null, index, length: IQ_ADAPTIVE_LENGTH };
  }
  if (index === 0) {
    return {
      item: stripAnswer(firstAdaptiveItem()),
      index,
      length: IQ_ADAPTIVE_LENGTH,
    };
  }
  const correct = administered.map((it) => answers[it.id] === it.answer);
  const next = nextAdaptiveItem(administered, correct);
  return {
    item: next ? stripAnswer(next) : null,
    index,
    length: IQ_ADAPTIVE_LENGTH,
  };
}

// ── submit ─────────────────────────────────────────────────────────────────

export type SubmitInput = {
  slug: MobileTestSlug;
  userId: string;
  attemptId: string;
  answers: unknown;
  timeUsedSec?: number | null;
};

/**
 * Score + persist one native attempt and hand back a ready-to-render result.
 * Persistence reuses the very same store functions the website posts to, so a
 * phone attempt and a browser attempt are the same row shape — the self-norming
 * data set stays one population, not two.
 */
export async function submitMobileTest(
  input: SubmitInput
): Promise<MobileTestResultView> {
  const { slug, userId, attemptId } = input;
  const now = new Date().toISOString();

  switch (slug) {
    case "iq": {
      const answers = sanitizeIqAnswers(input.answers);
      if (Object.keys(answers).length === 0) throw emptyAnswers();
      const { result, id } = await saveIqResult({
        attemptId,
        answers,
        timeUsedSec: input.timeUsedSec ?? null,
        userId,
      });
      return iqView(result, id, now);
    }

    case "eq": {
      const answers = sanitizeEqAnswers(input.answers);
      if (Object.keys(answers).length === 0) throw emptyAnswers();
      const { result, id } = await saveEqResult({ attemptId, answers, userId });
      return eqView(result, id, now);
    }

    case "big-five": {
      const answers = sanitizeBigFiveAnswers(input.answers);
      if (Object.keys(answers).length === 0) throw emptyAnswers();
      const { result, id } = await saveBigFiveResult({
        attemptId,
        answers,
        userId,
      });
      return bigFiveView(result, id, now);
    }

    case "astro-mbti": {
      const answers = sanitizeMbtiAnswers(input.answers);
      if (Object.keys(answers).length === 0) throw emptyAnswers();
      const saved = await submitMbtiFor({ userId, answers, locale: "ka" });
      return mbtiView(
        {
          type: saved.type,
          archetypeNameGe: saved.archetypeNameGe,
          scores: saved.scores,
          aiSynthesisText: saved.aiSynthesisText,
        },
        saved.id,
        now
      );
    }

    case "self-esteem": {
      const answers = sanitizeRosenbergAnswers(input.answers);
      // The website scores this one purely in the browser and stores nothing;
      // mobile keeps that contract — the score is computed here only so the
      // band copy has a single home.
      if (ROSENBERG_QUESTIONS.some((q) => answers[q.id] === undefined)) {
        throw new ApiError(
          422,
          "incomplete_answers",
          "Every Rosenberg item must be answered"
        );
      }
      return rosenbergView(calculateRosenberg(answers), now);
    }

    case "true-sign": {
      const answers = sanitizeIndexAnswers(
        input.answers,
        new Set(TS_QUESTIONS.map((q) => q.id)),
        (q) => TS_QUESTIONS.find((x) => x.id === q)?.options.length ?? 0
      );
      if (Object.keys(answers).length === 0) throw emptyAnswers();
      return trueSignView(answers, now);
    }

    case "famous-zodiac":
      return famousZodiacView(input.answers, now);
  }
}

/** Re-render the taker's most recent saved attempt, if the test keeps one. */
export async function mobileSavedResult(
  slug: MobileTestSlug,
  userId: string
): Promise<MobileTestResultView | null> {
  switch (slug) {
    case "iq": {
      const row = await latestIq(userId);
      if (!row) return null;
      // Re-score from the stored raw answers rather than rebuilding a partial
      // view from the summary columns — the band copy and domain breakdown
      // then come from exactly one place.
      return iqView(
        scoreIq(row.answers as Record<string, number>),
        row.id,
        row.createdAt.toISOString()
      );
    }
    case "eq": {
      const row = await latestEq(userId);
      if (!row) return null;
      return eqView(
        calculateEq(numericKeys(row.answers)),
        row.id,
        row.createdAt.toISOString()
      );
    }
    case "big-five": {
      const row = await latestBigFive(userId);
      if (!row) return null;
      return bigFiveView(
        calculateBigFive(numericKeys(row.answers)),
        row.id,
        row.createdAt.toISOString()
      );
    }
    case "astro-mbti": {
      const row = await latestMbti(userId);
      if (!row) return null;
      return mbtiView(
        {
          type: row.mbtiType,
          archetypeNameGe: row.archetypeNameGe,
          scores: row.scores as Record<string, { letter: string; pct: number }>,
          aiSynthesisText: row.aiSynthesisText,
        },
        row.id,
        row.createdAt.toISOString()
      );
    }
    default:
      return null;
  }
}

// ── result views ───────────────────────────────────────────────────────────

function iqView(
  r: IqResult,
  savedId: string | null,
  completedAt: string
): MobileTestResultView {
  return {
    slug: "iq",
    title: "IQ ტესტი",
    headline: {
      value: String(r.iq),
      label: r.band.labelKa,
      caption: `სავარაუდო დიაპაზონი ${r.range[0]}–${r.range[1]} · პროცენტილი ${r.percentile}`,
    },
    gauge: {
      value: r.iq,
      min: 55,
      max: 145,
      label: "IQ",
      caption: `მოსახლეობის ${r.percentile}%-ზე მაღლა`,
      hue: HUE_VIOLET,
    },
    bars: r.domains.map((d) => ({
      label: d.labelKa,
      caption: `${d.correct}/${d.total} სწორი`,
      value: d.pct,
      max: 100,
      hue: IQ_HUE[d.domain],
      detail: null,
    })),
    sections: [
      { title: r.band.labelKa, body: r.band.descKa },
      {
        title: "როგორ ითვლება",
        body: "ქულა შენი პასუხების პატერნს ადარებს დავალებების სირთულეს (Rasch/IRT მოდელი) და გადაჰყავს სტანდარტულ სკალაზე — საშუალო 100, სტანდარტული გადახრა 15. ერთჯერადი ონლაინ ტესტი კლინიკური დიაგნოზი არაა.",
      },
    ],
    bullets: [
      {
        title: "შენი შედეგი ერთი შეხედვით",
        items: [
          `სწორი პასუხი: ${r.correct}/${r.total}`,
          `პროცენტილი: ${r.percentile} (ზედა ${r.topPercent}%)`,
          `დიაპაზონი: ${r.range[0]}–${r.range[1]}`,
        ],
      },
    ],
    review: [],
    savedId,
    visibilityKind: "iq",
    completedAt,
  };
}

function eqView(
  r: EqResult,
  savedId: string | null,
  completedAt: string
): MobileTestResultView {
  const meta = EQ_BAND_META[r.band];
  const top = r.domains.find((d) => d.key === r.topKey);
  const low = r.domains.find((d) => d.key === r.lowKey);
  return {
    slug: "eq",
    title: "EQ ტესტი",
    headline: {
      value: `${r.overall}`,
      label: meta.labelKa,
      caption: eqHeadlineKa(r),
    },
    gauge: {
      value: r.overall,
      min: 0,
      max: 100,
      label: "EQ",
      caption: meta.labelKa,
      hue: HUE_CYAN,
    },
    bars: r.domains.map((d) => ({
      label: d.nameKa,
      caption: d.taglineKa,
      value: d.score,
      max: 100,
      hue: EQ_HUE[d.key],
      detail: EQ_DOMAIN_INTERP[d.key][d.band],
    })),
    sections: [
      { title: meta.labelKa, body: meta.summaryKa },
      ...(top
        ? [{ title: `ძლიერი მხარე — ${top.nameKa}`, body: EQ_DOMAIN_INTERP[top.key][top.band] }]
        : []),
      ...(low
        ? [{ title: `ზრდის სივრცე — ${low.nameKa}`, body: EQ_DOMAIN_INTERP[low.key][low.band] }]
        : []),
    ],
    bullets: low
      ? [{ title: "პრაქტიკული ნაბიჯი", items: [EQ_DOMAIN_TIP[low.key]] }]
      : [],
    review: [],
    savedId,
    visibilityKind: "eq",
    completedAt,
  };
}

function bigFiveView(
  r: BigFiveResult,
  savedId: string | null,
  completedAt: string
): MobileTestResultView {
  const top = r.traits.find((t) => t.key === r.topKey);
  return {
    slug: "big-five",
    title: "Big Five",
    headline: {
      value: r.traits.map((t) => t.letter).join(""),
      label: big5HeadlineKa(r),
      caption: "ხუთი თვისება ბიპოლარულია — არცერთი ბოლო არაა „უკეთესი“.",
    },
    gauge: null,
    bars: r.traits.map((t) => ({
      label: t.nameKa,
      caption: `${BIG5_LEVEL_LABEL[t.level]} · ${t.taglineKa}`,
      value: t.score,
      max: 100,
      hue: BIG5_HUE[t.key],
      detail: BIG5_TRAIT_INTERP[t.key][t.level],
    })),
    sections: top
      ? [{ title: top.nameKa, body: BIG5_TRAIT_INTERP[top.key][top.level] }]
      : [],
    bullets: [],
    review: [],
    savedId,
    visibilityKind: "big-five",
    completedAt,
  };
}

function mbtiView(
  saved: {
    type: string;
    archetypeNameGe: string;
    scores: Record<string, { letter: string; pct: number }>;
    aiSynthesisText: string;
  },
  savedId: string | null,
  completedAt: string
): MobileTestResultView {
  const axes: MbtiAxis[] = ["EI", "SN", "TF", "JP", "AT"];
  return {
    slug: "astro-mbti",
    title: "Astro-MBTI",
    headline: {
      value: saved.type,
      label: saved.archetypeNameGe,
      caption: null,
    },
    gauge: null,
    bars: axes.flatMap((axis) => {
      const score = saved.scores[axis];
      if (!score) return [];
      const [first, second] = AXIS_LABEL_KA[axis];
      const towardFirst = score.letter === axis[0];
      return [
        {
          label: towardFirst ? first : second,
          caption: `${towardFirst ? second : first}-ის საპირისპიროდ`,
          value: score.pct,
          max: 100,
          hue: MBTI_HUE[axis],
          detail: null,
        },
      ];
    }),
    sections: [{ title: "შენი ანალიზი", body: saved.aiSynthesisText }],
    bullets: [],
    review: [],
    savedId,
    visibilityKind: "mbti",
    completedAt,
  };
}

function rosenbergView(
  r: RosenbergResult,
  completedAt: string
): MobileTestResultView {
  return {
    slug: "self-esteem",
    title: "თვითშეფასების ტესტი",
    headline: {
      value: `${r.score}`,
      label: r.labelKa,
      caption: `30-დან · ${r.percentage}%`,
    },
    gauge: {
      value: r.score,
      min: 0,
      max: 30,
      label: "ქულა",
      caption: r.labelKa,
      hue: r.band === "higher" ? HUE_CYAN : r.band === "lower" ? HUE_PINK : HUE_VIOLET,
    },
    bars: [],
    sections: [
      { title: r.labelKa, body: r.summaryKa },
      ...r.strengths.map((s) => ({ title: s.themeKa, body: s.strengthKa })),
      ...r.reflections.map((s) => ({ title: s.themeKa, body: s.reflectionKa })),
    ],
    bullets: [{ title: "შემდეგი ნაბიჯები", items: r.nextStepsKa }],
    review: [],
    savedId: null,
    visibilityKind: null,
    completedAt,
  };
}

function trueSignView(
  answers: Record<number, number>,
  completedAt: string
): MobileTestResultView {
  const r = scoreTrueSign(answers);
  return {
    slug: "true-sign",
    title: "რომელი ნიშანი ხარ სინამდვილეში?",
    headline: {
      value: r.sign.symbol,
      label: r.sign.labelKa,
      caption: `${r.element} · ${r.modality}`,
    },
    gauge: null,
    bars: [],
    sections: [{ title: r.sign.labelKa, body: r.blurbKa }],
    bullets: [
      {
        title: "რატომ ეს ნიშანი",
        items: [
          `დომინანტი ელემენტი: ${r.element}`,
          `დომინანტი მოდალობა: ${r.modality}`,
          "ყოველი ნიშანი ერთი ელემენტისა და ერთი მოდალობის კვეთაა — ამიტომ ყველა 12 ნიშანი მისაღწევია.",
        ],
      },
    ],
    review: [],
    savedId: null,
    visibilityKind: null,
    completedAt,
  };
}

function famousZodiacView(
  raw: unknown,
  completedAt: string
): MobileTestResultView {
  // answers: questionId → chosen sign key, for the round the app was served.
  const picked = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const byId = new Map(FAMOUS_ZODIAC_QUESTIONS.map((q) => [q.id, q]));
  const review: MobileTestResultView["review"] = [];
  let score = 0;
  for (const [id, choice] of Object.entries(picked)) {
    const q = byId.get(id);
    if (!q || typeof choice !== "string") continue;
    const right = choice === q.sign;
    if (right) score++;
    review.push({
      label: q.name,
      caption: q.professionKa,
      correct: right,
      answer: signFor(q.sign).nameKa,
    });
  }
  const total = review.length;
  const pct = total > 0 ? score / total : 0;
  const [label, caption] =
    total === 0
      ? ["შედეგი არ დაფიქსირდა", "სცადე ქვიზი თავიდან."]
      : score === total
        ? ["ზოდიაქოს ნამდვილი ენციკლოპედია!", "ყველა ვარსკვლავის ნიშანი სწორად ამოიცანი."]
        : pct >= 0.8
          ? ["შთამბეჭდავია!", "ცნობილი ადამიანების ნიშნებს მშვენივრად იცნობ."]
          : pct >= 0.5
            ? ["კარგი შედეგია.", "რამდენიმე ნიშანი გამოგრჩა — შემდეგი ცდა უკეთესი იქნება."]
            : ["ჯერ საწყისი დონეა.", "ცოტა ვარჯიში და ვარსკვლავების ნიშნებს დაიმახსოვრებ."];

  return {
    slug: "famous-zodiac",
    title: "ვარსკვლავების ზოდიაქო",
    headline: { value: `${score}/${total}`, label, caption },
    gauge: null,
    bars: [],
    sections: [{ title: label, body: caption }],
    bullets: [],
    review,
    savedId: null,
    visibilityKind: null,
    completedAt,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

function emptyAnswers() {
  return new ApiError(422, "empty_answers", "No valid answers submitted");
}

/** Drop the answer key before an IQ item is allowed onto the wire. */
function stripAnswer(item: IqItem): MobileIqItem {
  const prompt =
    item.stem.type === "logic" ? item.stem.textKa : STEM_PROMPT_KA[item.stem.type];
  return {
    id: item.id,
    domain: item.domain,
    domainLabel: DOMAIN_LABEL[item.domain],
    prompt,
    stem: item.stem,
    options: item.options.map((o) =>
      o.kind === "text" ? { kind: "text", text: o.text } : { kind: "figure", spec: o.spec }
    ),
  };
}

const DOMAIN_LABEL: Record<IqDomain, string> = {
  numeric: "რიცხვითი ლოგიკა",
  logic: "ლოგიკური აზროვნება",
  spatial: "სივრცითი აზროვნება",
  pattern: "პატერნების ამოცნობა",
};

/** JSON object keys are strings; the scorers key on numbers. */
function numericKeys(raw: unknown): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (Number.isInteger(id) && typeof v === "number") out[id] = v;
  }
  return out;
}

function sanitizeMbtiAnswers(raw: unknown): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (
      Number.isInteger(id) &&
      typeof v === "number" &&
      Number.isInteger(v) &&
      v >= -3 &&
      v <= 3
    ) {
      out[id] = v;
    }
  }
  return out;
}

function sanitizeRosenbergAnswers(raw: unknown): Record<number, number> {
  const ids = new Set(ROSENBERG_QUESTIONS.map((q) => q.id));
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (
      ids.has(id) &&
      typeof v === "number" &&
      Number.isInteger(v) &&
      v >= 1 &&
      v <= 4
    ) {
      out[id] = v;
    }
  }
  return out;
}

/** Answers that are option INDEXES into a per-question option list. */
function sanitizeIndexAnswers(
  raw: unknown,
  ids: Set<number>,
  optionCount: (id: number) => number
): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (
      ids.has(id) &&
      typeof v === "number" &&
      Number.isInteger(v) &&
      v >= 0 &&
      v < optionCount(id)
    ) {
      out[id] = v;
    }
  }
  return out;
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Absolute portrait URLs for the celebrity quiz. Mirrors the website page:
 * prefer the mirrored R2 copy, fall back to the reviewed Wikimedia source so
 * the quiz still runs on an environment without R2 configured.
 */
async function famousZodiacImageUrls(): Promise<Record<string, string>> {
  const ready = isR2Configured();
  const pairs = await Promise.all(
    FAMOUS_ZODIAC_ASSETS.map(async (asset) => {
      const mirrored = ready && (await objectExists(asset.key));
      return [asset.id, mirrored ? publicUrlFor(asset.key) : asset.sourceUrl] as const;
    })
  );
  return Object.fromEntries(pairs);
}

// ── latest-row reads ───────────────────────────────────────────────────────

function latestIq(userId: string) {
  return db
    .select()
    .from(iqResults)
    .where(eq(iqResults.userId, userId))
    .orderBy(desc(iqResults.createdAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

function latestEq(userId: string) {
  return db
    .select()
    .from(eqResults)
    .where(eq(eqResults.userId, userId))
    .orderBy(desc(eqResults.createdAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

function latestBigFive(userId: string) {
  return db
    .select()
    .from(bigFiveResults)
    .where(eq(bigFiveResults.userId, userId))
    .orderBy(desc(bigFiveResults.createdAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

function latestMbti(userId: string) {
  return db
    .select()
    .from(mbtiTestResults)
    .where(eq(mbtiTestResults.userId, userId))
    .orderBy(desc(mbtiTestResults.createdAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

/** The visibility kind a slug maps to, or null when it keeps no row. */
export function visibilityKindFor(slug: MobileTestSlug) {
  return PERSISTED[slug] ?? null;
}
