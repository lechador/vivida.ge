import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

import { DailyCard } from "@/components/dashboard/daily-card";
import type { DailyHoroscope } from "@/db/schema";
import type { TransitBreakdownItem } from "@/lib/transit-library";

const horoscope = {
  userId: "user-1",
  date: "2026-10-04",
  headline: "მშვიდი, მაგრამ გადამწყვეტი დღე",
  summary: "მოკლე შეჯამება დღის მთავარი ხაზით.",
  body: "პირველი გრძელი აბზაცი დეტალებით.\n\nმეორე გრძელი აბზაცი ტრანზიტების ახსნით.",
  themes: ["სიმშვიდე", "გამბედაობა"],
  transits: null,
  model: "test",
  language: "ka",
  createdAt: new Date("2026-10-04T00:00:00Z"),
} as unknown as DailyHoroscope;

const transits: TransitBreakdownItem[] = [
  {
    transit: "moon",
    natal: "sun",
    kind: "trine",
    title: "მთვარე ტრინი მზე",
    body: "ტრანზიტის გრძელი ახსნა.",
  } as TransitBreakdownItem,
];

function render(locale: "ka" | "en" = "ka") {
  const onRead = vi.fn();
  const html = renderToStaticMarkup(
    createElement(DailyCard, { horoscope, transits, onRead, locale }),
  );
  return { html, onRead };
}

describe("DailyCard first-value hierarchy", () => {
  it("shows headline and summary without requiring expansion", () => {
    const { html } = render();
    expect(html).toContain(horoscope.headline);
    expect(html).toContain(horoscope.summary);
    // Summary must render outside the expandable details block.
    const detailsAt = html.indexOf("<details");
    const summaryAt = html.indexOf(horoscope.summary);
    expect(detailsAt).toBeGreaterThan(-1);
    expect(summaryAt).toBeGreaterThan(-1);
    expect(summaryAt).toBeLessThan(detailsAt);
  });

  it("keeps the longer body and transit explanations inside an accessible details section", () => {
    const { html } = render();
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    const detailsBlock = html.slice(html.indexOf("<details"));
    expect(detailsBlock).toContain("პირველი გრძელი აბზაცი");
    expect(detailsBlock).toContain("მეორე გრძელი აბზაცი");
    expect(detailsBlock).toContain("ტრანზიტის გრძელი ახსნა");
  });

  it("does not report the card as read just because it rendered", () => {
    const { onRead } = render();
    expect(onRead).not.toHaveBeenCalled();
  });

  it("keeps the English copy working in the collapsed layout", () => {
    const onRead = vi.fn();
    const html = renderToStaticMarkup(
      createElement(DailyCard, { horoscope, transits, onRead, locale: "en" }),
    );
    expect(html).toContain(horoscope.headline);
    expect(html).toContain("<details");
    expect(onRead).not.toHaveBeenCalled();
  });
});
