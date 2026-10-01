"use server";

import { after } from "next/server";
import { cookies, headers } from "next/headers";

import { signIn, signOut } from "@/auth";
import {
  consumeEmailVerifyCode,
  consumeEmailVerifyToken,
  consumePasswordReset,
  finalizeSignupPhoneClaim,
  isValidEmail,
  MIN_PASSWORD_LEN,
  normalizeEmail,
  preparePasswordReset,
  prepareVerificationResend,
  registerUser,
} from "@/lib/auth-core";
import { authErrorText } from "@/lib/auth-error";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { enforceAuthRateLimit, enforceRateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/api/errors";
import { TURNSTILE_ERROR_KA, verifyTurnstile } from "@/lib/turnstile";
import { siteOriginForHost } from "@/lib/seo/locales";
import { getRequestLocale, getSignupLocale } from "@/lib/i18n/request-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { countryCodeFromHeaders } from "@/lib/residence";
import { clientIpFromHeaders as getIpFromHeaders } from "@/lib/api/security";

async function siteOriginFromHeaders(): Promise<string> {
  const h = await headers();
  return siteOriginForHost(h.get("x-forwarded-host") ?? h.get("host"));
}

/** Best-effort client IP from the incoming request headers (Vercel proxy). */
async function clientIpFromHeaders(): Promise<string> {
  return getIpFromHeaders(await headers());
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
 * After OAuth, land on /post-login — the intent-aware resolver that sends
 * incomplete profiles to /onboarding (preserving their destination as
 * ?next=) and complete ones straight to their goal or /dashboard.
 */
export async function signInWithGoogle(callbackUrl: string = "/post-login") {
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signInWithApple(callbackUrl: string = "/post-login") {
  await signIn("apple", { redirectTo: callbackUrl });
}

export async function signOutAction(destination: "/" | "/login" = "/") {
  await signOut({ redirectTo: destination });
}

const TURNSTILE_ERROR_EN =
  "We could not verify that you are human. Please try again.";

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
      return localized(
        locale,
        "არასწორი ელფოსტა",
        "Enter a valid email address",
      );
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
    case "duplicate_registration":
      return localized(
        locale,
        "ამ მონაცემებით რეგისტრაცია დამატებით შემოწმებას საჭიროებს. სცადე არსებულ ანგარიშში შესვლა ან მოგვწერე მხარდაჭერას.",
        "This registration needs review. Try signing in to your existing account or contact support.",
      );
    case "signup_rate_limited":
      return localized(
        locale,
        "ამ კავშირიდან ძალიან ბევრი რეგისტრაციის მცდელობა იყო. სცადე მოგვიანებით.",
        "Too many registration attempts from this connection. Please try again later.",
      );
    case "phone_taken":
      return localized(
        locale,
        "ეს ნომერი უკვე მიბმულია სხვა ანგარიშზე. სცადე შესვლა ნომრით ან მიუთითე სხვა ნომერი.",
        "This number is already linked to another account. Sign in with it or use a different number.",
      );
    case "phone_claim_invalid":
      return localized(
        locale,
        "ნომრის დადასტურებას ვადა გაუვიდა. დაადასტურე ხელახლა ან წაშალე ნომერი და გააგრძელე მის გარეშე.",
        "Your phone verification has expired. Verify it again, or remove the number and continue without it.",
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
  /** Signup-time phone claim is finalized only after email-code proof. */
  phoneClaimToken?: string | null;
};

export type SignUpResult = { ok: true } | { ok: false; error: string };

export async function signUpWithEmail(
  input: SignUpInput,
): Promise<SignUpResult> {
  // Sign-up runs on the shared, unprefixed /signup route, so the host cannot
  // tell an Armenian visitor from an English one — see getSignupLocale.
  const locale = await getSignupLocale();
  // Require a human proof before an attempt can consume another address's
  // rate-limit allowance.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) {
    return {
      ok: false,
      error: locale === "ka" ? TURNSTILE_ERROR_KA : TURNSTILE_ERROR_EN,
    };
  }

  const ip = await clientIpFromHeaders();
  try {
    if (ip !== "unknown") {
      await enforceAuthRateLimit({
        action: "register",
        ip,
        email: input.email,
        ipLimit: 10,
        emailLimit: 3,
        windowMs: 60 * 60 * 1000,
      });
    } else {
      await enforceRateLimit({
        bucket: "register_email",
        identifier: input.email.trim().toLowerCase(),
        limit: 3,
        windowMs: 60 * 60 * 1000,
      });
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, error: registerError("signup_rate_limited", locale) };
    }
    console.warn(
      "[signUpWithEmail] rate limit check failed:",
      (err as Error).message,
    );
    return { ok: false, error: registerError("failed", locale) };
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
      ip,
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
        (err as Error).message,
      );
    }
  });

  return { ok: true };
}

