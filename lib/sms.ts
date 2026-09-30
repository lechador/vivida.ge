import { nationalDigits } from "@/lib/phone";

/**
 * sender.ge SMS client — OTP delivery for the phone flows. Lazily
 * configured like lib/email.ts: without SENDER_GE_API_KEY this module
 * still imports cleanly and the caller degrades (dev logs the code,
 * production returns a friendly error).
 *
 * API reference: https://sender.ge/docs/api.php
 *   POST https://sender.ge/api/send.php
 *     apikey      — the account API key (the sender title is bound to it)
 *     smsno       — 1 = with SmsNo (advertising), 2 = without (informational)
 *     destination — 9-digit Georgian mobile number, no +995
 *     content     — message text (unicode)
 *   success response: { messageId, qnt, statusId: 1 }; errors: { message }
 */

const SEND_URL = "https://sender.ge/api/send.php";
const REQUEST_TIMEOUT_MS = 12_000;

export class SmsSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmsSendError";
  }
}

export function isSmsConfigured(): boolean {
  return !!process.env.SENDER_GE_API_KEY;
}

/** OTP text — keep it short; every extra SMS part costs money. */
export function buildOtpSms(code: string, locale: "ka" | "en"): string {
  return locale === "ka"
    ? `Vivida: დადასტურების კოდი ${code}. არავის გაუზიარო. ვადა 10 წუთი.`
    : `Vivida: your verification code is ${code}. Don't share it. Expires in 10 minutes.`;
}

/**
 * Send one OTP SMS. Throws SmsSendError on any failure (missing key,
 * invalid number, transport error, or a non-success API response) so the
 * caller can decide how to surface it. Never logs the code.
 */
export async function sendOtpSms(input: {
  toE164: string;
  code: string;
  locale?: "ka" | "en";
}): Promise<void> {
  const key = process.env.SENDER_GE_API_KEY;
  if (!key) throw new SmsSendError("SENDER_GE_API_KEY not configured");

  const destination = nationalDigits(input.toE164);
  if (!destination) {
    throw new SmsSendError("not a Georgian mobile number");
  }

  const body = new URLSearchParams({
    apikey: key,
    smsno: "2", // informational route — advertising would need SmsNo
    destination,
    content: buildOtpSms(input.code, input.locale ?? "ka"),
  });

  let response: Response;
  try {
    response = await fetch(SEND_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    throw new SmsSendError(
      `sender.ge request failed: ${(err as Error).message}`,
    );
  }

  const text = await response.text();
  type SenderGeResponse = {
    statusId?: unknown;
    messageId?: unknown;
    message?: unknown;
  };
  let data: SenderGeResponse | null = null;
  try {
    data = JSON.parse(text) as SenderGeResponse;
  } catch {
    data = null;
  }

  // Success is strictly { statusId: 1 } — anything else (including the
  // documented { message: "apikey incorrect" } shape) is a failure.
  if (!response.ok || !data || Number(data.statusId) !== 1) {
    const detail =
      data && typeof data.message === "string"
        ? data.message
        : `unexpected response (HTTP ${response.status})`;
    throw new SmsSendError(`sender.ge send failed: ${detail}`);
  }
}
