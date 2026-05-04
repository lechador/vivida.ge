/**
 * Typed accessors for the LLM-generated zodiac SEO copy.
 *
 * The JSON itself is committed into the repo (see scripts/generate-zodiac-
 * content.mjs) so build-time pages don't need OPENROUTER_API_KEY at all —
 * Vercel/CI just renders the cached output. Re-run the script + commit
 * when you want to refresh content.
 */

import rawData from "./zodiac-content.json";
import type { ZodiacSlug } from "./zodiac-dates";

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

type RawShape = {
  signs: Record<string, SignContent>;
  hub: HubContent;
  byDate: ByDateContent;
};

const data = rawData as unknown as RawShape;

export const SIGNS_CONTENT: Record<ZodiacSlug, SignContent> =
  data.signs as Record<ZodiacSlug, SignContent>;
export const HUB_CONTENT: HubContent = data.hub;
export const BY_DATE_CONTENT: ByDateContent = data.byDate;

/** Split a `\n\n`-separated body into paragraphs for rendering. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
