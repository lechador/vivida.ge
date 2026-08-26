import { render } from "@react-email/render";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { VerifiedBadgeGiftEmail } from "@/lib/email-templates/verified-badge-gift";
import { hasVerifiedBadge } from "@/lib/verified-badge";

describe("verified badge entitlement", () => {
  const now = Date.parse("2026-08-26T10:00:00.000Z");

  it("keeps an admin-gifted badge independent from Premium", () => {
    expect(hasVerifiedBadge({
      isPremium: false,
      premiumUntil: null,
      verifiedBadgeGrantedAt: new Date("2026-08-25T10:00:00.000Z"),
    }, now)).toBe(true);
  });

  it("continues to show the badge for an active Premium user", () => {
    expect(hasVerifiedBadge({
      isPremium: true,
      premiumUntil: new Date("2026-09-26T10:00:00.000Z"),
      verifiedBadgeGrantedAt: null,
    }, now)).toBe(true);
  });

  it("does not show a badge after Premium expires without a manual gift", () => {
    expect(hasVerifiedBadge({
      isPremium: true,
      premiumUntil: new Date("2026-08-25T10:00:00.000Z"),
      verifiedBadgeGrantedAt: null,
    }, now)).toBe(false);
  });
});

describe("VerifiedBadgeGiftEmail", () => {
  async function email(locale: "ka" | "en" | "am") {
    return render(createElement(VerifiedBadgeGiftEmail, {
      name: "Nino",
      profileUrl: "https://vivida.ge/u/nino",
      locale,
    }));
  }

  it("renders the Georgian gift notice and profile link", async () => {
    const html = await email("ka");
    expect(html).toContain("Verified Badge საჩუქრად მიიღე");
    expect(html).toContain("გამარჯობა, Nino!");
    expect(html).toContain("https://vivida.ge/u/nino");
  });

  it("renders localized English and Armenian notices", async () => {
    await expect(email("en")).resolves.toContain("You received a Verified Badge as a gift");
    await expect(email("am")).resolves.toContain("Դուք նվեր եք ստացել Verified Badge");
  });
});
