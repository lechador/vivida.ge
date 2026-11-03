import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { createElement } from "react";

import { ProTrialEmail } from "@/lib/email-templates/pro-trial";

/**
 * The trial launch email is one send to the whole consented base, so its
 * load-bearing claims are pinned here: zero price today, both post-trial
 * plan prices named, the CTA and the unsubscribe link present.
 */
function email(locale: "ka" | "en" | "pl") {
  return render(
    createElement(ProTrialEmail, {
      name: "ნინო",
      trialDays: 7,
      zeroPriceLabel: "₾0.00",
      monthlyPriceLabel: "₾19.90",
      quarterlyPriceLabel: "₾29.00",
      quarterlyPerMonthLabel: "₾9.67",
      trialUrl: "https://vivida.ge/login?next=%2Fsubscription",
      unsubscribeUrl: "https://vivida.ge/unsubscribe?token=t&type=marketing",
      locale,
    }),
  );
}

describe("ProTrialEmail", () => {
  it("leads with the free week and zero charge today (ka)", async () => {
    const html = await email("ka");
    expect(html).toContain("7 დღე");
    expect(html).toContain("₾0.00");
    expect(html).toContain("სალამი, ნინო!");
  });

  it("names both post-trial choices with real prices (ka)", async () => {
    const html = await email("ka");
    expect(html).toContain("₾29.00");
    expect(html).toContain("₾9.67");
    expect(html).toContain("₾19.90");
    expect(html).toContain("არჩევანი შენზეა");
  });

  it("carries the trial CTA and the unsubscribe link", async () => {
    const html = await email("ka");
    expect(html).toContain("https://vivida.ge/login?next=%2Fsubscription");
    expect(html).toContain("დაიწყე უფასო 7 დღე");
    expect(html).toContain("გამოწერის გაუქმება");
  });

  it("localises the same claims (en, pl)", async () => {
    const en = await email("en");
    expect(en).toContain("7 days");
    expect(en).toContain("Start my free 7 days");
    const pl = await email("pl");
    expect(pl).toContain("7 dni");
    expect(pl).toContain("Zacznij darmowe 7 dni");
  });

  it("renders without a quarterly plan (monthly-only markets)", async () => {
    const html = await render(
      createElement(ProTrialEmail, {
        name: null,
        trialDays: 7,
        zeroPriceLabel: "£0.00",
        monthlyPriceLabel: "£9.99",
        quarterlyPriceLabel: null,
        quarterlyPerMonthLabel: null,
        trialUrl: "https://www.vividaastro.com/login?next=%2Fsubscription",
        unsubscribeUrl: "https://www.vividaastro.com/unsubscribe?token=t",
        locale: "en",
      }),
    );
    expect(html).toContain("£9.99");
    expect(html).toContain("After that, £9.99 a month");
  });
});
