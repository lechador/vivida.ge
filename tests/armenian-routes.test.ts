import { describe, expect, it } from "vitest";

import {
  ARMENIAN_PREFIX,
  hasArmenianVersion,
  isArmenianCoreRoute,
  stripArmenianPrefix,
  withArmenianPrefix,
} from "@/lib/i18n/armenian-routes";
import { ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";
import {
  creditPacksForCountry,
  formatBillingAmount,
  premiumPlanForCountry,
} from "@/lib/billing-config";

describe("Armenian path prefix", () => {
  it("strips the prefix, mapping the Armenian home page to the root", () => {
    expect(stripArmenianPrefix("/am")).toBe("/");
    expect(stripArmenianPrefix("/am/")).toBe("/");
    expect(stripArmenianPrefix("/am/zodiac/vergo")).toBe("/zodiac/vergo");
  });

  it("returns null for paths that only look Armenian", () => {
    // The Georgian tree really does contain paths starting with "am" —
    // /zodiac/amomavali is the rising-sign cluster. A naive startsWith("/am")
    // would rewrite them into nonexistent routes.
    expect(stripArmenianPrefix("/zodiac/amomavali")).toBeNull();
    expect(stripArmenianPrefix("/amomavali")).toBeNull();
    expect(stripArmenianPrefix("/ambebi")).toBeNull();
    expect(stripArmenianPrefix("/")).toBeNull();
  });

  it("round-trips with withArmenianPrefix and is idempotent", () => {
    for (const path of ["/", "/zodiac", "/zodiac/vergo"]) {
      expect(stripArmenianPrefix(withArmenianPrefix(path))).toBe(path);
    }
    expect(withArmenianPrefix("/")).toBe(ARMENIAN_PREFIX);
    expect(withArmenianPrefix("/am/zodiac")).toBe("/am/zodiac");
  });

  it("treats only app/am routes as core, so the long tail gets rewritten", () => {
    expect(isArmenianCoreRoute("/natal-chart")).toBe(true);
    expect(isArmenianCoreRoute("/")).toBe(true);
    expect(isArmenianCoreRoute("/zodiac/vergo")).toBe(false);
  });
});

describe("Armenian hreflang gating", () => {
  it("claims an Armenian alternate only where the page exists", () => {
    expect(hasArmenianVersion("/natal-chart")).toBe(true);
    expect(hasArmenianVersion("/sizmris-akhsna")).toBe(false);
  });

  it("omits hy entirely on pages with no Armenian twin", () => {
    const alternates = localizedAlternates(
      "/sizmris-akhsna",
      "/sizmris-akhsna",
      "ka",
    );
    expect(alternates.languages).not.toHaveProperty("hy");
    expect(alternates.languages).not.toHaveProperty("hy-AM");
  });

  it("still emits hy on a translated page", () => {
    const alternates = localizedAlternates("/zodiac", "/zodiac", "en");
    expect(alternates.languages?.["hy-AM"]).toBe(
      `${ENGLISH_SITE_URL}/am/zodiac`,
    );
  });
});

describe("Armenian billing", () => {
  it("prices Armenia in dram rather than falling back to lari", () => {
    const plan = premiumPlanForCountry("AM");
    expect(plan?.currency).toBe("amd");
    // ֏2,990/month expressed in luma — AMD is two-decimal to Stripe.
    expect(plan?.amountMinor).toBe(299_000);

    const packs = creditPacksForCountry("AM");
    expect(packs.map((pack) => pack.amountMinor)).toEqual([
      99_000, 219_000, 429_000,
    ]);
    expect(packs.every((pack) => pack.currency === "amd")).toBe(true);
  });

  it("keeps credits-per-dram rising with pack size, as GE and GB do", () => {
    const packs = creditPacksForCountry("AM");
    const perDram = packs.map((pack) => pack.credits / pack.amountMinor);
    expect(perDram[1]).toBeGreaterThan(perDram[0]!);
    expect(perDram[2]).toBeGreaterThan(perDram[1]!);
  });

  it("undercuts the largest credit pack with PRO", () => {
    const largest = creditPacksForCountry("AM").at(-1)!;
    expect(premiumPlanForCountry("AM")!.amountMinor).toBeLessThan(
      largest.amountMinor,
    );
  });

  it("writes dram without decimals and with a trailing sign", () => {
    expect(formatBillingAmount(299_000, "amd", "am")).toBe("2,990 ֏");
    expect(formatBillingAmount(99_000, "amd", "am")).toBe("990 ֏");
  });

  it("does not disturb Georgian or English formatting", () => {
    expect(formatBillingAmount(1990, "gel", "ka")).toBe("₾19.90");
    expect(formatBillingAmount(999, "gbp", "en")).toBe("£9.99");
  });
});
