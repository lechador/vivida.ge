import { describe, expect, it } from "vitest";

import {
  georgianMobileInputDigits,
  formatGeorgianMobile,
  isNationalMobile,
  isValidGeorgianMobile,
  maskGeorgianMobile,
  nationalDigits,
  normalizeGeorgianMobile,
} from "@/lib/phone";
import { buildOtpSms } from "@/lib/sms";

describe("phone normalization", () => {
  it("keeps a fixed +995 prefix when a full number is pasted into the local field", () => {
    expect(georgianMobileInputDigits("555 123 456")).toBe("555123456");
    expect(georgianMobileInputDigits("+995 555 123 456")).toBe("555123456");
    expect(georgianMobileInputDigits("995555123456")).toBe("555123456");
    expect(georgianMobileInputDigits("0555123456")).toBe("555123456");
  });

  it("normalizes every common Georgian input to E.164", () => {
    expect(normalizeGeorgianMobile("555123456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("555 123 456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("555-123-456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("0555123456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("995555123456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("+995 555 123 456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("(+995) 555 123 456")).toBe("+995555123456");
    expect(normalizeGeorgianMobile("558 12 34 56")).toBe("+995558123456");
  });

  it("rejects invalid numbers", () => {
    expect(normalizeGeorgianMobile("")).toBeNull();
    expect(normalizeGeorgianMobile("12345")).toBeNull();
    expect(normalizeGeorgianMobile("322123456")).toBeNull(); // landline prefix
    expect(normalizeGeorgianMobile("495123456")).toBeNull(); // not mobile (4xx)
    expect(normalizeGeorgianMobile("55512345")).toBeNull(); // too short
    expect(normalizeGeorgianMobile("5551234567")).toBeNull(); // too long
    expect(normalizeGeorgianMobile("1555123456")).toBeNull(); // no 0/995 prefix
    expect(normalizeGeorgianMobile("+15551234567")).toBeNull(); // foreign
    expect(normalizeGeorgianMobile("9950555123456")).toBeNull();
  });

  it("keeps the validity helpers consistent", () => {
    expect(isValidGeorgianMobile("+995555123456")).toBe(true);
    expect(isValidGeorgianMobile("322123456")).toBe(false);
    expect(isNationalMobile("555123456")).toBe(true);
    expect(isNationalMobile("0555123456")).toBe(false);
  });
});

describe("phone formatting", () => {
  it("formats E.164 for display", () => {
    expect(formatGeorgianMobile("+995555123456")).toBe("+995 555 123 456");
    expect(formatGeorgianMobile("garbage")).toBe("garbage");
  });

  it("masks for logs without leaking the middle digits", () => {
    const masked = maskGeorgianMobile("+995555123456");
    expect(masked).toBe("+995 55•••••56");
    expect(masked).not.toContain("5123");
  });

  it("extracts the national digits for sender.ge", () => {
    expect(nationalDigits("+995555123456")).toBe("555123456");
    expect(nationalDigits("+995322123456")).toBeNull(); // landline
    expect(nationalDigits("555123456")).toBeNull(); // not E.164
  });
});

describe("OTP SMS content", () => {
  it("includes the code and fits one SMS part in both languages", () => {
    const ka = buildOtpSms("123456", "ka");
    const en = buildOtpSms("123456", "en");
    expect(ka).toContain("123456");
    expect(en).toContain("123456");
    expect(ka).toContain("ვადა");
    expect(ka).toContain("Vivida");
    expect(en).toContain("Vivida");
    // Georgian is UCS-2 (70 chars/part); Latin GSM-7 (160 chars/part).
    // One part each — every extra part doubles the cost.
    expect(ka.length).toBeLessThanOrEqual(70);
    expect(en.length).toBeLessThanOrEqual(160);
  });
});
