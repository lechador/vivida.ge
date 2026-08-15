import { defineTool } from "eve/tools";
import { z } from "zod";
import { comparisonDateRanges, type DateRange } from "../lib/date-windows";
import { getGoogleAccessToken, hasGoogleServiceAccount } from "../lib/google-auth";
import { fetchJson, safeIntegrationError } from "../lib/http";

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const VALUE_EVENTS = [
  "compatibility_check_completed",
  "natal_chart_computed",
  "public_horoscope_read",
  "daily_horoscope_read",
  "tarot_reading_completed",
  "test_completed",
  "value_action",
];

type Header = { name?: string };
type Row = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};
type ReportResponse = {
  dimensionHeaders?: Header[];
  metricHeaders?: Header[];
  rows?: Row[];
  rowCount?: number;
};

function normalizeReport(response: ReportResponse) {
  const dimensions = (response.dimensionHeaders ?? []).map(
    (header) => header.name ?? "dimension",
  );
  const metrics = (response.metricHeaders ?? []).map(
    (header) => header.name ?? "metric",
  );
  return {
    rowCount: response.rowCount ?? 0,
    rows: (response.rows ?? []).map((row) => {
      const normalized: Record<string, string | number> = {};
      dimensions.forEach((name, index) => {
        normalized[name] = row.dimensionValues?.[index]?.value ?? "";
      });
      metrics.forEach((name, index) => {
        const raw = row.metricValues?.[index]?.value ?? "0";
        const numeric = Number(raw);
        normalized[name] = Number.isFinite(numeric) ? numeric : raw;
      });
      return normalized;
    }),
  };
}

async function runReport(
  propertyId: string,
  token: string,
  range: DateRange,
  body: Record<string, unknown>,
  signal: AbortSignal,
) {
  return fetchJson<ReportResponse>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...body, dateRanges: [range] }),
      signal,
    },
  );
}

function landingPageRequest() {
  return {
    dimensions: [
      { name: "hostName" },
      { name: "landingPagePlusQueryString" },
    ],
    metrics: [
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "engagementRate" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "screenPageViews" },
    ],
    dimensionFilter: {
      filter: {
        fieldName: "sessionDefaultChannelGroup",
        stringFilter: { matchType: "EXACT", value: "Organic Search" },
      },
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: "100",
  };
}

function eventRequest() {
  return {
    dimensions: [{ name: "hostName" }, { name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: { values: VALUE_EVENTS },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: "100",
  };
}

export default defineTool({
  description:
    "Read bounded aggregate GA4 organic landing-page and Vivida value-event metrics by hostname for a current and previous period. Never returns user identifiers or raw events.",
  inputSchema: z.object({
    days: z.union([z.literal(7), z.literal(28)]).default(28),
  }),
  async execute({ days }, ctx) {
    const ranges = comparisonDateRanges(days);
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!hasGoogleServiceAccount() || !propertyId) {
      return {
        available: false,
        source: "Google Analytics 4",
        reason: !propertyId
          ? "GA4_PROPERTY_ID is not configured"
          : "GOOGLE_SEO_SERVICE_ACCOUNT_JSON is not configured",
        ranges,
      };
    }

    try {
      const token = await getGoogleAccessToken(
        [ANALYTICS_SCOPE],
        ctx.abortSignal,
      );
      const [currentLanding, previousLanding, currentEvents, previousEvents] =
        await Promise.all([
          runReport(
            propertyId,
            token,
            ranges.current,
            landingPageRequest(),
            ctx.abortSignal,
          ),
          runReport(
            propertyId,
            token,
            ranges.previous,
            landingPageRequest(),
            ctx.abortSignal,
          ),
          runReport(
            propertyId,
            token,
            ranges.current,
            eventRequest(),
            ctx.abortSignal,
          ),
          runReport(
            propertyId,
            token,
            ranges.previous,
            eventRequest(),
            ctx.abortSignal,
          ),
        ]);

      return {
        available: true,
        source: "Google Analytics 4",
        ranges,
        current: {
          organicLandingPages: normalizeReport(currentLanding),
          valueEvents: normalizeReport(currentEvents),
        },
        previous: {
          organicLandingPages: normalizeReport(previousLanding),
          valueEvents: normalizeReport(previousEvents),
        },
      };
    } catch (error) {
      return {
        available: false,
        source: "Google Analytics 4",
        reason: safeIntegrationError(error),
        ranges,
      };
    }
  },
});
