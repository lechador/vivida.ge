import { describe, expect, it } from "vitest";

import { pricingCountryForRequest } from "@/lib/pricing-country";
import { paywallPrimaryOffer } from "@/lib/paywall-offer";

const h = (init: Record<string, string>) => new Headers(init);

describe("pricingCountryForRequest", () => {
  it("prefers the IP country over stored residence", () => {
    expect(
      pricingCountryForRequest(h({ "x-vercel-ip-country": "US" }), {
        countryCode: "GE",
      }),
    ).toBe("US");
  });

  it("falls back to stored residence when no geo header", () => {
    expect(pricingCountryForRequest(h({}), { countryCode: "gb" })).toBe("GB");
  });

  it("falls back to the host market with no signal at all", () => {
    expect(pricingCountryForRequest(h({ host: "www.vivida.ge" }), null)).toBe(
      "GE",
    );
    expect(
      pricingCountryForRequest(h({ host: "www.vividaastro.com" }), null),
    ).toBe("US");
    expect(
      pricingCountryForRequest(
        h({ host: "www.vividaastro.com", "x-vivida-locale": "pl" }),
        null,
      ),
    ).toBe("PL");
  });
});

describe("paywallPrimaryOffer", () => {
  it("labels from the passed country, not the GE catalogue", () => {
    const us = paywallPrimaryOffer({
      product: "synastry",
      countryCode: "US",
      locale: "en",
    });
    expect(us.pack.currency).toBe("usd");
    expect(us.label).toContain("$2.99");
    const de = paywallPrimaryOffer({
      product: "synastry",
      countryCode: "DE",
      locale: "en",
    });
    expect(de.pack.currency).toBe("usd");
    const ge = paywallPrimaryOffer({
      product: "synastry",
      countryCode: "GE",
      locale: "ka",
    });
    expect(ge.pack.currency).toBe("gel");
  });
});
