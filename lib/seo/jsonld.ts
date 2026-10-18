export type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

export function serializeLd(ld: JsonLd): string {
  return JSON.stringify(ld);
}

export function articleLd(input: {
  url: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  about?: Record<string, unknown>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished ?? "2026-01-01T00:00:00.000Z",
    dateModified: input.dateModified ?? input.datePublished ?? "2026-01-01T00:00:00.000Z",
    author: { "@type": "Organization", name: "Vivida" },
    publisher: { "@type": "Organization", name: "Vivida" },
    ...(input.about ? { about: input.about } : {}),
  };
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
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

export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
