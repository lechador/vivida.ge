"use server";

import { after } from "next/server";
import { headers } from "next/headers";

import { signIn, signOut } from "@/auth";
import {
  consumeEmailVerifyCode,
  consumeEmailVerifyToken,
  consumePasswordReset,
  isValidEmail,
  MIN_PASSWORD_LEN,
  normalizeEmail,
  preparePasswordReset,
  prepareVerificationResend,
  registerUser,
  type RegisterError,
} from "@/lib/auth-core";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/api/errors";
import { TURNSTILE_ERROR_KA, verifyTurnstile } from "@/lib/turnstile";
import { siteOriginForHost } from "@/lib/seo/locales";
import { getRequestLocale, getSignupLocale } from "@/lib/i18n/request-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { countryCodeFromHeaders } from "@/lib/residence";

async function siteOriginFromHeaders(): Promise<string> {
  const h = await headers();
  return siteOriginForHost(h.get("x-forwarded-host") ?? h.get("host"));
}

/** Best-effort client IP from the incoming request headers (Vercel proxy). */
async function clientIpFromHeaders(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Web (Server Action) auth surface. The actual DB logic lives in
 * lib/auth-core.ts so the mobile API (app/api/v1/auth/*) shares it
 * verbatim. This layer adds the website-only concerns: Turnstile bot
 * gating, Auth.js cookie sign-in, deferred email sends, and mapping
 * core result codes to Georgian UI strings.
 */

// ─── OAuth (existing) ────────────────────────────────────────────────────

/**
 * After OAuth, land on /feed — that's the community surface and the
 * default destination once a user is set up. /feed redirects to
 * /onboarding when the profile is missing, so first-time sign-ins
 * still get funnelled through birth-data entry.
 */
export async function signInWithGoogle(callbackUrl: string = "/dashboard") {
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

const TURNSTILE_ERROR_EN = "We could not verify that you are human. Please try again.";

function localized(locale: UserLocale, ka: string, en: string): string {
  // Georgian for Georgian, English for everyone else. Testing `=== "en"` sent
  // Armenian users Georgian error text, which is the least useful of the two.
  return locale === "ka" ? ka : en;
}

// ─── Localized copy for core error codes ─────────────────────────────────

function registerError(error: string, locale: UserLocale): string {
  switch (error) {
    case "invalid_name":
      return localized(locale, "შეიყვანე შენი სახელი", "Enter your name");
    case "invalid_email":
      return localized(locale, "არასწორი ელფოსტა", "Enter a valid email address");
    case "weak_password":
      return localized(
        locale,
        `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`,
        `Password must be at least ${MIN_PASSWORD_LEN} characters`,
      );
    case "email_taken":
    case "oauth_only":
      return localized(
        locale,
        "ეს ელფოსტა უკვე დარეგისტრირებულია. სცადე შესვლა ან პაროლის აღდგენა.",
        "This email is already registered. Try signing in or resetting your password.",
      );
    case "failed":
    default:
      return localized(
        locale,
        "ანგარიშის შექმნა ვერ მოხერხდა. სცადე თავიდან.",
        "We could not create your account. Please try again.",
      );
  }
}

// ─── Sign up ─────────────────────────────────────────────────────────────

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  /** Cloudflare Turnstile token from the client widget. */
  turnstileToken: string | null;
};

export type SignUpResult = { ok: true } | { ok: false; error: string };

export async function signUpWithEmail(
  input: SignUpInput
): Promise<SignUpResult> {
  // Sign-up runs on the shared, unprefixed /signup route, so the host cannot
  // tell an Armenian visitor from an English one — see getSignupLocale.
  const locale = await getSignupLocale();
  // Bot gate first — fast path before we touch the DB or hash anything.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) {
    return {
      ok: false,
      error: locale === "ka" ? TURNSTILE_ERROR_KA : TURNSTILE_ERROR_EN,
    };
  }

  // Any thrown error (transient DB blip, etc.) must land as an inline
  // "try again" on the form — never a crashed page. Registration is
  // resumable (see registerUser), so a retry after a mid-register failure
  // picks up where it left off.
  let result: Awaited<ReturnType<typeof registerUser>>;
  try {
    const requestHeaders = await headers();
    result = await registerUser({
      name: input.name,
      email: input.email,
      password: input.password,
      interfaceLanguage: locale,
      residenceCountryCode: countryCodeFromHeaders(requestHeaders),
    });
  } catch (err) {
    console.warn("[signUpWithEmail] register failed:", (err as Error).message);
    return { ok: false, error: registerError("failed", locale) };
  }
  if (!result.ok) {
    return { ok: false, error: registerError(result.error, locale) };
  }

  // Email send is deferred — that's the slow leg (Resend HTTP call) and
  // it doesn't matter if it lands a few seconds after the user sees
  // "check your inbox." The token already exists, so the link resolves.
  const { email, name, verifyToken, verifyCode } = result;
  const origin = await siteOriginFromHeaders();
  after(async () => {
    try {
      await sendVerificationEmail({
        to: email,
        name,
        token: verifyToken,
        code: verifyCode,
        origin,
      });
    } catch (err) {
      console.warn(
        "[signUpWithEmail] background verification email failed:",
        (err as Error).message
      );
    }
  });

  return { ok: true };
}

// ─── Resend verification ─────────────────────────────────────────────────

export type RequestVerificationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Re-issue a verification email for an unverified user. Always returns
 * `ok: true` once past the format check — we only actually send when the
 * email maps to an unverified password user (privacy: no existence oracle).
 */
export async function requestVerificationEmail(input: {
  email: string;
}): Promise<RequestVerificationResult> {
  const locale = await getRequestLocale();
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: localized(locale, "არასწორი ელფოსტა", "Enter a valid email address"),
    };
  }

  const dispatch = await prepareVerificationResend(email);
  if (dispatch.send) {
    try {
      await sendVerificationEmail({
        to: dispatch.email,
        name: dispatch.name,
        token: dispatch.token,
        code: dispatch.code,
        origin: await siteOriginFromHeaders(),
      });
    } catch (err) {
      console.warn(
        "[requestVerificationEmail] send failed:",
        (err as Error).message
      );
    }
  }
  return { ok: true };
}

