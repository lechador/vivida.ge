import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { createElement } from "react";

import { CheckoutRecoveryEmail } from "@/lib/email-templates/checkout-recovery";
import { PmfSurveyEmail } from "@/lib/email-templates/pmf-survey";
import { isAbandonedCheckout } from "@/lib/checkout-recovery-rules";
import { isPmfAnswer, pmfScore } from "@/lib/pmf-survey-rules";

/**
 * Both emails exist to recover a decision the reader almost made. The
 * recovery email must link back to the purchase hub (and to the trial
 * only for readers who can actually start one), and the PMF survey must
 * carry three answer links and nothing competing with them.
 */
describe("CheckoutRecoveryEmail", () => {
  it("links back to the hub and offers the trial to eligible readers (ka)", async () => {
    const html = await render(
      createElement(CheckoutRecoveryEmail, {
        name: "ნინო",
        recoveryUrl: "https://vivida.ge/login?next=%2Fcredits",
        trialUrl: "https://vivida.ge/login?next=%2Fsubscription",
        trialDays: 7,
        unsubscribeUrl: "https://vivida.ge/unsubscribe?token=t&type=nudges",
        locale: "ka",
      }),
    );
    expect(html).toContain("ერთი ნაბიჯი დაგრჩა");
    expect(html).toContain("https://vivida.ge/login?next=%2Fcredits");
    expect(html).toContain("დაიწყე უფასო პერიოდი");
    expect(html).toContain("გამოწერის გაუქმება");
  });

  it("hides the trial link for readers with subscription history", async () => {
    const html = await render(
      createElement(CheckoutRecoveryEmail, {
        name: null,
        recoveryUrl: "https://www.vividaastro.com/login?next=%2Fcredits",
        trialUrl: null,
        trialDays: 7,
        unsubscribeUrl: "https://www.vividaastro.com/unsubscribe?token=t",
        locale: "en",
      }),
    );
    expect(html).toContain("One step left");
    expect(html).not.toContain("Start the free trial");
  });

  it("treats 1–48h old starts as abandoned, nothing fresher or older", () => {
    const now = new Date("2026-11-05T12:00:00Z");
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);
    expect(isAbandonedCheckout(hoursAgo(0.5), now)).toBe(false);
    expect(isAbandonedCheckout(hoursAgo(1), now)).toBe(true);
    expect(isAbandonedCheckout(hoursAgo(24), now)).toBe(true);
    expect(isAbandonedCheckout(hoursAgo(48), now)).toBe(true);
    expect(isAbandonedCheckout(hoursAgo(49), now)).toBe(false);
  });
});

describe("PmfSurveyEmail and scoring", () => {
  it("carries exactly the three signed answer links (ka)", async () => {
    const html = await render(
      createElement(PmfSurveyEmail, {
        name: "ნინო",
        answerUrls: {
          very_disappointed:
            "https://vivida.ge/api/pmf/respond?t=x&a=very_disappointed",
          somewhat_disappointed:
            "https://vivida.ge/api/pmf/respond?t=x&a=somewhat_disappointed",
          not_disappointed:
            "https://vivida.ge/api/pmf/respond?t=x&a=not_disappointed",
        },
        unsubscribeUrl: "https://vivida.ge/unsubscribe?token=t&type=marketing",
        locale: "ka",
      }),
    );
    expect(html).toContain("რას იგრძნობდი, Vivida რომ გაქრეს?");
    expect(html).toContain("a=very_disappointed");
    expect(html).toContain("a=somewhat_disappointed");
    expect(html).toContain("a=not_disappointed");
  });

  it("validates answers and computes the Sean Ellis share", () => {
    expect(isPmfAnswer("very_disappointed")).toBe(true);
    expect(isPmfAnswer("meh")).toBe(false);
    expect(isPmfAnswer(null)).toBe(false);
    expect(
      pmfScore([
        "very_disappointed",
        "very_disappointed",
        "not_disappointed",
        "somewhat_disappointed",
        "very_disappointed",
      ]),
    ).toBe(60);
    expect(pmfScore([])).toBe(0);
  });
});
