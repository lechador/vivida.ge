import { render } from "@react-email/render";
import { describe, expect, it, vi } from "vitest";

/**
 * B11: Polish and English readers were getting Georgian email and push copy
 * because senders branched `locale === "en" ? en : ka`. Every outbound
 * template now takes all three languages; these tests render each one in
 * en/pl and fail on any Georgian character.
 */

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/block", () => ({ isBlockedEitherWay: vi.fn() }));
vi.mock("@/lib/push", () => ({
  isPushConfigured: () => false,
  sendPushToUser: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn() }));
vi.mock("@/lib/credits", () => ({ grantCredits: vi.fn() }));
vi.mock("@/lib/premium", () => ({ isPremiumUser: vi.fn() }));
vi.mock("@/lib/resend-throttle", () => ({ acquireResendSlot: vi.fn() }));

import type { NotificationKind } from "@/db/schema";
import { birthdayFallback, birthdaySubject } from "@/lib/birthday";
import { dailyEmailSubject } from "@/lib/daily-headline";
import { plCredits } from "@/lib/email-templates/_copy";
import { BirthdayEmail } from "@/lib/email-templates/birthday";
import { CreditGiftEmail } from "@/lib/email-templates/credit-gift";
import { DailyHoroscopeEmail } from "@/lib/email-templates/daily-horoscope";
import { MarketingEmail } from "@/lib/email-templates/marketing";
import { PersonalReminderEmail } from "@/lib/email-templates/personal-reminder";
import { ProfileIncompleteEmail } from "@/lib/email-templates/profile-incomplete";
import { copyFor } from "@/lib/notification-push";

const GEORGIAN = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
const LOCALES = ["en", "pl"] as const;

function templatesFor(locale: "en" | "pl") {
  return {
    birthday: BirthdayEmail({
      name: "Ana",
      paragraphs: birthdayFallback(locale, true),
      dashboardUrl: "https://www.vividaastro.com/dashboard",
      showGift: true,
      credits: 10,
      locale,
    }),
    creditGift: CreditGiftEmail({
      name: "Ana",
      balance: 2,
      amount: 10,
      tarotUrl: "https://www.vividaastro.com/taro",
      unsubscribeUrl: "https://www.vividaastro.com/unsubscribe",
      locale,
    }),
    daily: DailyHoroscopeEmail({
      name: "Ana",
      headline: "Headline",
      summary: "Summary",
      dashboardUrl: "https://www.vividaastro.com/dashboard",
      unsubscribeUrl: "https://www.vividaastro.com/unsubscribe",
      localizedDate: "Monday",
      locale,
    }),
    marketing: MarketingEmail({
      name: "Ana",
      heading: "Heading",
      body: "Body",
      unsubscribeUrl: "https://www.vividaastro.com/unsubscribe",
      locale,
    }),
    personalReminder: PersonalReminderEmail({
      name: "Ana",
      title: "Title",
      body: "Body",
      actionUrl: "https://www.vividaastro.com/timing",
      locale,
    }),
    profileIncomplete: ProfileIncompleteEmail({
      name: "Ana",
      onboardingUrl: "https://www.vividaastro.com/onboarding",
      unsubscribeUrl: "https://www.vividaastro.com/unsubscribe",
      locale,
    }),
  };
}

describe("outbound copy never falls back to Georgian", () => {
  for (const locale of LOCALES) {
    for (const [name, element] of Object.entries(templatesFor(locale))) {
      it(`${name} email renders without Georgian in ${locale}`, async () => {
        const html = await render(element);
        expect(html).not.toMatch(GEORGIAN);
      });
    }

    it(`birthday subject and fallback are ${locale}`, () => {
      expect(birthdaySubject(locale)).not.toMatch(GEORGIAN);
      for (const gifted of [true, false]) {
        expect(birthdayFallback(locale, gifted).join(" ")).not.toMatch(
          GEORGIAN,
        );
      }
    });

    it(`push copy is ${locale} for every social kind`, () => {
      const kinds: NotificationKind[] = [
        "friend_request",
        "friend_accepted",
        "post_comment",
        "post_reaction",
        "mention",
        "new_match",
        "relationship_connected",
        "relationship_weekly",
        "relationship_transit",
      ];
      for (const kind of kinds) {
        const copy = copyFor(kind, { postId: "p1", reaction: "like" }, locale);
        expect(copy, kind).not.toBeNull();
        expect(`${copy?.title} ${copy?.body}`, kind).not.toMatch(GEORGIAN);
      }
    });
  }

  it("Polish birthday email names the gift in Polish", async () => {
    const html = await render(templatesFor("pl").birthday);
    expect(html).toContain("10 kredytów");
  });

  it("Polish daily subject is prefixed in Polish", () => {
    expect(
      dailyEmailSubject({
        firstName: null,
        headline: "Dobry dzień",
        dateKey: "2026-11-10",
        locale: "pl",
      }),
    ).toBe("Dziś dla Ciebie: Dobry dzień");
  });

  it("Polish credit plurals", () => {
    expect(plCredits(1)).toBe("1 kredyt");
    expect(plCredits(3)).toBe("3 kredyty");
    expect(plCredits(5)).toBe("5 kredytów");
    expect(plCredits(12)).toBe("12 kredytów");
    expect(plCredits(22)).toBe("22 kredyty");
  });
});
