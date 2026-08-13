import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "@/db";
import { authTokens, users, type AuthTokenPurpose } from "@/db/schema";
import { awardJoinedReputation } from "@/lib/reputation";
import { onUserSignedUp, qualifyReferral } from "@/lib/referral";

/**
 * Framework-agnostic email/password auth logic, shared by the website
 * (Server Actions in actions/auth.ts) and the mobile API (app/api/v1/auth/*).
 *
 * These functions deal only with the database and return stable result
 * *codes* — never user-facing strings. Each caller maps codes to its own
 * presentation: the web action maps them to Georgian messages; the mobile
 * route returns the code so Flutter can localize. Email *sending* is left
 * to the caller (a one-line lib/email call) so the website can keep
 * deferring it via `after()` for a snappier signup response.
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
export function generateOtpCode(): string {
  // rejection-sample a uniform 0–999999 to avoid modulo bias
  let n: number;
  do {
    n = randomBytes(3).readUIntBE(0, 3); // 0 .. 16_777_215
  } while (n >= 16_000_000);
  return String(n % 1_000_000).padStart(6, "0");
}

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
  code: string | null = null
): Promise<string> {
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose)));
  const token = randomBytes(32).toString("hex");
  await db.insert(authTokens).values({
    token,
    userId,
    purpose,
    code,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

// ─── Register ────────────────────────────────────────────────────────────

export type RegisterError =
  | "invalid_name"
  | "invalid_email"
  | "weak_password"
  | "email_taken"
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
  | { ok: false; error: RegisterError };

/**
 * Create an email/password account (unverified) and provision its trial.
 * Does NOT send the verification email — returns the token so the caller
 * can send (deferred on web, awaited on mobile).
 */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  interfaceLanguage?: "ka" | "en";
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
        ...(input.interfaceLanguage
          ? { interfaceLanguage: input.interfaceLanguage }
          : {}),
      })
      .where(eq(users.id, existing.id));
    await awardJoinedReputation(existing.id);
    const verifyCode = generateOtpCode();
    const verifyToken = await issueAuthToken(
      existing.id,
      "email_verify",
      VERIFY_TTL_MS,
      verifyCode
    );
    return { ok: true, userId: existing.id, email, name, verifyToken, verifyCode };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      interfaceLanguage: input.interfaceLanguage ?? "ka",
    })
    .returning({ id: users.id, email: users.email, name: users.name });
  if (!created) return { ok: false, error: "failed" };

  // One-shot "joined" reputation from t=0. Best-effort, never blocks signup.
  await awardJoinedReputation(created.id);
  // Signup bonus + referral attribution (best-effort, never blocks signup).
  await onUserSignedUp(created.id);

  const verifyCode = generateOtpCode();
  const verifyToken = await issueAuthToken(
    created.id,
    "email_verify",
    VERIFY_TTL_MS,
    verifyCode
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
}): Promise<OAuthUser> {
  const email = normalizeEmail(input.email);

  const [existing] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return {
      userId: existing.id,
      email: existing.email!,
      name: existing.name,
      image: existing.image,
    };
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: input.name,
      image: input.image,
      emailVerified: new Date(),
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
  rawEmail: string
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
      code
    );
    return { send: true, email, name: user.name, token, code };
  }
  return { send: false };
}

/** Prepare a password-reset email for a user who has a password set. */
export async function preparePasswordReset(
  rawEmail: string
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
  | { ok: false; error: "invalid" | "expired" };

/** Consume an email_verify token, marking the user verified. Single-use. */
export async function consumeEmailVerifyToken(
  token: string
): Promise<VerifyEmailResult> {
  if (!token) return { ok: false, error: "invalid" };

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(eq(authTokens.token, token), eq(authTokens.purpose, "email_verify"))
    )
    .limit(1);

  if (!row) return { ok: false, error: "invalid" };
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(authTokens).where(eq(authTokens.token, token));
    return { ok: false, error: "expired" };
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, row.userId));
  await db.delete(authTokens).where(eq(authTokens.token, token));

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
}): Promise<VerifyEmailResult> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();
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
        eq(authTokens.purpose, "email_verify")
      )
    )
    .limit(1);

  if (!row || !row.code) return { ok: false, error: "invalid" };
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(authTokens).where(eq(authTokens.token, row.token));
    return { ok: false, error: "expired" };
  }
  if (row.code !== code) return { ok: false, error: "invalid" };

  await db
    .update(users)
    .set({ emailVerified: new Date() })
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
        gt(authTokens.expiresAt, new Date())
      )
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
