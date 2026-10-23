import { describe, expect, it } from "vitest";

import { paywallPrimaryOffer } from "@/lib/paywall-offer";

describe("paywallPrimaryOffer", () => {
  it("names 2 more tarot readings at the Georgian starter price", () => {
    const offer = paywallPrimaryOffer({
      product: "tarot",
      countryCode: "GE",
      locale: "ka",
    });
    expect(offer.pack).toMatchObject({ credits: 25, amountMinor: 790 });
    expect(offer.label).toContain("2");
    expect(offer.label).toContain("₾7.90");
    expect(offer.detail).toContain("ერთჯერადი გადახდა");
    expect(offer.detail).toContain("ავტოგანახლების გარეშე");
  });

  it("counts tarot follow-ups from the follow-up cost, not the reading cost", () => {
    const offer = paywallPrimaryOffer({
      product: "tarot_followup",
      countryCode: "GE",
      locale: "ka",
    });
    expect(offer.label).toContain("5");
  });

  it("counts the new tarot spreads at their own costs", () => {
    // 25 credits covers five 5-credit yes/no spreads, but only one 15-credit
    // love spread, which therefore keeps the generic unlock wording.
    const yesNo = paywallPrimaryOffer({
      product: "tarot_yes_no",
      countryCode: "GE",
      locale: "ka",
    });
    expect(yesNo.label).toContain("5");
    expect(yesNo.label).toContain("₾7.90");

    const love = paywallPrimaryOffer({
      product: "tarot_love_5",
      countryCode: "GE",
      locale: "ka",
    });
    expect(love.label).toContain("გახსენი");
    expect(love.label).toContain("სიყვარულის");
  });

  it("names the locked outcome instead of a generic top-up for reports", () => {
    const offer = paywallPrimaryOffer({
      product: "natal_pdf",
      countryCode: "GE",
      locale: "ka",
    });
    expect(offer.label).toContain("PDF");
    expect(offer.label).toContain("₾7.90");
    expect(offer.label).not.toContain("შეავსე");
  });

  it("covers chat under its public ai_chart_chat product key", () => {
    const offer = paywallPrimaryOffer({
      product: "ai_chart_chat",
      countryCode: "GE",
      locale: "ka",
    });
    expect(offer.label).toContain("12");
  });

  it("falls back to a priced generic unlock for unknown products", () => {
    const offer = paywallPrimaryOffer({
      product: "brand_new_gate",
      countryCode: "GE",
      locale: "ka",
    });
    expect(offer.label).toContain("₾7.90");
    expect(offer.detail).toContain("25 კრედიტი");
  });

  it("keeps the same outcome naming in English", () => {
    const offer = paywallPrimaryOffer({
      product: "tarot",
      countryCode: "GE",
      locale: "en",
    });
    expect(offer.label).toContain("2 more tarot readings");
    expect(offer.detail).toContain("no auto-renewal");
  });

  it("prices the starter pack in the buyer's market", () => {
    const offer = paywallPrimaryOffer({
      product: "tarot",
      countryCode: "GB",
      locale: "en",
    });
    expect(offer.pack).toMatchObject({ amountMinor: 299, currency: "gbp" });
    expect(offer.label).toContain("£2.99");
  });
});
