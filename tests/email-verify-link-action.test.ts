import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeToken: vi.fn(),
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.cookieGet, set: mocks.cookieSet }),
  headers: async () => new Headers(),
}));
vi.mock("@/auth", () => ({ signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({
  enforceAuthRateLimit: vi.fn(),
  enforceRateLimit: vi.fn(),
}));
vi.mock("@/lib/residence", () => ({ countryCodeFromHeaders: vi.fn() }));
vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: async () => "en",
  getSignupLocale: async () => "en",
}));
vi.mock("@/lib/auth-core", () => ({
  MIN_PASSWORD_LEN: 8,
  consumeEmailVerifyToken: mocks.consumeToken,
}));

import { verifyEmailFromLink } from "@/actions/auth";

describe("email verification password setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieGet.mockReturnValue({ value: "a".repeat(64) });
  });

  it("sets the inbox owner's password and clears the token cookie", async () => {
    mocks.consumeToken.mockResolvedValue({ ok: true, userId: "user" });

    await expect(
      verifyEmailFromLink({ password: "owner-chosen-password" }),
    ).resolves.toEqual({ ok: true });
    expect(mocks.consumeToken).toHaveBeenCalledWith({
      token: "a".repeat(64),
      password: "owner-chosen-password",
    });
    expect(mocks.cookieSet).toHaveBeenCalledWith("vivida_email_verify", "", {
      path: "/verify-email",
      maxAge: 0,
    });
  });

  it("keeps the token available after a weak password", async () => {
    mocks.consumeToken.mockResolvedValue({
      ok: false,
      error: "weak_password",
    });

    await expect(
      verifyEmailFromLink({ password: "short" }),
    ).resolves.toMatchObject({ ok: false });
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });
});
