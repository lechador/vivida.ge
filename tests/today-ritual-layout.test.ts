import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({ completeDailyRitual: vi.fn() }));
vi.mock("@/actions/daily-ritual", () => actions);
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    createElement("a", { href }, children),
}));

import { DailyRitual } from "@/components/dashboard/daily-ritual";
import type { DailyHoroscope } from "@/db/schema";

const horoscope: DailyHoroscope = {
  userId: "test-reader",
  date: "2026-10-04",
  headline: "ერთი მთავარი აზრი",
  summary: "დღის მოკლე შეჯამება.",
  body: "დეტალური განმარტება დამატებითი კონტექსტით.",
  themes: ["სიმშვიდე", "გამბედაობა", "ურთიერთობები"],
  transits: null,
  model: "test-fixture",
  language: "ka",
  createdAt: new Date("2026-10-04T00:00:00Z"),
};

function render(completed = false) {
  return renderToStaticMarkup(
    createElement(DailyRitual, {
      userId: "test-reader",
      horoscope,
      transits: [],
      initialProgress: {
        current: completed ? 7 : 0,
        longest: completed ? 7 : 0,
        todayComplete: completed,
        next: completed
          ? { days: 30, daysLeft: 23, credits: 2 }
          : { days: 7, daysLeft: 7, credits: 1 },
      },
      locale: "ka",
    }),
  );
}

describe("daily ritual action placement", () => {
  it("places the actual focus choices immediately after the summary, before optional forecast details", () => {
    const html = render();
    const summaryAt = html.indexOf(horoscope.summary);
    const focusAt = html.indexOf("დღის პატარა რიტუალი");
    const detailsAt = html.indexOf("<details");
    expect(summaryAt).toBeGreaterThan(-1);
    expect(detailsAt).toBeGreaterThan(-1);
    expect(focusAt).toBeGreaterThan(summaryAt);
    expect(focusAt).toBeLessThan(detailsAt);
  });

  it("keeps completed progress and reminder access without issuing another completion", () => {
    const html = render(true);
    expect(html).toContain("დღის რიტუალი დასრულებულია");
    expect(html).toContain("7 დღიანი სერია");
    expect(html).toContain('href="/account#reminders"');
    expect(actions.completeDailyRitual).not.toHaveBeenCalled();
  });
});
