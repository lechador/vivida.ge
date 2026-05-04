/**
 * Typed accessors for the LLM-generated zodiac SEO copy.
 *
 * The JSON itself is committed into the repo (see scripts/generate-zodiac-
 * content.mjs) so build-time pages don't need OPENROUTER_API_KEY at all —
 * Vercel/CI just renders the cached output. Re-run the script + commit
 * when you want to refresh content.
 */

import rawData from "./zodiac-content.json";
import type { ElementSlug, ZodiacSlug } from "./zodiac-dates";

export type CompatibilityLevel = "ძლიერი" | "ჰარმონიული" | "გამომწვევი";

export type CompatibilityEntry = {
  signKa: string;
  level: CompatibilityLevel;
  note: string;
};

export type FaqEntry = { q: string; a: string };

export type SignContent = {
  slug: ZodiacSlug;
  labelKa: string;
  symbol: string;
  element: string;
  modality: string;
  ruler: string;
  dates: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  career: string;
  compatibility: CompatibilityEntry[];
  famous: string[];
  faq: FaqEntry[];
};

export type Section = { title: string; body: string };

export type HubContent = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  whatIsZodiac: Section;
  elements: Section;
  modalities: Section;
  faq: FaqEntry[];
};

export type ByDateContent = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  howItWorks: Section;
  cusp: Section;
  beyondSun: Section;
  faq: FaqEntry[];
};

// ─── Element layer ──────────────────────────────────────────────────────

export type ElementContent = {
  slug: ElementSlug;
  labelKa: string;             // ცეცხლი / მიწა / ჰაერი / წყალი
  signs: ZodiacSlug[];         // 3 sign slugs in this element
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  career: string;
  compatibility: string;
  faq: FaqEntry[];
};

export type ElementsHubContent = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  fireBlurb: string;
  earthBlurb: string;
  airBlurb: string;
  waterBlurb: string;
  faq: FaqEntry[];
};

// ─── Compatibility layer ────────────────────────────────────────────────

export type CompatibilityScore = "ძლიერი" | "ჰარმონიული" | "გამომწვევი";

export type PairContent = {
  slug: string;                // e.g. "aries-leo" (sorted by canonical index)
  signA: ZodiacSlug;
  signB: ZodiacSlug;
  labelA: string;
  labelB: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  overallScore: CompatibilityScore;
  overall: string;
  love: string;
  friendship: string;
  communication: string;
  strengths: string[];
  challenges: string[];
  verdict: string;
  faq: FaqEntry[];
};

export type CompatibilityHubContent = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  howItWorks: Section;
  elementsRule: Section;
  beyondSun: Section;
  faq: FaqEntry[];
};

// ─── Combined shape ─────────────────────────────────────────────────────

type RawShape = {
  signs: Record<string, SignContent>;
  hub: HubContent;
  byDate: ByDateContent;
  elementsHub?: ElementsHubContent;
  elements?: Record<string, ElementContent>;
  compatibilityHub?: CompatibilityHubContent;
  pairs?: Record<string, PairContent>;
};

const data = rawData as unknown as RawShape;

export const SIGNS_CONTENT: Record<ZodiacSlug, SignContent> =
  data.signs as Record<ZodiacSlug, SignContent>;
export const HUB_CONTENT: HubContent = data.hub;
export const BY_DATE_CONTENT: ByDateContent = data.byDate;

export const ELEMENTS_HUB_CONTENT: ElementsHubContent | null =
  data.elementsHub ?? null;
export const ELEMENTS_CONTENT: Record<ElementSlug, ElementContent> | null =
  (data.elements as Record<ElementSlug, ElementContent>) ?? null;
export const COMPATIBILITY_HUB_CONTENT: CompatibilityHubContent | null =
  data.compatibilityHub ?? null;
export const PAIRS_CONTENT: Record<string, PairContent> | null =
  data.pairs ?? null;

/** Split a `\n\n`-separated body into paragraphs for rendering. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Resolve a Georgian sign label (e.g. "ლომი") to its canonical slug.
 * Used to convert LLM-generated compatibility entries into pair-page links.
 */
export function slugByLabelKa(labelKa: string): ZodiacSlug | null {
  const target = labelKa.trim();
  for (const [slug, sign] of Object.entries(SIGNS_CONTENT) as Array<
    [ZodiacSlug, SignContent]
  >) {
    if (sign.labelKa === target) return slug;
  }
  return null;
}
