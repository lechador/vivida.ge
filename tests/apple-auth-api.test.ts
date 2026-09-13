import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtVerify: vi.fn(),
  findOrCreateOAuthUser: vi.fn(),
  signAccessToken: vi.fn(),
  issueRefreshToken: vi.fn(),
}));

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "apple-jwks"),
  jwtVerify: mocks.jwtVerify,
}));
vi.mock("@/lib/auth-core", () => ({
  findOrCreateOAuthUser: mocks.findOrCreateOAuthUser,
}));
vi.mock("@/lib/api/jwt", () => ({
  ACCESS_TTL_SECONDS: 900,
  signAccessToken: mocks.signAccessToken,
}));
vi.mock("@/lib/api/refresh", () => ({
  issueRefreshToken: mocks.issueRefreshToken,
}));
vi.mock("@/lib/residence", () => ({
  countryCodeFromHeaders: vi.fn(() => "GE"),
}));

import { POST } from "@/app/api/v1/auth/apple/route";

function request(body: unknown) {
  return new Request("https://www.vivida.ge/api/v1/auth/apple", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "Vivida iOS test",
      "x-vercel-ip-country": "GE",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/auth/apple", () => {
  beforeEach(() => {
    mocks.jwtVerify.mockReset();
    mocks.findOrCreateOAuthUser.mockReset();
    mocks.signAccessToken.mockResolvedValue("access-token");
    mocks.issueRefreshToken.mockResolvedValue("refresh-token");
    mocks.findOrCreateOAuthUser.mockResolvedValue({
      userId: "user-1",
      email: "relay@privaterelay.appleid.com",
      name: "Apple Reviewer",
      image: null,
    });
  });

  it("creates a Vivida session from a verified Apple identity token", async () => {
    mocks.jwtVerify.mockResolvedValue({
      payload: {
        sub: "apple-user-1",
        email: "relay@privaterelay.appleid.com",
        email_verified: "true",
      },
    });

    const response = await POST(
      request({ idToken: "valid-token", name: "Apple Reviewer" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: { id: "user-1" },
    });
    expect(mocks.findOrCreateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "relay@privaterelay.appleid.com",
        name: "Apple Reviewer",
      })
    );
  });

  it("rejects a token that Apple signature verification refuses", async () => {
    mocks.jwtVerify.mockRejectedValue(new Error("bad signature"));

    const response = await POST(request({ idToken: "invalid-token" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "invalid_apple_token",
        message: "Invalid or expired Apple token",
      },
    });
    expect(mocks.findOrCreateOAuthUser).not.toHaveBeenCalled();
  });

  it("requires Apple's verified email claim", async () => {
    mocks.jwtVerify.mockResolvedValue({
      payload: { sub: "apple-user-1", email: "a@example.com" },
    });

    const response = await POST(request({ idToken: "valid-token" }));

    expect(response.status).toBe(401);
    expect(mocks.findOrCreateOAuthUser).not.toHaveBeenCalled();
  });
});
