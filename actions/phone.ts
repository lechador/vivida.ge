"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { clientIpFromHeaders } from "@/lib/api/security";
import { requireUser } from "@/lib/auth-helpers";
import { authErrorText } from "@/lib/auth-error";
import { PHONE_VERIFY_GIFT, SMS_CONSENT_GIFT } from "@/lib/credits-config";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { maskGeorgianMobile, normalizeGeorgianMobile } from "@/lib/phone";
import {
  bindAccountPhone,
  consumePhoneCode,
  createPhoneChallenge,
} from "@/lib/phone-auth";
import { grantPhoneVerifyGift, grantSmsConsentGift } from "@/lib/phone-gift";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isSmsConfigured, sendOtpSms } from "@/lib/sms";
import { setSmsMarketingConsent } from "@/lib/sms-consent";

/**
 * Web (Server Action) surface for the SMS phone flows: optional number
 * verification during signup, phone-number login, and adding/changing the
 * number in the account — plus the one-time phone-gift campaign (verify the
 * number → 10/20 credits; dashboard popup + credits-page card). The DB core
 * lives in lib/phone-auth.ts and SMS sending in lib/sms.ts; this layer owns
 * rate limits and localized copy.
 */

export type PhoneActionErrorCode =
  | "invalid_phone"
  | "invalid_code"
  | "wrong_code"
  | "expired"
  | "rate_limited"
  | "no_account"
  | "email_unverified"
  | "phone_reverification_required"
  | "phone_taken"
  | "sms_failed"
  | "sms_unavailable"
  | "unavailable_region"
  | "failed";

export type PhoneActionFailure = {
  ok: false;
  error: string;
  code: PhoneActionErrorCode;
};

export type PhoneActionResult = { ok: true } | PhoneActionFailure;

export type SendPhoneCodePurpose = "signup" | "login" | "account";

const FIFTEEN_MIN = 15 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

function localized(locale: UserLocale, ka: string, en: string): string {
  return locale === "ka" ? ka : en;
}

function phoneErrorCopy(
  code: PhoneActionErrorCode,
  locale: UserLocale,
): string {
  switch (code) {
    case "invalid_phone":
      return localized(
        locale,
        "შეიყვანე ქართული მობილურის ნომერი სწორად (მაგ. +995 555 123 456)",
        "Enter a valid Georgian mobile number (e.g. +995 555 123 456)",
      );
    case "invalid_code":
    case "wrong_code":
      return localized(
        locale,
        "კოდი არასწორია. შეამოწმე და სცადე ხელახლა.",
        "That code is incorrect. Check it and try again.",
      );
    case "expired":
      return localized(
        locale,
        "კოდს ვადა გაუვიდა. მოითხოვე ახალი.",
        "This code has expired. Request a new one.",
      );
    case "rate_limited":
      return localized(
        locale,
        "ბევრი მცდელობა იყო. სცადე ცოტა ხანში.",
        "Too many attempts. Please try again in a few minutes.",
      );
    case "no_account":
      return localized(
        locale,
        "ამ ნომერზე ანგარიში ვერ მოიძებნა. დარეგისტრირდი ან გამოიყენე ელფოსტა.",
        "No account found for this number. Sign up, or use email instead.",
      );
    case "email_unverified":
      return localized(
        locale,
        "ამ ნომრით შესვლამდე დაადასტურე ელფოსტა. კოდი უკვე გამოგზავნილია რეგისტრაციისას; ახალი კოდის მოთხოვნაც შეგიძლია ელფოსტით შესვლის გვერდიდან.",
        "Verify your email before signing in with this number. You can request a new email verification code from the email sign-in page.",
      );
    case "phone_reverification_required":
      return localized(
        locale,
        "ნომრით შესასვლელად ჯერ ელფოსტით შედი და ანგარიშის გვერდზე ნომერი ხელახლა დაადასტურე.",
        "Sign in with email, then verify this number again in Account to use phone sign-in.",
      );
    case "phone_taken":
      return localized(
        locale,
        "ეს ნომერი უკვე მიბმულია სხვა ანგარიშზე.",
        "This number is already linked to another account.",
      );
    case "sms_unavailable":
      return localized(
        locale,
        "SMS სერვისი დროებით მიუწვდომელია. სცადე მოგვიანებით.",
        "The SMS service is temporarily unavailable. Please try again later.",
      );
    case "sms_failed":
      return localized(
        locale,
        "SMS ვერ გაიგზავნა. სცადე ხელახლა.",
        "Could not send the SMS. Please try again.",
      );
    case "unavailable_region":
      // SMS codes go only to Georgian numbers, so the phone stack lives on
      // vivida.ge. English-host callers are rejected before any rate limit,
      // code issue, or DB write.
      return localized(
        locale,
        "ტელეფონის დადასტურება მხოლოდ vivida.ge-ზეა ხელმისაწვდომი.",
        "Phone verification is only available on vivida.ge.",
      );
    case "failed":
    default:
      return localized(
        locale,
        "რაღაც შეცდომა მოხდა. სცადე თავიდან.",
        "Something went wrong. Please try again.",
      );
  }
}

