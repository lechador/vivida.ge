import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  enforceRateLimit: vi.fn(),
}));

vi.mock("@/db", () => ({ db: { select: mocks.select } }));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));

import { ApiError } from "@/lib/api/errors";
import { checkNewSignup, hashSignupIp } from "@/lib/signup-abuse";
import { isLikelySameSignupPerson } from "@/lib/signup-abuse-match";

const first = {
  name: "Lile Kopadze",
  email: "kopadzelile4@gmail.com",
};
const second = {
  name: "Lili Kopadze",
  email: "kopadzelili96@gmail.com",
};

describe("signup abuse identity signal", () => {
  it("recognizes a one-letter name and mailbox variation", () => {
    expect(isLikelySameSignupPerson(second, first)).toBe(true);
    expect(
      isLikelySameSignupPerson(
        {
          name: " LILI, KOPADZE 99 ",
          email: "Kopadze.Lili+promo96@outlook.com",
        },
        second,
      ),
    ).toBe(true);
  });

  it("requires independent name and email-local agreement", () => {
    expect(
      isLikelySameSignupPerson(
        { name: "Lili Beridze", email: second.email },
        first,
      ),
    ).toBe(false);
    expect(
      isLikelySameSignupPerson(
        { name: second.name, email: "unrelatedperson@gmail.com" },
        first,
      ),
    ).toBe(false);
  });

  it("does not make one-letter guesses for short/common identities", () => {
    expect(
      isLikelySameSignupPerson(
        { name: "Ana Lee", email: "analee1@gmail.com" },
        { name: "Ann Lee", email: "annlee2@gmail.com" },
      ),
    ).toBe(false);
    expect(
      isLikelySameSignupPerson(
        { name: "A Robertson", email: "arobertson1@gmail.com" },
        { name: "B Robertson", email: "brobertson2@gmail.com" },
      ),
    ).toBe(false);
  });
});

describe("new signup gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-only-signup-ip-secret";
    mocks.select.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ where: mocks.where });
    mocks.where.mockResolvedValue([]);
    mocks.enforceRateLimit.mockResolvedValue(undefined);
  });

  it("ignores missing, unknown and invalid IPs without grouping visitors", async () => {
    for (const ip of [null, "unknown", "not-an-ip"]) {
      await expect(checkNewSignup({ ...first, ip })).resolves.toEqual({
        allowed: true,
        signupIpHash: null,
      });
    }
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it("uses a stable keyed hash and atomic burst and daily caps", async () => {
    const ip = "203.0.113.42";
    const hash = hashSignupIp(ip);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(ip);
    expect(hashSignupIp("::ffff:203.0.113.42")).toBe(hash);
    expect(hashSignupIp("203.0.113.43")).not.toBe(hash);

    await expect(checkNewSignup({ ...first, ip })).resolves.toEqual({
      allowed: true,
      signupIpHash: hash,
    });
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith({
      bucket: "new_signup_ip_burst",
      identifier: hash,
      limit: 3,
      windowMs: 10 * 60 * 1000,
    });
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith({
      bucket: "new_signup_ip_day",
      identifier: hash,
      limit: 10,
      windowMs: 24 * 60 * 60 * 1000,
    });
    expect(mocks.where).toHaveBeenCalledOnce();
  });

  it("blocks a likely repeat from a verified recent account", async () => {
    mocks.where.mockResolvedValue([first]);
    await expect(
      checkNewSignup({ ...second, ip: "203.0.113.42" }),
    ).resolves.toEqual({ allowed: false, reason: "duplicate" });
  });

  it("does not block an unrelated person sharing an IP", async () => {
    mocks.where.mockResolvedValue([
      { name: "Mariam Beridze", email: "mariam.beridze@gmail.com" },
    ]);
    await expect(
      checkNewSignup({ ...second, ip: "203.0.113.42" }),
    ).resolves.toMatchObject({ allowed: true });
  });

  it("turns the existing atomic limiter's 429 into a denied decision", async () => {
    mocks.enforceRateLimit.mockRejectedValue(
      new ApiError(429, "rate_limited", "Too many requests"),
    );
    await expect(
      checkNewSignup({ ...first, ip: "203.0.113.42" }),
    ).resolves.toEqual({ allowed: false, reason: "rate_limited" });
    expect(mocks.select).not.toHaveBeenCalled();
  });
});
