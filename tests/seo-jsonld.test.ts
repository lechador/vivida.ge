import { describe, expect, it } from "vitest";

import {
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
} from "@/lib/billing-config";
import { HOME_CONTENT } from "@/lib/seo/home-content";
import { faqLd, productLd } from "@/lib/seo/jsonld";

describe("home page structured data", () => {
  it("mirrors every FAQ entry rendered by FaqSection", () => {
    const ld = faqLd(HOME_CONTENT.faq);
    const questions = ld.mainEntity as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;

    expect(ld["@type"]).toBe("FAQPage");
    expect(questions).toHaveLength(HOME_CONTENT.faq.length);
    expect(questions.map((q) => q.name)).toEqual(
      HOME_CONTENT.faq.map((item) => item.q),
    );
    expect(questions.map((q) => q.acceptedAnswer.text)).toEqual(
      HOME_CONTENT.faq.map((item) => item.a),
    );
  });

  it("prices PRO and credit offers from the Georgian catalogue in GEL", () => {
    const plan = featuredPremiumPlanForCountry("GE");
    const packs = creditPacksForCountry("GE");
    const ld = productLd({
      name: "Vivida PRO / Credits",
      url: "https://www.vivida.ge",
      offers: [
        {
          name: "Vivida PRO",
          price: plan.amountMinor / 100,
          priceCurrency: plan.currency.toUpperCase(),
          url: "https://www.vivida.ge/subscription",
        },
        ...packs.map((pack) => ({
          name: `Vivida Credits — ${pack.credits} კრედიტი`,
          price: pack.amountMinor / 100,
          priceCurrency: pack.currency.toUpperCase(),
          url: "https://www.vivida.ge/credits",
        })),
      ],
    });
    const offers = ld.offers as Array<{
      price: string;
      priceCurrency: string;
      availability: string;
    }>;

    expect(ld["@type"]).toBe("Product");
    expect(offers).toHaveLength(packs.length + 1);
    expect(offers.every((offer) => offer.priceCurrency === "GEL")).toBe(true);
    expect(
      offers.every((offer) => offer.availability.endsWith("InStock")),
    ).toBe(true);
    expect(offers.map((offer) => offer.price)).toEqual([
      (plan.amountMinor / 100).toFixed(2),
      ...packs.map((pack) => (pack.amountMinor / 100).toFixed(2)),
    ]);
  });
});
