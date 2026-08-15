import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchJson, safeIntegrationError } from "../lib/http";

const ORIGINS = {
  ge: "https://www.vivida.ge",
  astro: "https://www.vividaastro.com",
} as const;

type PageSpeedResponse = {
  lighthouseResult?: {
    categories?: Record<string, { score?: number }>;
    audits?: Record<
      string,
      { numericValue?: number; displayValue?: string; score?: number }
    >;
  };
};

function metric(response: PageSpeedResponse, id: string) {
  const audit = response.lighthouseResult?.audits?.[id];
  return audit
    ? {
        value: audit.numericValue ?? null,
        displayValue: audit.displayValue ?? null,
        score: audit.score ?? null,
      }
    : null;
}

export default defineTool({
  description:
    "Run bounded Google PageSpeed Insights lab audits for up to four Vivida public pages. Returns performance/SEO scores and core lab metrics; it does not expose user data.",
  inputSchema: z.object({
    strategy: z.enum(["mobile", "desktop"]).default("mobile"),
    targets: z
      .array(
        z.object({
          site: z.enum(["ge", "astro"]),
          path: z.string().regex(/^\/(?:[^\s?#]*)$/),
        }),
      )
      .min(1)
      .max(4),
  }),
  async execute({ strategy, targets }, ctx) {
    const results = await Promise.all(
      targets.map(async ({ site, path }) => {
        const pageUrl = `${ORIGINS[site]}${path}`;
        const endpoint = new URL(
          "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
        );
        endpoint.searchParams.set("url", pageUrl);
        endpoint.searchParams.set("strategy", strategy);
        endpoint.searchParams.append("category", "performance");
        endpoint.searchParams.append("category", "seo");
        try {
          const response = await fetchJson<PageSpeedResponse>(
            endpoint,
            { signal: ctx.abortSignal },
            90_000,
          );
          const categories = response.lighthouseResult?.categories ?? {};
          return {
            url: pageUrl,
            ok: true,
            strategy,
            performanceScore:
              categories.performance?.score == null
                ? null
                : Math.round(categories.performance.score * 100),
            seoScore:
              categories.seo?.score == null
                ? null
                : Math.round(categories.seo.score * 100),
            metrics: {
              fcp: metric(response, "first-contentful-paint"),
              lcp: metric(response, "largest-contentful-paint"),
              cls: metric(response, "cumulative-layout-shift"),
              tbt: metric(response, "total-blocking-time"),
              speedIndex: metric(response, "speed-index"),
            },
          };
        } catch (error) {
          return {
            url: pageUrl,
            ok: false,
            reason: safeIntegrationError(error),
          };
        }
      }),
    );

    return {
      available: results.some((result) => result.ok),
      source: "PageSpeed Insights",
      results,
    };
  },
});
