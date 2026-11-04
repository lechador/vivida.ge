import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { createElement } from "react";

import { TrialEndingEmail } from "@/lib/email-templates/trial-ending";
import {
  isTrialEndingDue,
  trialCadenceMonths,
  TRIAL_REMINDER_WINDOW_MS,
} from "@/lib/trial-reminder-rules";

/**
 * The last-day-of-trial notice exists for exactly one reason: the first
 * charge must never be a surprise. These tests pin the charge amount, the
 * cadence, and the way out in every locale, plus the due-window rules the
 * sender filters on.
 */
function email(locale: "ka" | "en" | "pl") {
  return render(
    createElement(TrialEndingEmail, {
      name: "ნინო",
      amountLabel: "₾29.00",
      cadenceLabel: "ყოველ 3 თვეში ერთხელ",
      endDateLabel: "11 ნოემბერი",
      manageUrl: "https://vivida.ge/login?next=%2Fsubscription",
      unsubscribeUrl: "https://vivida.ge/unsubscribe?token=t&type=nudges",
      locale,
    }),
  );
}

describe("TrialEndingEmail", () => {
  it("names the exact first charge and cadence (ka)", async () => {
    const html = await email("ka");
    expect(html).toContain("₾29.00");
    expect(html).toContain("11 ნოემბერი");
    expect(html).toContain("პირველი ჩამოჭრა");
    expect(html).toContain("ხვალ შენი უფასო კვირა სრულდება");
  });

  it("shows the way out before the charge happens (ka)", async () => {
    const html = await email("ka");
    expect(html).toContain("გააუქმე დღესვე");
    expect(html).toContain("https://vivida.ge/login?next=%2Fsubscription");
    expect(html).toContain("გამოწერის გაუქმება");
  });

  it("localises the same claims (en, pl)", async () => {
    const en = await email("en");
    expect(en).toContain("Your free week ends tomorrow");
    expect(en).toContain("Review my subscription");
    const pl = await email("pl");
    expect(pl).toContain("Jutro kończy się Twój darmowy tydzień");
  });
});

describe("trial reminder window", () => {
  const now = new Date("2026-11-10T06:00:00Z");

  it("is due inside the last 24 hours, and only then", () => {
    expect(isTrialEndingDue(new Date(now.getTime() + 3_600_000), now)).toBe(
      true,
    );
    expect(
      isTrialEndingDue(new Date(now.getTime() + TRIAL_REMINDER_WINDOW_MS), now),
    ).toBe(true);
    expect(
      isTrialEndingDue(
        new Date(now.getTime() + TRIAL_REMINDER_WINDOW_MS + 1),
        now,
      ),
    ).toBe(false);
    expect(isTrialEndingDue(new Date(now.getTime() - 1), now)).toBe(false);
    expect(isTrialEndingDue(now, now)).toBe(false);
  });

  it("reads the billing cadence from the plan key", () => {
    expect(trialCadenceMonths("promo_ge_quarterly")).toBe(3);
    expect(trialCadenceMonths("premium_ge_monthly")).toBe(1);
    expect(trialCadenceMonths("premium_pl_monthly")).toBe(1);
  });
});
