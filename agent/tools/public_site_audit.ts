import { defineTool } from "eve/tools";
import { z } from "zod";
import { safeIntegrationError } from "../lib/http";

const ORIGINS = ["https://www.vivida.ge", "https://www.vividaastro.com"] as const;

function attribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"),
  );
  return match?.[1]?.trim() || null;
}

function firstMeta(html: string, name: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attribute(tag, "name")?.toLowerCase() === name.toLowerCase()) {
      return attribute(tag, "content");
    }
  }
  return null;
}

export function extractHtmlSignals(html: string) {
  const title = html
    .match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicalTag = links.find((tag) =>
    (attribute(tag, "rel") ?? "")
      .toLowerCase()
      .split(/\s+/)
      .includes("canonical"),
  );
  const alternates = links
    .filter((tag) =>
      (attribute(tag, "rel") ?? "")
        .toLowerCase()
        .split(/\s+/)
        .includes("alternate"),
    )
    .map((tag) => ({
      hreflang: attribute(tag, "hreflang"),
      href: attribute(tag, "href"),
    }))
    .filter((entry) => entry.hreflang && entry.href)
    .slice(0, 10);

  return {
    title: title || null,
    titleLength: title?.length ?? 0,
    description: firstMeta(html, "description"),
    robots: firstMeta(html, "robots"),
    lang: attribute(htmlTag, "lang"),
    canonical: canonicalTag ? attribute(canonicalTag, "href") : null,
    alternates,
    jsonLdBlocks: (
      html.match(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi,
      ) ?? []
    ).length,
  };
}

async function auditUrl(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    // Do not follow redirects: a public route must not be able to turn this
    // allowlisted fetcher into a request to a different host.
    redirect: "manual",
    headers: { "user-agent": "VividaWeeklyAudit/1.0" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(20_000)]),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const html = contentType.includes("text/html")
    ? (await response.text()).slice(0, 1_000_000)
    : "";
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    contentType,
    ...extractHtmlSignals(html),
  };
}

async function auditDiscovery(origin: string, signal: AbortSignal) {
  const [robots, sitemap] = await Promise.all([
    fetch(`${origin}/robots.txt`, {
      headers: { "user-agent": "VividaWeeklyAudit/1.0" },
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    }),
    fetch(`${origin}/sitemap.xml`, {
      headers: { "user-agent": "VividaWeeklyAudit/1.0" },
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    }),
  ]);
  const sitemapText = (await sitemap.text()).slice(0, 2_000_000);
  return {
    robotsStatus: robots.status,
    sitemapStatus: sitemap.status,
    sitemapUrlCount: (sitemapText.match(/<loc>/g) ?? []).length,
  };
}

export default defineTool({
  description:
    "Fetch only Vivida's two public domains and inspect HTTP status, canonical, hreflang, metadata, language, JSON-LD presence, robots.txt, and sitemap.xml. No arbitrary URLs are accepted.",
  inputSchema: z.object({
    paths: z
      .array(z.string().regex(/^\/(?:[^\s?#]*)$/))
      .min(1)
      .max(12)
      .default(["/", "/horoskopi", "/nataluri-ruka", "/mbti"]),
  }),
  async execute({ paths }, ctx) {
    const uniquePaths = [...new Set(paths)];
    try {
      const [discovery, pages] = await Promise.all([
        Promise.all(
          ORIGINS.map(async (origin) => ({
            origin,
            ...(await auditDiscovery(origin, ctx.abortSignal)),
          })),
        ),
        Promise.all(
          ORIGINS.flatMap((origin) =>
            uniquePaths.map((path) =>
              auditUrl(`${origin}${path}`, ctx.abortSignal),
            ),
          ),
        ),
      ]);
      return { available: true, source: "Public site audit", discovery, pages };
    } catch (error) {
      return {
        available: false,
        source: "Public site audit",
        reason: safeIntegrationError(error),
      };
    }
  },
});
