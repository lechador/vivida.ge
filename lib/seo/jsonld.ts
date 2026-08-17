/**
 * Centralized JSON-LD builders. Every public SEO page emits structured
 * data — keeping the shapes in one module means rich-snippet eligibility
 * doesn't drift as new routes are added (daily/weekly/monthly horoscopes,
 * love per sign, moon calendar). Each builder returns a plain object;
 * the caller serializes it into a <script type="application/ld+json">.
 *
 * Why not a single mega-helper? Article/FAQPage/BreadcrumbList have
 * different mandatory fields and Google treats them as independent
 * snippets, so we keep them composable instead.
 */

import { isEnglishHost } from "./locales";
import { stripArmenianPrefix } from "@/lib/i18n/armenian-routes";

const SITE_URL = "https://www.vivida.ge";

/**
 * The same builders serve all language domains, so the page URL is the
 * only reliable locale signal available to a synchronous helper. Deriving
 * it here keeps `inLanguage` correct without every call site threading a
 * locale through — English pages pass vividaastro.com, Armenian pass /am.
 */
function inLanguageFor(url: string): "en" | "ka-GE" | "hy-AM" {
  try {
    const parsed = new URL(url);
    if (stripArmenianPrefix(parsed.pathname) !== null) {
      return "hy-AM";
    }
    return isEnglishHost(parsed.host) ? "en" : "ka-GE";
  } catch {
    return "ka-GE";
  }
}

const ORG = {
  "@type": "Organization" as const,
  name: "Vivida",
  url: SITE_URL,
  // app/apple-icon.png is the only raster brand asset we actually serve;
  // Google needs publisher.logo to be a fetchable image, not a 404.
  logo: `${SITE_URL}/apple-icon.png`,
};

export type JsonLd = Record<string, unknown>;

export interface ArticleInput {
  /** Page URL, absolute. */
  url: string;
  /** Plain string for <h1>/search results — NOT html. */
  headline: string;
  description: string;
  /** ISO 8601. Defaults to build time for evergreen pages. */
  datePublished?: string;
  /** ISO 8601. Set when content regenerates (daily horoscopes). */
  dateModified?: string;
  /** Optional related entity (Thing/Person/Place). */
  about?: JsonLd;
  /** Optional image URL — pulls the per-page OG card if you have one. */
  image?: string;
}

export function articleLd(input: ArticleInput): JsonLd {
  const now = new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    inLanguage: inLanguageFor(input.url),
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    author: ORG,
    publisher: ORG,
    datePublished: input.datePublished ?? now,
    dateModified: input.dateModified ?? input.datePublished ?? now,
    ...(input.about && { about: input.about }),
    ...(input.image && { image: input.image }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * BreadcrumbList — Google uses this to render the URL line in SERP as a
 * breadcrumb trail instead of the raw path. Always include the canonical
 * root so the trail is rooted, even on shallow pages.
 */
export function breadcrumbLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FaqEntry {
  q: string;
  a: string;
}

export function faqLd(entries: FaqEntry[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.q,
      acceptedAnswer: { "@type": "Answer", text: e.a },
    })),
  };
}

/**
 * WebSite + SearchAction — emitted once on the home page so Google's
 * sitelinks search box surfaces in branded queries ("vivida" → results
 * with an inline search). Don't emit per-page; only on `/`.
 */
export function websiteLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_URL,
    name: "Vivida",
    inLanguage: "ka-GE",
    publisher: ORG,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/zodiac/datit?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Renders a `<script type="application/ld+json">` payload. Returns the
 * raw string the page should set via dangerouslySetInnerHTML. Multiple
 * blocks per page are fine — bundle one per @type so Google can parse
 * each independently.
 */
export function serializeLd(ld: JsonLd | JsonLd[]): string {
  return JSON.stringify(ld);
}
