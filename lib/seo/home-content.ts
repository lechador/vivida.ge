/**
 * Typed accessor for the LLM-generated home page Georgian copy. The JSON
 * is committed (see scripts/generate-home-content.mjs) so build-time
 * pages don't need OPENROUTER_API_KEY. Re-run the script + commit when
 * refreshing copy.
 */

import rawData from "./home-content.json";

export type HeroContent = {
  kicker: string;
  headlinePre: string;
  headlineGradient: string;
  headlinePost: string;
  subhead: string;
  ctaPrimary: string;
  ctaPrimaryLoading: string;
  microNotes: string[];
  secondary: string;
};

export type Pillar = { title: string; body: string };

export type Section = { kicker?: string; title: string; body: string };

export type HowItWorksStep = { n: number; title: string; body: string };

export type Feature = { title: string; body: string };

export type FaqEntry = { q: string; a: string };

export type FinalCtaContent = {
  title: string;
  body: string;
  ctaText: string;
  subtext: string;
};

export type HomeContent = {
  hero: HeroContent;
  pillars: Pillar[];
  whatIsSection: Section;
  howItWorks: { title: string; steps: HowItWorksStep[] };
  features: Feature[];
  faq: FaqEntry[];
  finalCta: FinalCtaContent;
};

export const HOME_CONTENT = rawData as HomeContent;
