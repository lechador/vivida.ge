"use server";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { after } from "next/server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { authTokens, users, type AuthTokenPurpose } from "@/db/schema";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email";
import { provisionTrialIfMissing } from "@/lib/plan";
import { TURNSTILE_ERROR_KA, verifyTurnstile } from "@/lib/turnstile";

// ─── OAuth (existing) ────────────────────────────────────────────────────

/**
 * After OAuth, land on /feed — that's the community surface and the
 * default destination once a user is set up. /feed redirects to
 * /onboarding when the profile is missing, so first-time sign-ins
 * still get funnelled through birth-data entry.
 */
export async function signInWithGoogle(callbackUrl: string = "/feed") {
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// ─── Email/password helpers ──────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h
const BCRYPT_ROUNDS = 10;

function newToken(): string {
  // 32 random bytes → 64-char hex. Plenty of entropy and URL-safe.
  return randomBytes(32).toString("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function issueToken(
  userId: string,
  purpose: AuthTokenPurpose,
  ttlMs: number
): Promise<string> {
  // Invalidate any existing tokens of the same purpose so a second click on
  // "resend" supersedes the first link rather than leaving both alive.
  await db
    .delete(authTokens)
    .where(
      and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose))
    );
  const token = newToken();
  await db.insert(authTokens).values({
    token,
    userId,
    purpose,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

// ─── Sign up ─────────────────────────────────────────────────────────────

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  /** Cloudflare Turnstile token from the client widget. */
  turnstileToken: string | null;
};

export type SignUpResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signUpWithEmail(
  input: SignUpInput
): Promise<SignUpResult> {
  // Bot gate first — fast path before we touch the DB or hash anything.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) return { ok: false, error: TURNSTILE_ERROR_KA };

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!name) return { ok: false, error: "შეიყვანე შენი სახელი" };
  if (!EMAIL_RE.test(email))
    return { ok: false, error: "არასწორი ელფოსტა" };
  if (password.length < MIN_PASSWORD_LEN)
    return {
      ok: false,
      error: `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`,
    };

  // Existing-user check. We give a soft hint so they know to use Google
  // or password reset, without leaking which provider they used.
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return {
      ok: false,
      error:
        "ეს ელფოსტა უკვე დარეგისტრირებულია. სცადე შესვლა ან პაროლის აღდგენა.",
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      // emailVerified left null — gated by the verification email flow.
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  if (!created) {
    return {
      ok: false,
      error: "ანგარიშის შექმნა ვერ მოხერხდა. სცადე თავიდან.",
    };
  }

  // Provision the 30-day Pro trial immediately so it's tied to the
  // account from t=0, not gated on whether the user ever reaches
  // /dashboard. Google OAuth users still get it lazily via
  // getCurrentPlan on first dashboard load. Idempotent (onConflictDoNothing)
  // and swallows its own errors, so a transient DB blip won't block
  // the rest of signup.
  await provisionTrialIfMissing(created.id);

  // Token issue runs INLINE — it's a single fast DB write (~30ms) and
  // running it inside `after()` would race with `requestVerificationEmail`
  // ("resend") if the user clicks resend before the deferred work fires:
  // resend's issueToken does delete-then-insert, then our deferred
  // delete-then-insert would nuke the freshly-issued resend token.
  const token = await issueToken(created.id, "email_verify", VERIFY_TTL_MS);

  // Email send is deferred — that's the slow leg (Resend HTTP call) and
  // it doesn't matter if it lands a few seconds after the user sees
  // "check your inbox." Token already exists, so when the email arrives
  // and the user clicks the link it'll resolve correctly.
  const userEmail = created.email!;
  const userName = created.name;
  after(async () => {
    try {
      await sendVerificationEmail({ to: userEmail, name: userName, token });
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
 * `ok: true` to avoid leaking which emails exist in the system — but we
 * only actually send when the email maps to an unverified password user.
 */
export async function requestVerificationEmail(input: {
  email: string;
}): Promise<RequestVerificationResult> {
  const email = normalizeEmail(input.email);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "არასწორი ელფოსტა" };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user && !user.emailVerified && user.passwordHash) {
    const token = await issueToken(user.id, "email_verify", VERIFY_TTL_MS);
    try {
      await sendVerificationEmail({ to: email, name: user.name, token });
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
 * Consume a verification token. Called from the `/api/auth/verify-email`
 * route handler. Returns the userId on success so the route can redirect
 * with a friendly state on the login page.
 */
export async function verifyEmailToken(
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
    // Clean up the dead token so the user can request a fresh one.
    await db.delete(authTokens).where(eq(authTokens.token, token));
    return { ok: false, error: "expired" };
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, row.userId));

  // Single-use: delete the token now that it's been consumed.
  await db.delete(authTokens).where(eq(authTokens.token, token));

  return { ok: true, userId: row.userId };
}

// ─── Password reset request ──────────────────────────────────────────────

export type RequestResetResult =
  | { ok: true }
  | { ok: false; error: string };

export async function requestPasswordReset(input: {
  email: string;
  turnstileToken: string | null;
}): Promise<RequestResetResult> {
  // Bot gate first — without it this endpoint is a free email-bomb tool
  // (anyone could request unlimited reset emails to a victim's address).
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) return { ok: false, error: TURNSTILE_ERROR_KA };

  const email = normalizeEmail(input.email);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "არასწორი ელფოსტა" };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Privacy guard: always claim success even if the email isn't
  // registered or belongs to a Google-only account (no passwordHash to
  // reset). Otherwise the form becomes an account-existence oracle.
  if (user && user.passwordHash) {
    const token = await issueToken(user.id, "password_reset", RESET_TTL_MS);
    try {
      await sendPasswordResetEmail({ to: email, name: user.name, token });
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

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: string };

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ResetPasswordResult> {
  if (!input.token) return { ok: false, error: "ლინკი არასწორია" };
  if (input.password.length < MIN_PASSWORD_LEN)
    return {
      ok: false,
      error: `პაროლი მინიმუმ ${MIN_PASSWORD_LEN} სიმბოლო უნდა იყოს`,
    };

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

  if (!row) return { ok: false, error: "ლინკი არასწორია ან ვადაგასულია" };

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await db
    .update(users)
    .set({
      passwordHash,
      // Successful reset implies the user controls the inbox — verify the
      // email at the same time so they don't hit the unverified-login wall.
      emailVerified: new Date(),
    })
    .where(eq(users.id, row.userId));

  await db.delete(authTokens).where(eq(authTokens.token, input.token));

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
  | { ok: false; error: string };

export async function signInWithEmail(
  input: SignInInput
): Promise<SignInResult> {
  // Bot gate before we even hit the password-hash compare — keeps
  // credential-stuffing attempts from burning bcrypt CPU.
  const human = await verifyTurnstile(input.turnstileToken);
  if (!human) return { ok: false, error: TURNSTILE_ERROR_KA };

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
        error:
          "ელფოსტა ჯერ არ არის დადასტურებული. შეამოწმე საფოსტო ყუთი.",
      };
    }
    // Auth.js wraps everything as "CredentialsSignin" — treat as bad credentials.
    return {
      ok: false,
      error: "ელფოსტა ან პაროლი არასწორია",
    };
  }
}
