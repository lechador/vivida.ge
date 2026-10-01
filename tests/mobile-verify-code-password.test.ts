import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeCode: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/auth-core", () => ({
  consumeEmailVerifyCode: mocks.consumeCode,
}));
vi.mock("@/lib/rate-limit", () => ({
  enforceAuthRateLimit: mocks.rateLimit,
}));

import { POST } from "@/app/api/v1/auth/verify-code/route";

function request(body: Record<string, unknown>) {
  return new Request("https://vivida.ge/api/v1/auth/verify-code", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("mobile email-code verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue(undefined);
    mocks.consumeCode.mockResolvedValue({ ok: true, userId: "user" });
  });

  it("requires a final password before consuming the code", async () => {
    const response = await POST(
      request({ email: "nino@example.com", code: "123456" }),
    );
    expect(response.status).toBe(422);
    expect(mocks.consumeCode).not.toHaveBeenCalled();
  });

  it("passes the inbox owner's password to the verification core", async () => {
    const response = await POST(
      request({
        email: "nino@example.com",
        code: "123456",
        password: "owner-chosen-password",
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.consumeCode).toHaveBeenCalledWith({
      email: "nino@example.com",
      code: "123456",
      password: "owner-chosen-password",
    });
  });
});
