import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import { PremiumReport } from "@/components/pdf/premium-report";
import type { NatalChartJson } from "@/db/schema";
import { buildPremiumReportContent } from "@/lib/reports/premium-content";
import { resolveRelationshipReportView } from "@/lib/reports/relationship-view";
import type { ReportProductKey } from "@/lib/report-catalog";

const BODY_KEYS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const;

function chart(shift = 0): NatalChartJson {
  return {
    ascendant: { longitude: 180 + shift, signIndex: 6, signDegree: shift, house: 1 },
    midheaven: { longitude: 90 + shift, signIndex: 3, signDegree: shift, house: 10 },
    bodies: Object.fromEntries(BODY_KEYS.map((key, index) => {
      const longitude = (15 + index * 30 + shift) % 360;
      return [key, { longitude, signIndex: Math.floor(longitude / 30), signDegree: longitude % 30, house: (index % 12) + 1 }];
    })) as NatalChartJson["bodies"],
    houses: Array.from({ length: 12 }, (_, index) => ({ number: index + 1, cuspLongitude: index * 30, signIndex: index })),
    aspects: [],
  };
}

describe("premium report content", () => {
  it("produces all four Armenian reports without Georgian fallback copy", () => {
    const primary = chart();
    const partner = chart(7);
    for (const type of ["annual", "relationship", "career", "timing"] satisfies ReportProductKey[]) {
      const content = buildPremiumReportContent({
        type,
        chart: primary,
        locale: "am",
        firstName: "Անի",
        timezone: "Asia/Yerevan",
        partner: type === "relationship" ? { name: "Արամ", chart: partner } : undefined,
        now: new Date("2026-08-26T12:00:00Z"),
      });
      const serialized = JSON.stringify(content);
      expect(serialized).toMatch(/[Ա-ֆ]/);
      expect(serialized).not.toMatch(/[ა-ჰ]/);
      expect(content.sections).toHaveLength(4);
    }
  });

  it("embeds the Armenian font and renders every report as a valid PDF", async () => {
    const primary = chart();
    const partner = chart(7);
    for (const type of ["annual", "relationship", "career", "timing"] satisfies ReportProductKey[]) {
      const content = buildPremiumReportContent({
        type,
        chart: primary,
        locale: "am",
        firstName: "Անի",
        timezone: "Asia/Yerevan",
        partner: type === "relationship" ? { name: "Արամ", chart: partner } : undefined,
        now: new Date("2026-08-26T12:00:00Z"),
      });
      const pdf = await renderToBuffer(PremiumReport({ content, locale: "am" }));
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
      expect(pdf.length).toBeGreaterThan(10_000);
    }
  });
});

describe("relationship report perspective", () => {
  const purchaserChart = { data: chart(), inputHash: "purchaser" };
  const ownerChart = { data: chart(11), inputHash: "owner" };
  const relationship = {
    userId: "owner-user",
    linkedUserId: "linked-user",
    name: "Linked",
    chart: chart(7),
  };

  it("keeps the owner primary and uses the saved partner chart", () => {
    const view = resolveRelationshipReportView({ reportUserId: "owner-user", purchaserChart, relationship });
    expect(view.chart).toBe(purchaserChart);
    expect(view.partner).toEqual({ name: "Linked", chart: relationship.chart });
  });

  it("keeps the linked purchaser primary and compares them with the owner", () => {
    const view = resolveRelationshipReportView({
      reportUserId: "linked-user",
      purchaserChart,
      relationship,
      ownerChart,
      ownerName: "Owner Person",
    });
    expect(view.chart).toBe(purchaserChart);
    expect(view.partner).toEqual({ name: "Owner", chart: ownerChart.data });
  });
});
