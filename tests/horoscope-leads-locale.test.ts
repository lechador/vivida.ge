import { render } from "@react-email/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  process.env.RESEND_API_KEY = "re_test_key";
  return {
    lead: null as Record<string, unknown> | null,
    send: vi.fn(),
    ensureSignHoroscope: vi.fn(),
  };
});

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("@/lib/resend-throttle", () => ({ acquireResendSlot: vi.fn() }));
vi.mock("@/actions/sign-horoscope", () => ({
  ensureSignHoroscope: mocks.ensureSignHoroscope,
}));
vi.mock("@/db", () => {
  const chain = {
    from: () => chain,
    where: () => chain,
    limit: async () => (mocks.lead ? [mocks.lead] : []),
  };
  return { db: { select: () => chain } };
});

import {
  leadLocale,
  leadSourceFor,
  sendLeadWelcome,
} from "@/lib/horoscope-leads";

const GEORGIAN = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;

function leadWith(source: string) {
  return {
    id: "lead-1",
    email: "a@example.com",
    sunSign: 0,
    big: null,
    source,
    unsubscribeToken: "tok",
    lastSentDate: null,
    unsubscribedAt: null,
    createdAt: new Date(),
  };
}

describe("horoscope lead locale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.send.mockResolvedValue({ data: { id: "e1" }, error: null });
    mocks.ensureSignHoroscope.mockImplementation(
      async (_s: string, _p: string, _d: Date, language: string) => ({
        headline: `headline-${language}`,
        summary: `summary-${language}`,
        body: `body-${language}`,
      }),
    );
  });

  it("round-trips the language through source, legacy rows stay Georgian", () => {
    for (const locale of ["ka", "en", "pl"] as const) {
      expect(leadLocale(leadSourceFor(locale))).toBe(locale);
    }
    expect(leadSourceFor("ka")).toBe("natal_calculator");
    expect(leadLocale("natal_calculator")).toBe("ka");
    expect(leadLocale(null)).toBe("ka");
  });

  for (const [source, language] of [
    ["natal_calculator_pl", "pl"],
    ["natal_calculator_en", "en"],
  ] as const) {
    it(`a ${language} lead gets the ${language} reading, copy and site`, async () => {
      mocks.lead = leadWith(source);
      await sendLeadWelcome("a@example.com");

      expect(mocks.ensureSignHoroscope).toHaveBeenCalledWith(
        "aries",
        "day",
        expect.any(Date),
        language,
      );
      const payload = mocks.send.mock.calls[0][0];
      expect(payload.subject).not.toMatch(GEORGIAN);
      const html = await render(payload.react);
      expect(html).not.toMatch(GEORGIAN);
      expect(html).toContain(`summary-${language}`);
      expect(html).toContain("https://www.vividaastro.com/signup");
    });
  }

  it("a Georgian lead keeps the Georgian reading and vivida.ge", async () => {
    mocks.lead = leadWith("natal_calculator");
    await sendLeadWelcome("a@example.com");
    expect(mocks.ensureSignHoroscope).toHaveBeenCalledWith(
      "aries",
      "day",
      expect.any(Date),
      "ka",
    );
    const html = await render(mocks.send.mock.calls[0][0].react);
    expect(html).toContain("vivida.ge/signup");
  });
});
