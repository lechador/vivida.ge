import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/auth/verify-email/route";

describe("email verification link", () => {
  it("stashes the token for password setup without activating on GET", async () => {
    const token = "a".repeat(64);
    const response = await GET(
      new Request(`https://vivida.ge/api/auth/verify-email?token=${token}`),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://vivida.ge/verify-email",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("set-cookie")).toContain(
      `vivida_email_verify=${token}`,
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Path=/verify-email");
  });

  it("does not store a malformed token", async () => {
    const response = await GET(
      new Request("https://vivida.ge/api/auth/verify-email?token=bad"),
    );
    expect(response.headers.get("set-cookie")).not.toContain("bad");
  });
});
