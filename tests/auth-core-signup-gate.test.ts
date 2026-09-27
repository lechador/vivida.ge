import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  events: [] as string[],
  insertedUsers: [] as Record<string, unknown>[],
  existing: null as null | Record<string, unknown>,
  selected: vi.fn(),
  inserted: vi.fn(),
  updated: vi.fn(),
  deleted: vi.fn(),
  checkNewSignup: vi.fn(),
  awardJoinedReputation: vi.fn(),
  onUserSignedUp: vi.fn(),
  ensureUsername: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: mocks.selected,
    insert: mocks.inserted,
    update: mocks.updated,
    delete: mocks.deleted,
  },
}));
vi.mock("@/lib/signup-abuse", () => ({
  checkNewSignup: mocks.checkNewSignup,
}));
vi.mock("@/lib/reputation", () => ({
  awardJoinedReputation: mocks.awardJoinedReputation,
}));
vi.mock("@/lib/referral", () => ({
  onUserSignedUp: mocks.onUserSignedUp,
  qualifyReferral: vi.fn(),
}));
vi.mock("@/lib/username", () => ({ ensureUsername: mocks.ensureUsername }));
vi.mock("bcryptjs", () => ({ default: { hash: mocks.hashPassword } }));

import { ApiError } from "@/lib/api/errors";
import { findOrCreateOAuthUser, registerUser } from "@/lib/auth-core";

const oauthInput = {
  email: " LILI@EXAMPLE.COM ",
  name: "Lili Kopadze",
  image: null,
  ip: "203.0.113.42",
};
const emailInput = {
  name: "Lili Kopadze",
  email: " LILI@EXAMPLE.COM ",
  password: "valid-password",
  ip: "203.0.113.42",
};

describe("auth-core new-account gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.events.length = 0;
    mocks.insertedUsers.length = 0;
    mocks.existing = null;
    mocks.selected.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: async () => (mocks.existing ? [mocks.existing] : []),
        }),
      }),
    }));
    mocks.inserted.mockImplementation(() => ({
      values: (values: Record<string, unknown>) => {
        if ("email" in values) {
          mocks.events.push("insert:user");
          mocks.insertedUsers.push(values);
          return {
            returning: async () => [
              {
                id: "new-user",
                email: values.email,
                name: values.name,
                image: values.image ?? null,
              },
            ],
          };
        }
        mocks.events.push("insert:token");
        return {};
      },
    }));
    mocks.updated.mockReturnValue({ set: () => ({ where: async () => {} }) });
    mocks.deleted.mockReturnValue({ where: async () => {} });
    mocks.checkNewSignup.mockImplementation(async () => {
      mocks.events.push("gate");
      return { allowed: true, signupIpHash: "hashed-ip" };
    });
    mocks.awardJoinedReputation.mockResolvedValue(undefined);
    mocks.onUserSignedUp.mockImplementation(async () => {
      mocks.events.push("bonus");
    });
    mocks.ensureUsername.mockResolvedValue(undefined);
    mocks.hashPassword.mockResolvedValue("password-hash");
  });

  it("lets an existing OAuth user sign in without a new-account check or bonus", async () => {
    mocks.existing = {
      id: "existing-user",
      email: "lili@example.com",
      name: "Lili Kopadze",
      image: null,
    };

    await expect(findOrCreateOAuthUser(oauthInput)).resolves.toEqual({
      userId: "existing-user",
      email: "lili@example.com",
      name: "Lili Kopadze",
      image: null,
    });
    expect(mocks.checkNewSignup).not.toHaveBeenCalled();
    expect(mocks.inserted).not.toHaveBeenCalled();
    expect(mocks.onUserSignedUp).not.toHaveBeenCalled();
  });

  it("checks a new OAuth account before insertion and bonus issuance", async () => {
    await expect(findOrCreateOAuthUser(oauthInput)).resolves.toMatchObject({
      userId: "new-user",
      email: "lili@example.com",
    });
    expect(mocks.checkNewSignup).toHaveBeenCalledWith({
      ip: oauthInput.ip,
      name: oauthInput.name,
      email: "lili@example.com",
    });
    expect(mocks.events.slice(0, 3)).toEqual(["gate", "insert:user", "bonus"]);
    expect(mocks.insertedUsers[0]).toMatchObject({
      email: "lili@example.com",
      signupIpHash: "hashed-ip",
    });
    expect(mocks.onUserSignedUp).toHaveBeenCalledWith("new-user");
  });

  it("does not insert or grant for a denied OAuth registration", async () => {
    mocks.checkNewSignup.mockResolvedValue({
      allowed: false,
      reason: "duplicate",
    });
    await expect(findOrCreateOAuthUser(oauthInput)).rejects.toMatchObject({
      status: 409,
      code: "duplicate_registration",
    } satisfies Partial<ApiError>);
    expect(mocks.inserted).not.toHaveBeenCalled();
    expect(mocks.onUserSignedUp).not.toHaveBeenCalled();
  });

  it("preserves the email registration resume path without a new-account check", async () => {
    mocks.existing = {
      id: "unverified-user",
      emailVerified: null,
      passwordHash: "previous-hash",
      residenceCountryCode: null,
    };
    await expect(registerUser(emailInput)).resolves.toMatchObject({
      ok: true,
      userId: "unverified-user",
    });
    expect(mocks.checkNewSignup).not.toHaveBeenCalled();
    expect(mocks.onUserSignedUp).not.toHaveBeenCalled();
  });

  it("checks a new email account before insertion and bonus issuance", async () => {
    await expect(registerUser(emailInput)).resolves.toMatchObject({
      ok: true,
      userId: "new-user",
    });
    expect(mocks.checkNewSignup).toHaveBeenCalledWith({
      ip: emailInput.ip,
      name: emailInput.name,
      email: "lili@example.com",
    });
    expect(mocks.events.slice(0, 3)).toEqual(["gate", "insert:user", "bonus"]);
    expect(mocks.insertedUsers[0]).toMatchObject({
      email: "lili@example.com",
      signupIpHash: "hashed-ip",
    });
    expect(mocks.onUserSignedUp).toHaveBeenCalledWith("new-user");
  });

  it("does not insert or grant for a denied email registration", async () => {
    mocks.checkNewSignup.mockResolvedValue({
      allowed: false,
      reason: "rate_limited",
    });
    await expect(registerUser(emailInput)).resolves.toEqual({
      ok: false,
      error: "signup_rate_limited",
    });
    expect(mocks.inserted).not.toHaveBeenCalled();
    expect(mocks.onUserSignedUp).not.toHaveBeenCalled();
    expect(mocks.hashPassword).not.toHaveBeenCalled();
  });
});
