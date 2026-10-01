import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "@/db";
import { authTokens, users, type AuthTokenPurpose } from "@/db/schema";
import { generateOtpCode } from "@/lib/otp";
import { bindSignupPhoneClaim } from "@/lib/phone-auth";
import { awardJoinedReputation } from "@/lib/reputation";
import { onUserSignedUp, qualifyReferral } from "@/lib/referral";
import { ensureUsername } from "@/lib/username";
import { checkNewSignup } from "@/lib/signup-abuse";
import { ApiError } from "@/lib/api/errors";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Email/password auth logic used by website Server Actions in actions/auth.ts.
 *
 * These functions deal only with the database and return stable result
 * *codes* — never user-facing strings. The action maps codes to Georgian
 * messages. Email *sending* is left to the caller (a one-line lib/email call)
 * so the website can defer it via `after()` for a faster signup response.
 */

export const MIN_PASSWORD_LEN = 8;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h
const BCRYPT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** A 6-digit numeric OTP (zero-padded, uniform over 000000–999999). */
export { generateOtpCode };

/**
 * Issue a single-use auth token, superseding any existing token of the
 * same purpose for this user (so a second "resend" invalidates the first
 * link rather than leaving both live). When `code` is passed it's stored on
 * the same row, so the link token and the OTP verify to the same record and
 * consuming either one invalidates both.
 */
export async function issueAuthToken(
  userId: string,
  purpose: AuthTokenPurpose,
  ttlMs: number,
  code: string | null = null,
): Promise<string> {
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose)));
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);
  await db.insert(authTokens).values({
    token,
    userId,
    purpose,
    code,
    expiresAt,
  });
  return token;
}

// ─── Register ────────────────────────────────────────────────────────────

export type RegisterError =
  | "invalid_name"
  | "invalid_email"
  | "weak_password"
  | "email_taken"
  | "oauth_only"
  | "duplicate_registration"
  | "signup_rate_limited"
  | "phone_taken"
  | "phone_claim_invalid"
  | "failed";

export type RegisterResult =
  | {
      ok: true;
      userId: string;
      email: string;
      name: string | null;
      /** email_verify token — caller is responsible for sending the email. */
      verifyToken: string;
      /** 6-digit OTP shown in the same email; caller passes it to the sender. */
      verifyCode: string;
    }
  | {
      ok: false;
      error: RegisterError;
    };

/**
 * Create an email/password account (unverified) and provision its trial.
 * Does NOT send the verification email — returns the token so the caller
 * can send it after the account is created.
 */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  interfaceLanguage?: UserLocale;
  residenceCountryCode?: string | null;
  ip?: string | null;
}): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!name) return { ok: false, error: "invalid_name" };
  if (!isValidEmail(email)) return { ok: false, error: "invalid_email" };
  if (password.length < MIN_PASSWORD_LEN) {
    return { ok: false, error: "weak_password" };
  }

  const [existing] = await db
    .select({
      id: users.id,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
      residenceCountryCode: users.residenceCountryCode,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    // An unverified password stub is a registration that never completed —
    // either the user abandoned it or a mid-register failure left it
    // half-created (user row exists, token/email possibly missing). Treat
    // re-signup as a RESUME: refresh name/password and fall through to
    // re-issue the verify token + email. Safe because the account was never
    // usable (login requires verification, verification requires the inbox),
    // so whoever owns the inbox wins — same guarantee as a fresh signup.
    // Verified accounts and OAuth accounts (passwordHash null) stay taken.
    if (existing.emailVerified || !existing.passwordHash) {
      return { ok: false, error: "email_taken" };
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await db
      .update(users)
      .set({
        name,
        passwordHash,
        // A fresh signup attempt supersedes the provisional one. Otherwise
        // the first applicant's verified phone could survive when the real
        // email owner resumes and verifies the account without a phone.
        phone: null,
        phoneVerifiedAt: null,
        smsMarketing: false,
        smsMarketingConsentedAt: null,
        ...(input.interfaceLanguage
          ? { interfaceLanguage: input.interfaceLanguage }
          : {}),
        ...(!existing.residenceCountryCode && input.residenceCountryCode
          ? { residenceCountryCode: input.residenceCountryCode }
          : {}),
      })
      .where(eq(users.id, existing.id));
    await awardJoinedReputation(existing.id);
    // The stub may predate usernames-at-signup, and the refreshed name is a
    // better slug source than whatever the abandoned attempt used.
    try {
      await ensureUsername(existing.id, name);
    } catch {
      /* best-effort — never block the resume */
    }
    const verifyCode = generateOtpCode();
    const verifyToken = await issueAuthToken(
      existing.id,
      "email_verify",
      VERIFY_TTL_MS,
      verifyCode,
    );
    return {
      ok: true,
      userId: existing.id,
      email,
      name,
      verifyToken,
      verifyCode,
    };
  }

  const signupCheck = await checkNewSignup({
    ip: input.ip,
    name,
    email,
  });
  if (!signupCheck.allowed) {
    return {
      ok: false,
      error:
        signupCheck.reason === "duplicate"
          ? "duplicate_registration"
          : "signup_rate_limited",
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      interfaceLanguage: input.interfaceLanguage ?? "ka",
      residenceCountryCode: input.residenceCountryCode ?? null,
      signupIpHash: signupCheck.signupIpHash,
    })
    .returning({ id: users.id, email: users.email, name: users.name });
  if (!created) return { ok: false, error: "failed" };

  // One-shot "joined" reputation from t=0. Best-effort, never blocks signup.
  await awardJoinedReputation(created.id);
  // Signup bonus + referral attribution (best-effort, never blocks signup).
  await onUserSignedUp(created.id);
  // Every account gets a username from t=0, not on first profile save — users
  // who never finished onboarding used to have no profile row at all, which
  // made them invisible in /people, search and @mentions. See lib/username.ts.
  try {
    await ensureUsername(created.id, created.name);
  } catch (err) {
    console.warn(
      "[registerUser] username assignment failed:",
      (err as Error).message,
    );
  }

  const verifyCode = generateOtpCode();
  const verifyToken = await issueAuthToken(
    created.id,
    "email_verify",
    VERIFY_TTL_MS,
    verifyCode,
  );

  return {
    ok: true,
    userId: created.id,
    email: created.email!,
    name: created.name,
    verifyToken,
    verifyCode,
  };
}

/** Bind a signup phone only after the same browser proves inbox control with
 * the email code and presents the SMS claim. Clicking an unsolicited email
 * link in another browser must never activate someone else's phone. */
export async function finalizeSignupPhoneClaim(
  userId: string,
  claimToken: string,
  smsMarketing: boolean,
): Promise<boolean> {
  const [user] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.emailVerified) return false;

  const bound = await bindSignupPhoneClaim({ userId, claimToken });
  if (!bound.ok) return false;
  if (smsMarketing === true) {
    await db
      .update(users)
      .set({ smsMarketing: true, smsMarketingConsentedAt: new Date() })
      .where(eq(users.id, userId));
  }
  return true;
}

