import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: null as unknown,
  select: vi.fn(),
  update: vi.fn(),
  selectResults: [] as Record<string, unknown>[][],
  updateValues: null as null | Record<string, unknown>,
  checkNewSignup: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceAuthRateLimit: vi.fn(),
}));

vi.mock("next-auth", () => ({
  default: (config: unknown) => {
    mocks.config = config;
    return { handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
  },
}));
vi.mock("@auth/drizzle-adapter", () => ({ DrizzleAdapter: () => ({}) }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.1" }),
}));
vi.mock("@/db", () => ({
  db: { select: mocks.select, update: mocks.update },
}));
vi.mock("@/lib/signup-abuse", () => ({
  checkNewSignup: mocks.checkNewSignup,
  hashSignupIp: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  enforceAuthRateLimit: mocks.enforceAuthRateLimit,
}));

import "@/auth";

type OAuthSignInInput = {
  user: { email: string; name: string };
  account: {
    type: "oidc";
    provider: "google" | "apple";
    providerAccountId: string;
  };
  profile: { email_verified?: boolean | string };
};

function signInCallback() {
  return (
    mocks.config as {
      callbacks: {
        signIn: (input: OAuthSignInInput) => Promise<boolean | string>;
      };
    }
  ).callbacks.signIn;
}

function credentialsAuthorize() {
  const config = mocks.config as {
    providers: Array<{
      id: string;
      options: {
        authorize: (
          credentials: { email: string; password: string },
          request: Request,
        ) => Promise<unknown>;
      };
    }>;
  };
  const provider = config.providers.find(
    (candidate) => candidate.id === "credentials",
  );
  if (!provider) throw new Error("Credentials provider was not configured");
  return provider.options.authorize;
}

describe("web OAuth verified-email gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectResults = [[], []];
    mocks.updateValues = null;
    mocks.select.mockReturnValue({
      from: () => ({
        where: () => ({ limit: async () => mocks.selectResults.shift() ?? [] }),
      }),
    });
    mocks.update.mockReturnValue({
      set: (values: Record<string, unknown>) => {
        mocks.updateValues = values;
        return { where: async () => {} };
      },
    });
    mocks.checkNewSignup.mockResolvedValue({ allowed: true });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    mocks.enforceAuthRateLimit.mockResolvedValue(undefined);
  });

  it.each([
    ["google", true],
    ["apple", "true"],
  ] as const)("allows a verified %s email", async (provider, claim) => {
    await expect(
      signInCallback()({
        user: { email: "nino@example.com", name: "Nino" },
        account: { type: "oidc", provider, providerAccountId: "provider-id" },
        profile: { email_verified: claim },
      }),
    ).resolves.toBe(true);
    expect(mocks.checkNewSignup).toHaveBeenCalledOnce();
  });

  it.each([
    ["google", false],
    ["apple", "false"],
    ["apple", undefined],
  ] as const)("rejects an unverified %s email", async (provider, claim) => {
    await expect(
      signInCallback()({
        user: { email: "nino@example.com", name: "Nino" },
        account: { type: "oidc", provider, providerAccountId: "provider-id" },
        profile: { email_verified: claim },
      }),
    ).resolves.toBe("/signup?error=oauth_email_unverified");
    expect(mocks.checkNewSignup).not.toHaveBeenCalled();
  });

  it("removes attacker-chosen credentials before linking a verified OAuth email", async () => {
    mocks.selectResults = [
      [],
      [
        {
          id: "provisional-user",
          emailVerified: null,
          passwordHash: "attacker-password-hash",
        },
      ],
    ];

    await expect(
      signInCallback()({
        user: { email: "nino@example.com", name: "Nino" },
        account: {
          type: "oidc",
          provider: "google",
          providerAccountId: "provider-id",
        },
        profile: { email_verified: true },
      }),
    ).resolves.toBe(true);
    expect(mocks.updateValues).toMatchObject({
      passwordHash: null,
      phone: null,
      phoneVerifiedAt: null,
      smsMarketing: false,
      smsMarketingConsentedAt: null,
    });
    expect(mocks.checkNewSignup).not.toHaveBeenCalled();
  });
});

describe("direct credentials callback rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.select.mockReturnValue({
      from: () => ({ where: () => ({ limit: async () => [] }) }),
    });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    mocks.enforceAuthRateLimit.mockResolvedValue(undefined);
  });

  it("uses only the email bucket when the proxy supplies no client IP", async () => {
    await credentialsAuthorize()(
      { email: "NINO@example.com", password: "wrong" },
      new Request("https://vivida.ge/api/auth/callback/credentials"),
    );

    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "web_login_email",
        identifier: "nino@example.com",
        limit: 10,
      }),
    );
    expect(mocks.enforceAuthRateLimit).not.toHaveBeenCalled();
  });
});