function failure(
  code: PhoneActionErrorCode,
  locale: UserLocale,
): PhoneActionFailure {
  return { ok: false, code, error: phoneErrorCopy(code, locale) };
}

async function clientIp(): Promise<string> {
  return clientIpFromHeaders(await headers());
}

// ─── Send a code ─────────────────────────────────────────────────────────

/**
 * Send a 6-digit SMS code. "login" intentionally sends to any valid number
 * (no account-existence oracle — whether an account exists is only revealed
 * after a *correct* code entry, i.e. to whoever controls the number).
 */
export async function sendPhoneVerificationCode(input: {
  phone: string;
  purpose: SendPhoneCodePurpose;
}): Promise<PhoneActionResult> {
  const locale = await getRequestLocale();
  if (locale === "en") return failure("unavailable_region", locale);
  const phone = normalizeGeorgianMobile(input.phone ?? "");
  if (!phone) return failure("invalid_phone", locale);

  // Changing the account number is a logged-in flow only.
  let userId: string | null = null;
  if (input.purpose === "account") {
    const user = await requireUser();
    userId = user.id;
  }

  try {
    await enforceRateLimit({
      bucket: "phone_send_ip",
      identifier: await clientIp(),
      limit: 15,
      windowMs: HOUR,
    });
    await enforceRateLimit({
      bucket: "phone_send_phone",
      identifier: phone,
      limit: 3,
      windowMs: FIFTEEN_MIN,
    });
    await enforceRateLimit({
      bucket: "phone_send_phone_day",
      identifier: phone,
      limit: 10,
      windowMs: 24 * HOUR,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return failure("rate_limited", locale);
    }
    console.warn(
      "[phone] send rate-limit check failed:",
      (err as Error).message,
    );
    return failure("failed", locale);
  }

  if (!isSmsConfigured() && process.env.NODE_ENV === "production") {
    // Misconfiguration rather than user error — but the user needs a message.
    console.error("[phone] SENDER_GE_API_KEY is not set — cannot send SMS");
    return failure("sms_unavailable", locale);
  }

  try {
    const code = await createPhoneChallenge({
      phone,
      purpose: input.purpose,
      userId,
    });
    if (!isSmsConfigured()) {
      // Local dev without a key: log the code so the flow stays testable.
      console.warn(
        `[phone] SENDER_GE_API_KEY missing (dev) — code for ${maskGeorgianMobile(phone)}: ${code}`,
      );
      return { ok: true };
    }
    await sendOtpSms({
      toE164: phone,
      code,
      locale: locale === "ka" ? "ka" : "en",
    });
    return { ok: true };
  } catch (err) {
    console.warn(
      `[phone] SMS send failed for ${maskGeorgianMobile(phone)}:`,
      (err as Error).message,
    );
    return failure("sms_failed", locale);
  }
}

// ─── Verify a code ───────────────────────────────────────────────────────

export type VerifySignupPhoneResult =
  { ok: true; claimToken: string } | PhoneActionFailure;

/**
 * Verify the signup-purpose code and hand the browser a claim token. The
 * token is only good for binding the verified number to the account the
 * browser creates at signup submit (lib/auth-core registerUser).
 */
export async function verifySignupPhone(input: {
  phone: string;
  code: string;
}): Promise<VerifySignupPhoneResult> {
  const locale = await getRequestLocale();
  if (locale === "en") return failure("unavailable_region", locale);
  const phone = normalizeGeorgianMobile(input.phone ?? "");
  if (!phone) return failure("invalid_phone", locale);
  const code = (input.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) return failure("invalid_code", locale);

  try {
    await enforceRateLimit({
      bucket: "phone_verify_ip",
      identifier: await clientIp(),
      limit: 30,
      windowMs: FIFTEEN_MIN,
    });
    await enforceRateLimit({
      bucket: "phone_verify_phone",
      identifier: phone,
      limit: 10,
      windowMs: FIFTEEN_MIN,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return failure("rate_limited", locale);
    }
    throw err;
  }

  const result = await consumePhoneCode({ phone, purpose: "signup", code });
  if (!result.ok) {
    return failure(
      result.error === "expired" ? "expired" : "wrong_code",
      locale,
    );
  }
  return { ok: true, claimToken: result.claimToken };
}

// ─── Verify an account-purpose code ──────────────────────────────────────

type AccountVerification =
  | { ok: true; userId: string; phone: string; firstVerification: boolean }
  | { ok: false; failure: PhoneActionFailure };

/**
 * Shared preamble for the logged-in "verify this number" flows (account
 * card, dashboard gift popup, credits-page gift card): rate limits, code
 * check, binding. The caller decides what the verification pays out.
 */
async function verifyAccountCode(input: {
  phone: string;
  code: string;
}): Promise<AccountVerification> {
  const locale = await getRequestLocale();
  if (locale === "en") {
    return { ok: false, failure: failure("unavailable_region", locale) };
  }
  const user = await requireUser();
  const phone = normalizeGeorgianMobile(input.phone ?? "");
  if (!phone) return { ok: false, failure: failure("invalid_phone", locale) };
  const code = (input.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, failure: failure("invalid_code", locale) };
  }

  try {
    await enforceRateLimit({
      bucket: "phone_verify_ip",
      identifier: await clientIp(),
      limit: 30,
      windowMs: FIFTEEN_MIN,
    });
    await enforceRateLimit({
      bucket: "phone_verify_phone",
      identifier: phone,
      limit: 10,
      windowMs: FIFTEEN_MIN,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, failure: failure("rate_limited", locale) };
    }
    throw err;
  }

  const result = await bindAccountPhone({ userId: user.id, phone, code });
  if (!result.ok) {
    const errorCode: PhoneActionErrorCode =
      result.error === "phone_taken"
        ? "phone_taken"
        : result.error === "expired"
          ? "expired"
          : "wrong_code";
    return { ok: false, failure: failure(errorCode, locale) };
  }
  return {
    ok: true,
    userId: user.id,
    phone: result.phone,
    firstVerification: result.firstVerification,
  };
}

/**
 * Verify the account-purpose code and bind the number to the signed-in
 * user. Replaces any previously bound number. A first-ever verification pays
 * the one-time phone-verify gift, so the reward follows the outcome rather
 * than whichever campaign surface the user happened to use.
 */
export async function verifyAccountPhone(input: {
  phone: string;
  code: string;
}): Promise<PhoneActionResult> {
  const verified = await verifyAccountCode(input);
  if (!verified.ok) return verified.failure;
  if (verified.firstVerification) {
    await grantPhoneVerifyGift(verified.userId);
  }
  revalidatePath("/account");
  return { ok: true };
}

export type VerifyPhoneGiftResult =
  { ok: true; granted: number } | PhoneActionFailure;

/**
 * Phone-gift flow (dashboard popup / credits-page card): verify the number
 * and, when the marketing toggle was on, opt the user in to promotional SMS
 * in the same step. Returns how many credits the verification actually paid
 * out so the UI shows the granted amount (0 only when the grants were
 * already consumed — eligibility normally rules that out).
 */
export async function verifyPhoneGift(input: {
  phone: string;
  code: string;
  smsMarketing: boolean;
}): Promise<VerifyPhoneGiftResult> {
  const verified = await verifyAccountCode(input);
  if (!verified.ok) return verified.failure;

  let granted = 0;
  if (verified.firstVerification) {
    if (await grantPhoneVerifyGift(verified.userId)) {
      granted += PHONE_VERIFY_GIFT;
    }
  }
  if (input.smsMarketing === true) {
    const consent = await setSmsMarketingConsent(
      verified.userId,
      verified.phone,
      true,
    );
    if (consent.ok && consent.changed) {
      if (await grantSmsConsentGift(verified.userId)) {
        granted += SMS_CONSENT_GIFT;
      }
    }
  }
  revalidatePath("/dashboard");
  revalidatePath("/credits");
  revalidatePath("/account");
  return { ok: true, granted };
}

// ─── Phone-gift popup dismissal ──────────────────────────────────────────

/**
 * Dismiss the one-time dashboard gift popup so it never shows again. The
 * offer itself stays claimable from the credits page.
 */
export async function dismissPhoneGiftPopup(): Promise<{ ok: true }> {
  const locale = await getRequestLocale();
  // The popup never renders on the English host; a posted dismiss is a no-op.
  if (locale === "en") return { ok: true };
  const user = await requireUser();
  await db
    .update(users)
    .set({ phoneGiftPopupDismissedAt: new Date() })
    .where(and(eq(users.id, user.id), isNull(users.phoneGiftPopupDismissedAt)));
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Phone-number login ──────────────────────────────────────────────────

/**
 * Sign in with (phone, code). The phone credentials provider in auth.ts
 * verifies the code and resolves the account, so the session is
 * established through the normal Auth.js pipeline (jwt callbacks,
 * lastLoginAt event). The provider's sentinel errors map to copy here.
 */
export async function signInWithPhoneCode(input: {
  phone: string;
  code: string;
}): Promise<PhoneActionResult> {
  const locale = await getRequestLocale();
  if (locale === "en") return failure("unavailable_region", locale);
  const phone = normalizeGeorgianMobile(input.phone ?? "");
  if (!phone) return failure("invalid_phone", locale);
  const code = (input.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) return failure("invalid_code", locale);

  try {
    await signIn("phone", { phone, code, redirect: false });
    return { ok: true };
  } catch (err) {
    const text = authErrorText(err);
    if (text.includes("PHONE_UNAVAILABLE")) {
      return failure("unavailable_region", locale);
    }
    if (text.includes("PHONE_NO_ACCOUNT")) {
      return failure("no_account", locale);
    }
    if (text.includes("PHONE_EMAIL_UNVERIFIED")) {
      return failure("email_unverified", locale);
    }
    if (text.includes("PHONE_REVERIFICATION_REQUIRED")) {
      return failure("phone_reverification_required", locale);
    }
    if (text.includes("PHONE_RATE_LIMITED")) {
      return failure("rate_limited", locale);
    }
    return failure("wrong_code", locale);
  }
}
