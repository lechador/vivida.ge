import { describe, expect, it } from "vitest";
import { comparisonDateRanges } from "../agent/lib/date-windows";
import { extractHtmlSignals } from "../agent/tools/public_site_audit";
import { redactVercelAnalyticsEvent } from "../lib/analytics/vercel-privacy";

describe("weekly SEO agent", () => {
  it("builds equal, non-overlapping comparison windows with data lag", () => {
    expect(
      comparisonDateRanges(7, {
        lagDays: 3,
        now: new Date("2026-08-15T12:00:00.000Z"),
      }),
    ).toEqual({
      current: { startDate: "2026-08-06", endDate: "2026-08-12" },
      previous: { startDate: "2026-07-30", endDate: "2026-08-05" },
      days: 7,
      lagDays: 3,
    });
  });

  it("extracts bounded SEO signals regardless of link attribute order", () => {
    const signals = extractHtmlSignals(`
      <html lang="ka">
        <head>
          <title> Vivida — ტესტი </title>
          <meta content="აღწერა" name="description">
          <link href="https://www.vivida.ge/test" rel="canonical">
          <link href="https://www.vividaastro.com/test" hreflang="en" rel="alternate">
          <script type="application/ld+json">{}</script>
        </head>
      </html>
    `);

    expect(signals).toMatchObject({
      title: "Vivida — ტესტი",
      description: "აღწერა",
      lang: "ka",
      canonical: "https://www.vivida.ge/test",
      jsonLdBlocks: 1,
      alternates: [
        { hreflang: "en", href: "https://www.vividaastro.com/test" },
      ],
    });
  });

  it("removes query data and templates user-owned analytics paths", () => {
    expect(
      redactVercelAnalyticsEvent({
        type: "pageview",
        url: "https://www.vivida.ge/reports/private-id?token=secret#section",
      }),
    ).toEqual({
      type: "pageview",
      url: "https://www.vivida.ge/reports/[id]",
    });
  });
});