// ─── Verify-email link handler ───────────────────────────────────────────

export type VerifyEmailResult =
  | { ok: true; userId: string }
  | { ok: false; error: "invalid" | "expired" };

/**
 * Consume a verification token. Called from `/api/auth/verify-email`.
 * Thin re-export of the shared core so the route's import is unchanged.
 */
export async function verifyEmailToken(
  token: string
): Promise<VerifyEmailResult> {
  return consumeEmailVerifyToken(token);
}

// ─── Verify-email OTP code (link alternative) ────────────────────────────

export type VerifyCodeResult =
  | { ok: true; signedIn: boolean }
  | { ok: false; error: string };

/**
 * Verify an account by the 6-digit code from the email — the easier path for
 * users who struggle with links. Rate-limited hard (per IP + per email): a
 * 6-digit code is small, so the attempt cap is what makes brute force
 * infeasible.
 *
 * When `password` is supplied (the signup / login screens still hold it in
 * memory), we sign the user in immediately on success — no bounce to the
 * login page to re-type the password they just used. This is *stronger*
 * proof than a normal login: they've shown both inbox control (the code) AND
 * the password. No Turnstile needed for that reason, and it's rate-limited.
 * `signedIn` tells the client whether a session was established; on any
 * signin hiccup it stays false and the client falls back to the login page.
 */
