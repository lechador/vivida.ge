import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../", import.meta.url));
const page = readFileSync(`${root}app/dashboard/page.tsx`, "utf8");
const extras = readFileSync(
  `${root}components/dashboard/daily-dashboard.tsx`,
  "utf8",
);

describe("dashboard free-value-first ordering", () => {
  it("renders the delivered daily insight before promotional tools", () => {
    expect(page).toContain("<DailyDashboard");
    expect(page).toContain("<PopularTools");
    expect(page.indexOf("<DailyDashboard")).toBeLessThan(
      page.indexOf("<PopularTools"),
    );
  });

  it("keeps tarot and AI one tap away below the daily insight", () => {
    const tools = readFileSync(
      `${root}components/nav/popular-tools.tsx`,
      "utf8",
    );
    expect(tools).toContain('"/taro"');
    expect(tools).toContain('"/ask"');
    expect(page).toContain("<PopularTools");
  });

  it("keeps purchase prompts below the delivered free value", () => {
    expect(page.indexOf("<DailyDashboard")).toBeLessThan(
      page.indexOf("<DashboardBillingNudge"),
    );
  });

  it("shows the free daily ritual before the PRO teaser in the extras wave", () => {
    expect(extras).toContain("<DailyRitual");
    expect(extras).toContain("<ProDailyBrief");
    expect(extras.indexOf("<DailyRitual")).toBeLessThan(
      extras.indexOf("<ProDailyBrief"),
    );
  });

  it("keeps the weekly forecast and its lock below the daily ritual", () => {
    expect(extras.indexOf("<DailyRitual")).toBeLessThan(
      extras.indexOf("<WeeklyForecastLocked"),
    );
  });
});

describe("dashboard phone-gift popup removal", () => {
  it("does not mount or query the automatic popup from the dashboard", () => {
    expect(page).not.toContain("PhoneGiftPopup");
    expect(page).not.toContain("phoneGiftPopupEligible");
    expect(page).not.toContain("phoneGiftPopupDismissedAt");
  });
});
