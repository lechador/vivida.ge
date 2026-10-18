import { afterEach, describe, expect, it, vi } from "vitest";

import { sendOtpSms } from "@/lib/sms";

const input = {
  toE164: "+995555123456",
  code: "123456",
  locale: "ka" as const,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("sender.ge OTP delivery", () => {
  it("accepts the documented data array response after sending one SMS", async () => {
    vi.stubEnv("SENDER_GE_API_KEY", "test-key");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: [{ messageId: "123", statusId: 1 }] }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendOtpSms(input)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://sender.ge/api/send.php",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("destination=555123456"),
      }),
    );
  });

  it("rejects an empty or unsuccessful data array", async () => {
    vi.stubEnv("SENDER_GE_API_KEY", "test-key");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ statusId: 2 }] }), {
          status: 200,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendOtpSms(input)).rejects.toThrow("sender.ge send failed");
    await expect(sendOtpSms(input)).rejects.toThrow("sender.ge send failed");
  });
});
