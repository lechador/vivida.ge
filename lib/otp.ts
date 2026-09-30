import { randomBytes } from "node:crypto";

/**
 * A 6-digit numeric OTP (zero-padded, uniform over 000000–999999).
 * Shared by the email-verification and SMS phone flows.
 */
export function generateOtpCode(): string {
  // rejection-sample a uniform 0–999999 to avoid modulo bias
  let n: number;
  do {
    n = randomBytes(3).readUIntBE(0, 3); // 0 .. 16_777_215
  } while (n >= 16_000_000);
  return String(n % 1_000_000).padStart(6, "0");
}
