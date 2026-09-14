/**
 * Typed accessors for the full English translated zodiac SEO content.
 * Reads from lib/seo/zodiac-content-en.json (which contains the direct, rich translations
 * of zodiac-content.json).
 */

import rawData from "./zodiac-content-en.json";
import type { ElementSlug, ZodiacSlug } from "./zodiac-dates";

export type CompatibilityLevelEn = "Strong" | "Harmonious" | "Challenging";

export type CompatibilityEntryEn = {
  signEn?: string;
  signKa?: string;
  level: CompatibilityLevelEn | string;
  note: string;
};

export type FaqEntryEn = { q: string; a: string };

export type SignContentEn = {
  slug: ZodiacSlug;
  labelEn: string;
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
  compatibility: CompatibilityEntryEn[];
  famous: string[];
  faq: FaqEntryEn[];
};

export type SectionEn = { title: string; body: string };

export type HubContentEn = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  whatIsZodiac: SectionEn;
  elements: SectionEn;
  modalities: SectionEn;
  faq: FaqEntryEn[];
};

export type ByDateContentEn = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  howItWorks: SectionEn;
  cusp: SectionEn;
  beyondSun: SectionEn;
  faq: FaqEntryEn[];
};

export type ElementContentEn = {
  slug: ElementSlug;
  labelEn: string;
  signs: ZodiacSlug[];
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
  faq: FaqEntryEn[];
};

export type ElementsHubContentEn = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  fireBlurb: string;
  earthBlurb: string;
  airBlurb: string;
  waterBlurb: string;
  faq: FaqEntryEn[];
};

export type MoonSignContentEn = {
  slug: ZodiacSlug;
  labelEn: string;
  symbol: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  intro: string;
  emotionalCore: string;
  love: string;
  shadow: string;
  compatibility: string;
  famous: string[];
  faq: FaqEntryEn[];
};

export type MoonHubContentEn = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  whatItMeans: SectionEn;
  vsSun: SectionEn;
  howToFind: SectionEn;
  faq: FaqEntryEn[];
};

export type RisingSignContentEn = {
  slug: ZodiacSlug;
  labelEn: string;
  symbol: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  intro: string;
  firstImpression: string;
  appearance: string;
  approach: string;
  bestPaired: string;
  famous: string[];
  faq: FaqEntryEn[];
};

export type RisingHubContentEn = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  whatItMeans: SectionEn;
  vsSun: SectionEn;
  howToFind: SectionEn;
  faq: FaqEntryEn[];
};

export type PairContentEn = {
  slug: string;
  signA: ZodiacSlug;
  signB: ZodiacSlug;
  labelA: string;
  labelB: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  overallScore: CompatibilityLevelEn | string;
  overall: string;
  love: string;
  friendship: string;
  communication: string;
  strengths: string[];
  challenges: string[];
  verdict: string;
  faq: FaqEntryEn[];
};

export type CompatibilityHubContentEn = {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  howItWorks: SectionEn;
  elementsRule: SectionEn;
  beyondSun: SectionEn;
  faq: FaqEntryEn[];
};

export type YearlySectionEn = { title: string; body: string };
export type YearlyKeyDateEn = { date: string; note: string };

export type YearlyContentEn = {
  slug: ZodiacSlug;
  year: number;
  labelEn: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  overview: string;
  love: YearlySectionEn;
  career: YearlySectionEn;
  money: YearlySectionEn;
  health: YearlySectionEn;
  growth: YearlySectionEn;
  bestMonths: string[];
  hardMonths: string[];
  keyDates: YearlyKeyDateEn[];
  faq: FaqEntryEn[];
};

type RawDatasetEn = {
  signs?: Record<string, SignContentEn>;
  elements?: Record<string, ElementContentEn>;
  moons?: Record<string, MoonSignContentEn>;
  risings?: Record<string, RisingSignContentEn>;
  pairs?: Record<string, PairContentEn>;
  yearly?: Record<string, Record<string, YearlyContentEn>>;
  hub?: HubContentEn;
  byDate?: ByDateContentEn;
  elementsHub?: ElementsHubContentEn;
  compatibilityHub?: CompatibilityHubContentEn;
  moonHub?: MoonHubContentEn;
  risingHub?: RisingHubContentEn;
};

const typed = rawData as unknown as RawDatasetEn;

export const SIGNS_CONTENT_EN: Record<ZodiacSlug, SignContentEn> = (typed.signs || {}) as Record<ZodiacSlug, SignContentEn>;
export const ELEMENTS_CONTENT_EN: Record<ElementSlug, ElementContentEn> = (typed.elements || {}) as Record<ElementSlug, ElementContentEn>;
export const MOONS_CONTENT_EN: Record<ZodiacSlug, MoonSignContentEn> = (typed.moons || {}) as Record<ZodiacSlug, MoonSignContentEn>;
export const RISINGS_CONTENT_EN: Record<ZodiacSlug, RisingSignContentEn> = (typed.risings || {}) as Record<ZodiacSlug, RisingSignContentEn>;
export const PAIRS_CONTENT_EN: Record<string, PairContentEn> = (typed.pairs || {}) as Record<string, PairContentEn>;
export const YEARLY_CONTENT_EN: Record<string, Record<string, YearlyContentEn>> = (typed.yearly || {}) as Record<string, Record<string, YearlyContentEn>>;

export const HUB_CONTENT_EN: HubContentEn | undefined = typed.hub;
export const BY_DATE_CONTENT_EN: ByDateContentEn | undefined = typed.byDate;
export const ELEMENTS_HUB_CONTENT_EN: ElementsHubContentEn | undefined = typed.elementsHub;
export const COMPATIBILITY_HUB_CONTENT_EN: CompatibilityHubContentEn | undefined = typed.compatibilityHub;
export const MOON_HUB_CONTENT_EN: MoonHubContentEn | undefined = typed.moonHub;
export const RISING_HUB_CONTENT_EN: RisingHubContentEn | undefined = typed.risingHub;

export function yearlyContentEnFor(sign: ZodiacSlug, year: number | string): YearlyContentEn | undefined {
  return typed.yearly?.[String(year)]?.[sign];
}
