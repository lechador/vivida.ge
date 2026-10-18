/**
 * Centralized JSON-LD builders. Every public SEO page emits structured
 * data, keeping the shapes in one module means rich-snippet eligibility
 * doesn't drift as new routes are added (daily/weekly/monthly horoscopes,
 * love per sign, moon calendar). Each builder returns a plain object;
 * the caller serializes it into a <script type="application/ld+json">.
 *
 * Why not a single mega-helper? Article/FAQPage/BreadcrumbList have
 * different mandatory fields and Google treats them as independent
 * snippets, so we keep them composable instead.
 */

import { isEnglishHost } from "./locales";
import { internationalPublicPath } from "@/lib/seo/public-paths";

const SITE_URL = "https://www.vivida.ge";

/**
 * The same builders serve all language domains, so the page URL is the
 * only reliable locale signal available to a synchronous helper. Deriving
 * it here keeps `inLanguage` correct without every call site threading a
 * locale through.
 */
function inLanguageFor(url: string): "en" | "ka-GE" {
  try {
    const parsed = new URL(url);
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
  /** Plain string for <h1>/search results, NOT html. */
  headline: string;
  description: string;
  /** Actual publication date in ISO 8601, when known. */
  datePublished?: string;
  /** Actual content update date in ISO 8601, when known. */
  dateModified?: string;
  /** Optional related entity (Thing/Person/Place). */
  about?: JsonLd;
  /** Optional image URL, pulls the per-page OG card if you have one. */
  image?: string;
}

export function articleLd(input: ArticleInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    inLanguage: inLanguageFor(input.url),
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    author: ORG,
    publisher: ORG,
    ...(input.datePublished && { datePublished: input.datePublished }),
    ...((input.dateModified ?? input.datePublished) && {
      dateModified: input.dateModified ?? input.datePublished,
    }),
    ...(input.about && { about: input.about }),
    ...(input.image && { image: input.image }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * BreadcrumbList, Google uses this to render the URL line in SERP as a
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

/** WebSite identity, emitted once on the home page. */
export function websiteLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_URL,
    name: "Vivida",
    inLanguage: "ka-GE",
    publisher: ORG,
  };
}

/**
 * Renders a `<script type="application/ld+json">` payload. Returns the
 * raw string the page should set via dangerouslySetInnerHTML. Multiple
 * blocks per page are fine, bundle one per @type so Google can parse
 * each independently.
 */
export function serializeLd(ld: JsonLd | JsonLd[]): string {
  return JSON.stringify(ld, (_key, value: unknown) => {
    if (typeof value !== "string" || !value.startsWith("http")) return value;

    try {
      const url = new URL(value);
      if (!isEnglishHost(url.host)) return value;

      url.pathname = internationalPublicPath(url.pathname);
      return url.toString();
    } catch {
      return value;
    }
  });
}