// ─── Resend verification ─────────────────────────────────────────────────

export type RequestVerificationResult =
  { ok: true } | { ok: false; error: string };

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
      error: localized(
        locale,
        "არასწორი ელფოსტა",
        "Enter a valid email address",
      ),
    };
  }

  try {
    await enforceAuthRateLimit({
      action: "resend_verification",
      ip: await clientIpFromHeaders(),
      email,
      ipLimit: 5,
      emailLimit: 3,
      windowMs: 60 * 60 * 1000,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return {
        ok: false,
        error: localized(
          locale,
          "ბევრი მცდელობა იყო. სცადე მოგვიანებით.",
          "Too many attempts. Please try again later.",
        ),
      };
    }
    throw err;
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
        (err as Error).message,
      );
    }
  }
  return { ok: true };
}

// ─── Verify-email link password setup ────────────────────────────────────

export type VerifyEmailLinkResult = { ok: true } | { ok: false; error: string };

/**
 * A verification link proves inbox control, but the pending password may
 * have been chosen by somebody who preregistered another person's address.
 * Let the inbox owner choose the final password before activating the account.
 */
export async function verifyEmailFromLink(input: {
  password: string;
}): Promise<VerifyEmailLinkResult> {
  const locale = await getRequestLocale();
  const cookieStore = await cookies();
  const token = cookieStore.get("vivida_email_verify")?.value;
  if (!token) {
    return {
      ok: false,
      error: localized(
        locale,
        "ლინკი არასწორია ან უკვე გამოყენებულია.",
        "This link is invalid or has already been used.",
      ),
    };
  }
  const result = await consumeEmailVerifyToken({
    token,
    password: input.password,
  });
  if (result.ok) {
    cookieStore.set("vivida_email_verify", "", {
      path: "/verify-email",
      maxAge: 0,
    });
    return { ok: true };
  }
  if (result.error !== "weak_password") {
    cookieStore.set("vivida_email_verify", "", {
      path: "/verify-email",
      maxAge: 0,
    });
  }
  return {
    ok: false,
    error:
      result.error === "weak_password"
        ? localized(
            locale,
            `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`,
            `Password must be at least ${MIN_PASSWORD_LEN} characters`,
          )
        : result.error === "expired"
          ? localized(
              locale,
              "ლინკს ვადა გაუვიდა. ანგარიში პაროლის აღდგენით დაასრულე.",
              "This link has expired. Complete the account through password recovery.",
            )
          : localized(
              locale,
              "ლინკი არასწორია ან უკვე გამოყენებულია.",
              "This link is invalid or has already been used.",
            ),
  };
}

// ─── Verify-email OTP code (link alternative) ────────────────────────────

export type VerifyCodeResult =
  | { ok: true; signedIn: boolean; phoneLinked?: boolean }
  | { ok: false; error: string };

/**
 * Verify an account by the 6-digit code from the email — the easier path for
 * users who struggle with links. Rate-limited hard (per IP + per email): a
 * 6-digit code is small, so the attempt cap is what makes brute force
 * infeasible.
 *
 * The inbox owner chooses the final password while submitting the code.
 * This prevents a preregistered address from becoming usable with a password
 * chosen by somebody else. We sign in immediately on success; `signedIn`
 * tells the client whether session setup worked, with a login fallback.
 */