export async function verifyEmailWithCode(input: {
  email: string;
  code: string;
  password?: string;
}): Promise<VerifyCodeResult> {
  const locale = await getRequestLocale();
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: localized(locale, "არასწორი ელფოსტა", "Enter a valid email address"),
    };
  }

  try {
    await enforceAuthRateLimit({
      action: "verify_code",
      ip: await clientIpFromHeaders(),
      email,
      ipLimit: 30, // generous for shared NATs
      emailLimit: 8, // ~8 guesses per 10 min per account → brute force hopeless
      windowMs: 10 * 60 * 1000,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return {
        ok: false,
        error: localized(
          locale,
          "ბევრი მცდელობა იყო. სცადე ცოტა ხანში ხელახლა.",
          "Too many attempts. Please try again in a few minutes.",
        ),
      };
    }
    throw err;
  }

  const result = await consumeEmailVerifyCode({ email, code: input.code });
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.error === "expired"
          ? localized(locale, "კოდს ვადა გაუვიდა. მოითხოვე ახალი.", "This code has expired. Request a new one.")
          : localized(locale, "კოდი არასწორია. შეამოწმე და სცადე ხელახლა.", "That code is incorrect. Check it and try again."),
    };
  }

  // Account is now verified. If we have the password, establish a session so
  // the user lands straight in the app instead of retyping it on /login.
  if (input.password) {
    try {
      await signIn("credentials", {
        email,
        password: input.password,
        redirect: false,
      });
      return { ok: true, signedIn: true };
    } catch {
      // Verified fine, but auto-signin failed — client falls back to /login.
    }
  }
  return { ok: true, signedIn: false };
}

// ─── Password reset request ──────────────────────────────────────────────

export type RequestResetResult = { ok: true } | { ok: false; error: string };

export async function requestPasswordReset(input: {
  email: string;
  turnstileToken: string | null;
}): Promise<RequestResetResult> {
  const locale = await getRequestLocale();
  // Bot gate first — without it this endpoint is a free email-bomb tool.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) {
    return {
      ok: false,
      error: locale === "en" ? TURNSTILE_ERROR_EN : TURNSTILE_ERROR_KA,
    };
  }

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: localized(locale, "არასწორი ელფოსტა", "Enter a valid email address"),
    };
  }

  const dispatch = await preparePasswordReset(email);
  if (dispatch.send) {
    try {
      await sendPasswordResetEmail({
        to: dispatch.email,
        name: dispatch.name,
        token: dispatch.token,
        origin: await siteOriginFromHeaders(),
      });
    } catch (err) {
      console.warn(
        "[requestPasswordReset] send failed:",
        (err as Error).message
      );
    }
  }
  return { ok: true };
}

// ─── Password reset confirm ──────────────────────────────────────────────

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ResetPasswordResult> {
  const locale = await getRequestLocale();
  const result = await consumePasswordReset(input);
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.error === "weak_password"
          ? localized(locale, `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`, `Password must be at least ${MIN_PASSWORD_LEN} characters`)
          : localized(locale, "ლინკი არასწორია ან ვადაგასულია", "This link is invalid or has expired"),
    };
  }
  return { ok: true };
}

// ─── Sign in (thin wrapper around Auth.js signIn) ────────────────────────

export type SignInInput = {
  email: string;
  password: string;
  turnstileToken: string | null;
};

export type SignInResult =
  | { ok: true }
  | { ok: false; error: string; code?: "email_unverified" };

export async function signInWithEmail(
  input: SignInInput
): Promise<SignInResult> {
  const locale = await getRequestLocale();
  // Bot gate before we even hit the password-hash compare — keeps
  // credential-stuffing attempts from burning bcrypt CPU.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) {
    return {
      ok: false,
      error: locale === "en" ? TURNSTILE_ERROR_EN : TURNSTILE_ERROR_KA,
    };
  }

  try {
    await signIn("credentials", {
      email: normalizeEmail(input.email),
      password: input.password,
      redirect: false,
    });
    return { ok: true };
  } catch (err) {
    const message = (err as Error).message ?? "";
    if (message.includes("EMAIL_NOT_VERIFIED")) {
      return {
        ok: false,
        code: "email_unverified",
        error: localized(
          locale,
          "ელფოსტა ჯერ არ არის დადასტურებული. შეამოწმე საფოსტო ყუთი.",
          "Your email has not been verified yet. Check your inbox.",
        ),
      };
    }
    // Auth.js wraps everything as "CredentialsSignin" — treat as bad creds.
    return {
      ok: false,
      error: localized(locale, "ელფოსტა ან პაროლი არასწორია", "Incorrect email or password"),
    };
  }
}
