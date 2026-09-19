import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import { PremiumReport } from "@/components/pdf/premium-report";
import type { NatalChartJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  areaTier,
  aspectKindKa,
  buildPremiumReportContent,
  kaSignGenitive,
  kaSignLocative,
} from "@/lib/reports/premium-content";
import { resolveRelationshipReportView } from "@/lib/reports/relationship-view";
import type { ReportProductKey } from "@/lib/report-catalog";
import { signByIndex } from "@/lib/zodiac";

const BODY_KEYS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

function chart(shift = 0): NatalChartJson {
  return {
    ascendant: {
      longitude: 180 + shift,
      signIndex: 6,
      signDegree: shift,
      house: 1,
    },
    midheaven: {
      longitude: 90 + shift,
      signIndex: 3,
      signDegree: shift,
      house: 10,
    },
    bodies: Object.fromEntries(
      BODY_KEYS.map((key, index) => {
        const longitude = (15 + index * 30 + shift) % 360;
        return [
          key,
          {
            longitude,
            signIndex: Math.floor(longitude / 30),
            signDegree: longitude % 30,
            house: (index % 12) + 1,
          },
        ];
      }),
    ) as NatalChartJson["bodies"],
    houses: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      cuspLongitude: index * 30,
      signIndex: index,
    })),
    aspects: [],
  };
}

describe("premium report content", () => {
  it("produces all four English reports without other-script copy", () => {
    const primary = chart();
    const partner = chart(7);
    for (const type of [
      "annual",
      "relationship",
      "career",
      "timing",
    ] satisfies ReportProductKey[]) {
      const content = buildPremiumReportContent({
        type,
        chart: primary,
        locale: "en",
        firstName: "Anna",
        timezone: "Asia/Tbilisi",
        partner:
          type === "relationship"
            ? { name: "Partner", chart: partner }
            : undefined,
        now: new Date("2026-08-26T12:00:00Z"),
      });
      const serialized = JSON.stringify(content);
      expect(serialized).not.toMatch(/[ა-ჰ]/);
      expect(serialized).not.toMatch(/[Ա-ֆ]/);
      expect(content.sections).toHaveLength(4);
    }
  });

  it("renders every English report as a valid PDF", async () => {
    const primary = chart();
    const partner = chart(7);
    for (const type of [
      "annual",
      "relationship",
      "career",
      "timing",
    ] satisfies ReportProductKey[]) {
      const content = buildPremiumReportContent({
        type,
        chart: primary,
        locale: "en",
        firstName: "Anna",
        timezone: "Asia/Tbilisi",
        partner:
          type === "relationship"
            ? { name: "Partner", chart: partner }
            : undefined,
        now: new Date("2026-08-26T12:00:00Z"),
      });
      const pdf = await renderToBuffer(
        PremiumReport({ content, locale: "en" }),
      );
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
      expect(pdf.length).toBeGreaterThan(10_000);
    }
  });
});

describe("sign-name declension", () => {
  const ka = Array.from(
    { length: 12 },
    (_, index) => signByIndex(index).labelKa,
  );

  it("declines every Georgian sign without a hyphen", () => {
    expect(ka.map(kaSignGenitive)).toEqual([
      "ვერძის",
      "კუროს",
      "ტყუპების",
      "კირჩხიბის",
      "ლომის",
      "ქალწულის",
      "სასწორის",
      "მორიელის",
      "მშვილდოსანის",
      "თხის რქის",
      "მერწყულის",
      "თევზების",
    ]);
    expect(ka.map(kaSignLocative)).toEqual([
      "ვერძში",
      "კუროში",
      "ტყუპებში",
      "კირჩხიბში",
      "ლომში",
      "ქალწულში",
      "სასწორში",
      "მორიელში",
      "მშვილდოსანში",
      "თხის რქაში",
      "მერწყულში",
      "თევზებში",
    ]);
  });

  it("names every aspect in Georgian and tiers every score band", () => {
    expect([
      aspectKindKa("conjunction"),
      aspectKindKa("sextile"),
      aspectKindKa("square"),
      aspectKindKa("trine"),
      aspectKindKa("opposition"),
    ]).toEqual(["შეერთება", "სექსტილი", "კვადრატი", "ტრინი", "ოპოზიცია"]);
    expect([
      areaTier(90, "ka"),
      areaTier(70, "ka"),
      areaTier(40, "ka"),
    ]).toEqual(["ძლიერი", "სტაბილური", "განვითარებადი"]);
    expect([
      areaTier(90, "en"),
      areaTier(70, "en"),
      areaTier(40, "en"),
    ]).toEqual(["strong", "steady", "developing"]);
  });
});