// ─── OAuth (Google) ──────────────────────────────────────────────────────

export type OAuthUser = {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
};

/**
 * Find a user by email or create one for a verified OAuth (Google) sign-in.
 * The email is already proven by the provider, so the account is created
 * pre-verified. New users get the trial provisioned, same as email signup.
 *
 * We intentionally don't write an `accounts` row here — the website's
 * Auth.js adapter links by email (allowDangerousEmailAccountLinking) if the
 * same person later signs in with Google on the web.
 */
export async function findOrCreateOAuthUser(input: {
  email: string;
  name: string | null;
  image: string | null;
  residenceCountryCode?: string | null;
  ip?: string | null;
}): Promise<OAuthUser> {
  const email = normalizeEmail(input.email);

  const [existing] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    if (!existing.emailVerified) {
      // A verified OAuth inbox may match a provisional password signup that
      // somebody else initiated. Do not inherit their password or phone.
      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          passwordHash: null,
          phone: null,
          phoneVerifiedAt: null,
          smsMarketing: false,
          smsMarketingConsentedAt: null,
        })
        .where(eq(users.id, existing.id));
    }
    if (input.residenceCountryCode) {
      await db
        .update(users)
        .set({ residenceCountryCode: input.residenceCountryCode })
        .where(
          and(eq(users.id, existing.id), isNull(users.residenceCountryCode)),
        );
    }
    return {
      userId: existing.id,
      email: existing.email!,
      name: existing.name,
      image: existing.image,
    };
  }

  const signupCheck = await checkNewSignup({
    ip: input.ip,
    name: input.name,
    email,
  });
  if (!signupCheck.allowed) {
    throw new ApiError(
      signupCheck.reason === "duplicate" ? 409 : 429,
      signupCheck.reason === "duplicate"
        ? "duplicate_registration"
        : "signup_rate_limited",
      signupCheck.reason === "duplicate"
        ? "This registration needs review. Please sign in to your existing account or contact support."
        : "Too many new accounts from this connection. Please try again later.",
    );
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: input.name,
      image: input.image,
      emailVerified: new Date(),
      residenceCountryCode: input.residenceCountryCode ?? null,
      signupIpHash: signupCheck.signupIpHash,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    });

  await awardJoinedReputation(created.id);
  // OAuth accounts are pre-verified, so this may qualify a referral right away
  // once birth data is added; bonus + attribution happen here.
  await onUserSignedUp(created.id);
  // Same as the email path: a username from t=0, never lazily on first save.
  try {
    await ensureUsername(created.id, created.name);
  } catch (err) {
    console.warn(
      "[findOrCreateOAuthUser] username assignment failed:",
      (err as Error).message,
    );
  }

  return {
    userId: created.id,
    email: created.email!,
    name: created.name,
    image: created.image,
  };
}

// ─── Resend verification / request reset ─────────────────────────────────

/**
 * Result of preparing an email-bearing flow (verify resend / password
 * reset). `send: false` covers "no such user", "already verified", or
 * "OAuth-only account" — the caller MUST still report success to avoid
 * turning the endpoint into an account-existence oracle.
 */
