import { defineTool } from "eve/tools";
import { z } from "zod";
import { comparisonDateRanges, type DateRange } from "../lib/date-windows";
import { getGoogleAccessToken, hasGoogleServiceAccount } from "../lib/google-auth";
import { fetchJson, safeIntegrationError } from "../lib/http";

const SEARCH_CONSOLE_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";

type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
};

function configuredSites(): string[] {
  return (
    process.env.GSC_SITE_URLS ??
    "sc-domain:vivida.ge,sc-domain:vividaastro.com"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4);
}

async function query(
  site: string,
  range: DateRange,
  dimensions: string[],
  token: string,
  signal: AbortSignal,
): Promise<SearchAnalyticsRow[]> {
  const response = await fetchJson<SearchAnalyticsResponse>(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...range,
        dimensions,
        dataState: "final",
        rowLimit: dimensions.length === 0 ? 1 : 50,
        type: "web",
      }),
      signal,
    },
  );
  return response.rows ?? [];
}

function normalizeRows(rows: SearchAnalyticsRow[]) {
  return rows.map((row) => ({
    key: row.keys?.[0] ?? "all",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

export default defineTool({
  description:
    "Read bounded, aggregate Google Search Console performance for Vivida. Returns totals, top pages, and top queries for a current and previous period. No user-level data.",
  inputSchema: z.object({
    days: z.union([z.literal(7), z.literal(28)]).default(28),
  }),
  async execute({ days }, ctx) {
    const ranges = comparisonDateRanges(days);
    if (!hasGoogleServiceAccount()) {
      return {
        available: false,
        source: "Google Search Console",
        reason: "GOOGLE_SEO_SERVICE_ACCOUNT_JSON is not configured",
        ranges,
      };
    }

    try {
      const token = await getGoogleAccessToken(
        [SEARCH_CONSOLE_SCOPE],
        ctx.abortSignal,
      );
      const sites = await Promise.all(
        configuredSites().map(async (site) => {
          const [
            currentTotal,
            previousTotal,
            currentPages,
            previousPages,
            currentQueries,
            previousQueries,
          ] = await Promise.all([
            query(site, ranges.current, [], token, ctx.abortSignal),
            query(site, ranges.previous, [], token, ctx.abortSignal),
            query(site, ranges.current, ["page"], token, ctx.abortSignal),
            query(site, ranges.previous, ["page"], token, ctx.abortSignal),
            query(site, ranges.current, ["query"], token, ctx.abortSignal),
            query(site, ranges.previous, ["query"], token, ctx.abortSignal),
          ]);

          return {
            site,
            current: {
              total: normalizeRows(currentTotal)[0] ?? null,
              pages: normalizeRows(currentPages),
              queries: normalizeRows(currentQueries),
            },
            previous: {
              total: normalizeRows(previousTotal)[0] ?? null,
              pages: normalizeRows(previousPages),
              queries: normalizeRows(previousQueries),
            },
          };
        }),
      );

      return { available: true, source: "Google Search Console", ranges, sites };
    } catch (error) {
      return {
        available: false,
        source: "Google Search Console",
        reason: safeIntegrationError(error),
        ranges,
      };
    }
  },
});
