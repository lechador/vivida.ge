import { beforeEach, describe, expect, it, vi } from "vitest";

const request = { host: "www.vividaastro.com" };

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) =>
      name === "host" || name === "x-forwarded-host" ? request.host : null,
  }),
  cookies: async () => ({
    get: () => undefined,
  }),
}));

// The region gate runs before any DB/auth work; these mocks only satisfy
// module imports (next-auth's next/server import can't resolve in vitest).
vi.mock("@/db", () => ({
  db: {
    select: () => {
      throw new Error("db must not be touched by the region gate");
    },
  },
}));
vi.mock("@/auth", () => ({
  signIn: () => {
    throw new Error("signIn must not be reached on the English host");
  },
}));

const phoneActions = await import("@/actions/phone");
const { updateSmsMarketingConsent } = await import("@/actions/sms-marketing");

beforeEach(() => {
  request.host = "www.vividaastro.com";
});

describe("phone stack on the English host", () => {
  it("rejects sending SMS codes", async () => {
    const result = await phoneActions.sendPhoneVerificationCode({
      phone: "555123456",
      purpose: "login",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("unavailable_region");
  });

  it("rejects signup phone verification", async () => {
    const result = await phoneActions.verifySignupPhone({
      phone: "555123456",
      code: "123456",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("unavailable_region");
  });

  it("rejects phone sign-in", async () => {
    const result = await phoneActions.signInWithPhoneCode({
      phone: "555123456",
      code: "123456",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("unavailable_region");
  });

  it("rejects SMS marketing opt-ins", async () => {
    const result = await updateSmsMarketingConsent({
      phone: "555123456",
      enabled: true,
    });
    expect(result).toEqual({ ok: false, reason: "unavailable" });
  });

  it("makes gift-popup dismissal a no-op", async () => {
    await expect(phoneActions.dismissPhoneGiftPopup()).resolves.toEqual({
      ok: true,
    });
  });
});

describe("phone stack on the Georgian host", () => {
  beforeEach(() => {
    request.host = "www.vivida.ge";
  });

  it("does not reject sends for region (fails later on dev SMS config)", async () => {
    const result = await phoneActions.sendPhoneVerificationCode({
      phone: "555123456",
      purpose: "login",
    });
    // Either a rate-limit/code-send outcome — never the region gate.
    if (!result.ok) expect(result.code).not.toBe("unavailable_region");
  });
});