export type EmailDispatch =
  | {
      send: true;
      email: string;
      name: string | null;
      token: string;
      /** OTP for verify emails; null for password reset (link-only). */
      code: string | null;
    }
  | { send: false };

/** Prepare a fresh verification email for an unverified password user. */
export async function prepareVerificationResend(
  rawEmail: string,
): Promise<EmailDispatch> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { send: false };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user && !user.emailVerified && user.passwordHash) {
    const code = generateOtpCode();
    const token = await issueAuthToken(
      user.id,
      "email_verify",
      VERIFY_TTL_MS,
      code,
    );
    return { send: true, email, name: user.name, token, code };
  }
  return { send: false };
}

/** Prepare a password-reset email for a user who has a password set. */
export async function preparePasswordReset(
  rawEmail: string,
): Promise<EmailDispatch> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { send: false };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user && user.passwordHash) {
    const token = await issueAuthToken(user.id, "password_reset", RESET_TTL_MS);
    return { send: true, email, name: user.name, token, code: null };
  }
  return { send: false };
}

// ─── Consume verify-email / reset tokens ─────────────────────────────────

export type VerifyEmailResult =
  | { ok: true; userId: string }
  | { ok: false; error: "invalid" | "expired" | "weak_password" };

/** Consume an email_verify token, marking the user verified. Single-use. */
export async function consumeEmailVerifyToken(input: {
  token: string;
  password: string;
}): Promise<VerifyEmailResult> {
  if (!input.token) return { ok: false, error: "invalid" };
  if (
    typeof input.password !== "string" ||
    input.password.length < MIN_PASSWORD_LEN
  ) {
    return { ok: false, error: "weak_password" };
  }

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.token, input.token),
        eq(authTokens.purpose, "email_verify"),
      ),
    )
    .limit(1);

  if (!row) return { ok: false, error: "invalid" };
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(authTokens).where(eq(authTokens.token, input.token));
    return { ok: false, error: "expired" };
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      passwordHash,
      phone: null,
      phoneVerifiedAt: null,
      smsMarketing: false,
      smsMarketingConsentedAt: null,
    })
    .where(eq(users.id, row.userId));
  await db.delete(authTokens).where(eq(authTokens.token, input.token));

  try {
    await qualifyReferral(row.userId);
  } catch {
    /* best-effort */
  }
  return { ok: true, userId: row.userId };
}

/**
 * Verify an unverified password account by (email, 6-digit code) — the OTP
 * alternative to clicking the link. Both live on the same auth_token row, so
 * this marks the user verified and deletes the row (invalidating the link
 * too). Callers MUST rate-limit by email + IP before invoking this: a
 * 6-digit code is only ~1M-wide, so brute force is infeasible only under a
 * strict attempt cap. Returns generic "invalid" for a wrong/absent code so
 * it can't be used as an existence oracle.
 */
export async function consumeEmailVerifyCode(input: {
  email: string;
  code: string;
  password: string;
}): Promise<VerifyEmailResult> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();
  if (
    typeof input.password !== "string" ||
    input.password.length < MIN_PASSWORD_LEN
  ) {
    return { ok: false, error: "weak_password" };
  }
  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "invalid" };
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user) return { ok: false, error: "invalid" };

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.userId, user.id),
        eq(authTokens.purpose, "email_verify"),
      ),
    )
    .limit(1);

  if (!row || !row.code) return { ok: false, error: "invalid" };
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(authTokens).where(eq(authTokens.token, row.token));
    return { ok: false, error: "expired" };
  }
  if (row.code !== code) return { ok: false, error: "invalid" };

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      passwordHash,
      phone: null,
      phoneVerifiedAt: null,
      smsMarketing: false,
      smsMarketingConsentedAt: null,
    })
    .where(eq(users.id, user.id));
  await db.delete(authTokens).where(eq(authTokens.token, row.token));

  try {
    await qualifyReferral(user.id);
  } catch {
    /* best-effort */
  }
  return { ok: true, userId: user.id };
}

export type ResetPasswordResult =
  | { ok: true; userId: string }
  | { ok: false; error: "invalid_token" | "weak_password" };

/**
 * Consume a password_reset token and set the new password. Also marks the
 * email verified — completing a reset proves inbox control, so we don't
 * want to then bounce the user off the unverified-login wall.
 */
export async function consumePasswordReset(input: {
  token: string;
  password: string;
}): Promise<ResetPasswordResult> {
  if (!input.token) return { ok: false, error: "invalid_token" };
  if (input.password.length < MIN_PASSWORD_LEN) {
    return { ok: false, error: "weak_password" };
  }

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.token, input.token),
        eq(authTokens.purpose, "password_reset"),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) return { ok: false, error: "invalid_token" };

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await db
    .update(users)
    .set({ passwordHash, emailVerified: new Date() })
    .where(eq(users.id, row.userId));
  await db.delete(authTokens).where(eq(authTokens.token, input.token));

  return { ok: true, userId: row.userId };
}
