import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import {
  CREDIT_GIFT_SUBJECT,
  CreditGiftEmail,
} from "@/lib/email-templates/credit-gift";
import {
  CREDIT_GIFT_CAMPAIGN_SLUG,
  creditGiftGrantRef,
  creditGiftIdempotencyKey,
  creditGiftLogKind,
} from "@/lib/credit-gift-pure";

function props(overrides: Record<string, unknown> = {}) {
  return {
    name: "ნინო",
    balance: 0,
    amount: 10,
    tarotUrl: "https://vivida.ge/login?next=%2Ftaro",
    unsubscribeUrl: "https://vivida.ge/unsubscribe?token=x&type=marketing",
    ...overrides,
  } as Parameters<typeof CreditGiftEmail>[0];
}

describe("CreditGiftEmail", () => {
  it("KA variant announces credits already on the balance", async () => {
    const html = await render(CreditGiftEmail(props()));
    expect(html).toContain("სალამი, ნინო!");
    expect(html).toContain("10 უფასო კრედიტი უკვე დავამატეთ");
    expect(html).toContain("ტაროს გაშლა");
    expect(html).toContain("https://vivida.ge/login?next=%2Ftaro");
    expect(html).toContain("გამოწერის გაუქმება");
    expect(CREDIT_GIFT_SUBJECT).toContain("10 უფასო კრედიტი");
  });

  it("EN variant mirrors the KA copy", async () => {
    const html = await render(
      CreditGiftEmail(
        props({
          locale: "en",
          name: "Nino",
          tarotUrl: "https://www.vividaastro.com/login?next=%2Ftaro",
          unsubscribeUrl:
            "https://www.vividaastro.com/unsubscribe?token=x&type=marketing",
        }),
      ),
    );
    expect(html).toContain("Hello, Nino!");
    expect(html).toContain("10 free credits");
    expect(html).toContain("Unsubscribe");
  });

  it("names the exact remaining balance when it is above zero", async () => {
    const html = await render(CreditGiftEmail(props({ balance: 2 })));
    expect(html).toContain("სულ 2 კრედიტი დაგრჩა");
  });
});

describe("credit-gift test-send isolation", () => {
  it("keeps the real one-time grant ref untouched", () => {
    expect(creditGiftGrantRef("user-1", false)).toBe(
      `${CREDIT_GIFT_CAMPAIGN_SLUG}:user-1`,
    );
  });

  it("namespaces the test grant ref so previews never burn the real gift", () => {
    const real = creditGiftGrantRef("user-1", false);
    const test = creditGiftGrantRef("user-1", true);
    expect(test).toBe(`${real}:test`);
    expect(test).not.toBe(real);
  });

  it("logs test sends under a kind the real-run guard never matches", () => {
    expect(creditGiftLogKind(false)).toBe("credit_gift");
    expect(creditGiftLogKind(true)).toBe("credit_gift_test");
  });

  it("namespaces the Resend idempotency key for test sends", () => {
    expect(creditGiftIdempotencyKey("user-1", false)).toBe(
      "credit_gift:user-1",
    );
    expect(creditGiftIdempotencyKey("user-1", true)).toBe(
      "credit_gift:user-1:test",
    );
  });
});
