import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "@/db";
import { authTokens, users, type AuthTokenPurpose } from "@/db/schema";
import { provisionTrialIfMissing } from "@/lib/plan";

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

/**
 * Issue a single-use auth token, superseding any existing token of the
 * same purpose for this user (so a second "resend" invalidates the first
 * link rather than leaving both live).
 */
export async function issueAuthToken(
  userId: string,
  purpose: AuthTokenPurpose,
  ttlMs: number
): Promise<string> {
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose)));
  const token = randomBytes(32).toString("hex");
  await db.insert(authTokens).values({
    token,
    userId,
    purpose,
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
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return { ok: false, error: "email_taken" };

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, email: users.email, name: users.name });
  if (!created) return { ok: false, error: "failed" };

  // Tie the 30-day Pro trial to the account from t=0. Idempotent and
  // self-swallowing, so a transient blip won't block registration.
  await provisionTrialIfMissing(created.id);

  const verifyToken = await issueAuthToken(
    created.id,
    "email_verify",
    VERIFY_TTL_MS
  );

  return {
    ok: true,
    userId: created.id,
    email: created.email!,
    name: created.name,
    verifyToken,
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
  | { send: true; email: string; name: string | null; token: string }
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
    const token = await issueAuthToken(user.id, "email_verify", VERIFY_TTL_MS);
    return { send: true, email, name: user.name, token };
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
    return { send: true, email, name: user.name, token };
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

  return { ok: true, userId: row.userId };
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
