import { Resend } from "resend";

import { VerificationEmail } from "@/lib/email-templates/verification";
import { PasswordResetEmail } from "@/lib/email-templates/password-reset";

/**
 * Resend client. Lazily-instantiated so dev environments without the API
 * key (e.g. running migrations) don't crash at import time. Functions in
 * this module return early with a console warning when the key is absent
 * — matching how `lib/r2.ts` handles its credentials.
 */
let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.RESEND_FROM ?? "Vivida <onboarding@resend.dev>";
const ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Build an absolute URL inside an email. Relative paths break in some
 * mail clients, so every link must include scheme + host.
 */
function absUrl(path: string): string {
  return `${ORIGIN.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Send the post-signup verification email. Returns silently on success;
 * logs and rethrows on failure so the calling action can surface a
 * generic "we couldn't send the email" message and the user can retry.
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string | null;
  token: string;
}): Promise<void> {
  const c = client();
  const verifyUrl = absUrl(`/api/auth/verify-email?token=${token}`);
  if (!c) {
    console.warn(
      "[email] RESEND_API_KEY missing — would have sent verification to",
      to,
      "→",
      verifyUrl
    );
    return;
  }
  const result = await c.emails.send({
    from: FROM,
    to,
    subject: "დაადასტურე შენი ელფოსტა · Vivida",
    react: VerificationEmail({ name, verifyUrl }),
  });
  if (result.error) {
    console.error("[email] verification send failed:", result.error);
    throw new Error(result.error.message ?? "verification send failed");
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string | null;
  token: string;
}): Promise<void> {
  const c = client();
  const resetUrl = absUrl(`/reset-password?token=${token}`);
  if (!c) {
    console.warn(
      "[email] RESEND_API_KEY missing — would have sent reset to",
      to,
      "→",
      resetUrl
    );
    return;
  }
  const result = await c.emails.send({
    from: FROM,
    to,
    subject: "პაროლის აღდგენა · Vivida",
    react: PasswordResetEmail({ name, resetUrl }),
  });
  if (result.error) {
    console.error("[email] password reset send failed:", result.error);
    throw new Error(result.error.message ?? "password reset send failed");
  }
}