export async function verifyEmailWithCode(input: {
  email: string;
  code: string;
  password: string;
  phoneClaimToken?: string | null;
  smsMarketing?: boolean;
}): Promise<VerifyCodeResult> {
  const locale = await getRequestLocale();
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: localized(
        locale,
        "არასწორი ელფოსტა",
        "Enter a valid email address",
      ),
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

  const result = await consumeEmailVerifyCode({
    email,
    code: input.code,
    password: input.password,
  });
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.error === "weak_password"
          ? localized(
              locale,
              `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`,
              `Password must be at least ${MIN_PASSWORD_LEN} characters`,
            )
          : result.error === "expired"
            ? localized(
                locale,
                "კოდს ვადა გაუვიდა. მოითხოვე ახალი.",
                "This code has expired. Request a new one.",
              )
            : localized(
                locale,
                "კოდი არასწორია. შეამოწმე და სცადე ხელახლა.",
                "That code is incorrect. Check it and try again.",
              ),
    };
  }

  let phoneLinked: boolean | undefined;
  if (input.phoneClaimToken) {
    try {
      phoneLinked = await finalizeSignupPhoneClaim(
        result.userId,
        input.phoneClaimToken,
        input.smsMarketing === true,
      );
    } catch (err) {
      console.warn(
        "[verifyEmailWithCode] phone claim finalize failed:",
        (err as Error).message,
      );
      phoneLinked = false;
    }
  }

  // Account is now verified. If we have the password, establish a session so
  // the user lands straight in the app instead of retyping it on /login.
  try {
    await signIn("credentials", {
      email,
      password: input.password,
      redirect: false,
    });
    return { ok: true, signedIn: true, phoneLinked };
  } catch {
    // Verified fine, but auto-signin failed — client falls back to /login.
  }
  return { ok: true, signedIn: false, phoneLinked };
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
      error: locale === "ka" ? TURNSTILE_ERROR_KA : TURNSTILE_ERROR_EN,
    };
  }

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: localized(
        locale,
        "არასწორი ელფოსტა",
        "Enter a valid email address",
      ),
    };
  }

  try {
    await enforceAuthRateLimit({
      action: "forgot_password",
      ip: await clientIpFromHeaders(),
      email,
      ipLimit: 5,
      emailLimit: 3,
      windowMs: 60 * 60 * 1000,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return {
        ok: false,
        error: localized(
          locale,
          "ბევრი მცდელობა იყო. სცადე მოგვიანებით.",
          "Too many attempts. Please try again later.",
        ),
      };
    }
    throw err;
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
        (err as Error).message,
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
          ? localized(
              locale,
              `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`,
              `Password must be at least ${MIN_PASSWORD_LEN} characters`,
            )
          : localized(
              locale,
              "ლინკი არასწორია ან ვადაგასულია",
              "This link is invalid or has expired",
            ),
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
  { ok: true } | { ok: false; error: string; code?: "email_unverified" };

export async function signInWithEmail(
  input: SignInInput,
): Promise<SignInResult> {
  const locale = await getRequestLocale();
  // Bot gate before we even hit the password-hash compare — keeps
  // credential-stuffing attempts from burning bcrypt CPU.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) {
    return {
      ok: false,
      error: locale === "ka" ? TURNSTILE_ERROR_KA : TURNSTILE_ERROR_EN,
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
    // The provider's sentinel lives in the error *cause* — Auth.js wraps a
    // thrown plain Error in a CallbackRouteError whose own message is just a
    // docs link (see lib/auth-error.ts).
    const message = authErrorText(err);
    if (message.includes("EMAIL_LOGIN_RATE_LIMITED")) {
      return {
        ok: false,
        error: localized(
          locale,
          "შესვლის ძალიან ბევრი მცდელობა იყო. სცადე ცოტა ხანში.",
          "Too many sign-in attempts. Please try again in a few minutes.",
        ),
      };
    }
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
      error: localized(
        locale,
        "ელფოსტა ან პაროლი არასწორია",
        "Incorrect email or password",
      ),
    };
  }
}