describe("report depth and language purity", () => {
  const MIN_PROSE: Record<ReportProductKey, number> = {
    annual: 1500,
    relationship: 1100,
    career: 1100,
    timing: 2500,
  };

  for (const type of [
    "annual",
    "relationship",
    "career",
    "timing",
  ] satisfies ReportProductKey[]) {
    for (const locale of ["ka", "en"] satisfies UserLocale[]) {
      it(`fills the ${type} report with substantial copy in ${locale}`, () => {
        const firstName = locale === "ka" ? "ნინო" : "Anna";
        const content = buildPremiumReportContent({
          type,
          chart: chart(),
          locale,
          firstName,
          timezone: "Asia/Tbilisi",
          partner:
            type === "relationship"
              ? { name: "Partner", chart: chart(7) }
              : undefined,
          now: new Date("2026-08-26T12:00:00Z"),
        });
        const prose = [
          content.title,
          content.subtitle,
          content.overview,
          content.closing,
          ...content.sections.flatMap((section) => [
            section.title,
            section.body,
            ...(section.highlights ?? []),
          ]),
          ...(content.keyDates ?? []).flatMap((date) => [
            date.title,
            date.note,
          ]),
          ...content.actionPlan,
        ].join("");
        expect(content.sections.length).toBeGreaterThanOrEqual(4);
        for (const section of content.sections) {
          expect(section.title.length).toBeGreaterThan(0);
          expect(section.body.length).toBeGreaterThanOrEqual(50);
        }
        expect(content.actionPlan.length).toBeGreaterThanOrEqual(4);
        if (type === "annual")
          expect(content.keyDates?.length).toBeGreaterThanOrEqual(6);
        if (type === "timing")
          expect(content.keyDates?.length).toBeGreaterThanOrEqual(10);
        expect(prose.length).toBeGreaterThan(MIN_PROSE[type]);
        expect(prose).not.toMatch(/undefined|null|NaN|TODO|Lorem|FIXME/);
      });

      it(`keeps the ${type}/${locale} copy in its own script`, () => {
        const content = buildPremiumReportContent({
          type,
          chart: chart(),
          locale,
          firstName: "Test",
          timezone: "Asia/Tbilisi",
          partner:
            type === "relationship"
              ? { name: "Partner", chart: chart(7) }
              : undefined,
          now: new Date("2026-08-26T12:00:00Z"),
        });
        const serialized = JSON.stringify(content);
        // Hyphen-glued case endings are never grammatical in ka/am.
        expect(serialized).not.toMatch(/[ა-ჰ]-ში/);
        expect(serialized).not.toMatch(/[ა-ჰ]-ის/);
        expect(serialized).not.toMatch(/[Ա-ֆ]-ում/);
        if (locale === "ka") {
          expect(serialized).toMatch(/[ა-ჰ]/);
          expect(serialized).not.toMatch(/[Ա-ֆ]/);
          if (type === "relationship") {
            expect(serialized).not.toMatch(
              /conjunction|sextile|square|trine|opposition/,
            );
          }
        }
        if (locale === "en") {
          expect(serialized).not.toMatch(/[ა-ჰ]/);
          expect(serialized).not.toMatch(/[Ա-ֆ]/);
        }
      });
    }
  }
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
    const view = resolveRelationshipReportView({
      reportUserId: "owner-user",
      purchaserChart,
      relationship,
    });
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
