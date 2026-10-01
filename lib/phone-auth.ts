import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, isNotNull, isNull, lt, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { phoneVerifications, users } from "@/db/schema";
import type { PhoneVerificationPurpose } from "@/db/schema";
import { generateOtpCode } from "@/lib/otp";

/**
 * Database-side core for the SMS phone flows — optional verification at
 * signup, phone-number login, and adding/changing the number in the
 * account. The website's server actions handle rate limiting, locale copy,
 * and the actual SMS send (lib/sms.ts).
 *
 * Security model: the 6-digit code is stored only as a hash, single-use,
 * expires in 10 minutes and dies after 5 wrong guesses. A correct code
 * flips `verifiedAt`; the challenge then still has to be consumed by the
 * right flow (session for login, account update for account, claim token
 * presented at signup), so a verified challenge alone can't move a number.
 */

const CODE_TTL_MS = 10 * 60 * 1000;
/** How long a verified-but-unbound signup claim stays usable. */
const CLAIM_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashCode(phone: string, code: string): string {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === "23505"
  );
}

/**
 * Issue (or re-issue) an SMS challenge and return the code to send.
 * Previous open challenges for the same (phone, purpose) are superseded, so
 * only the newest code works; expired leftovers for the phone are dropped.
 */
export async function createPhoneChallenge(input: {
  phone: string;
  purpose: PhoneVerificationPurpose;
  userId?: string | null;
}): Promise<string> {
  await db
    .delete(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, input.phone),
        eq(phoneVerifications.purpose, input.purpose),
      ),
    );
  // Housekeeping: this phone's expired rows are dead weight regardless of
  // purpose (login/account/signup leftovers accumulate across retries).
  await db
    .delete(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, input.phone),
        lt(phoneVerifications.expiresAt, new Date()),
      ),
    );

  const code = generateOtpCode();
  await db.insert(phoneVerifications).values({
    phone: input.phone,
    purpose: input.purpose,
    codeHash: hashCode(input.phone, code),
    claimToken: randomBytes(24).toString("hex"),
    userId: input.userId ?? null,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  return code;
}

export type PhoneCodeResult =
  | { ok: true; claimToken: string; userId: string | null }
  | { ok: false; error: "invalid" | "expired" };

/**
 * Check a 6-digit code against the newest open challenge for (phone,
 * purpose). Wrong guesses are counted on the row (destroyed at the cap);
 * a correct entry stamps `verifiedAt` and is idempotent for the same code.
 * The caller decides what happens to the verified challenge.
 */
export async function consumePhoneCode(input: {
  phone: string;
  purpose: PhoneVerificationPurpose;
  code: string;
  /** When set, the challenge must belong to this user (account purpose). */
  userId?: string;
}): Promise<PhoneCodeResult> {
  const code = input.code.trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "invalid" };

  const [row] = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, input.phone),
        eq(phoneVerifications.purpose, input.purpose),
        isNull(phoneVerifications.consumedAt),
      ),
    )
    .orderBy(desc(phoneVerifications.createdAt))
    .limit(1);

  if (!row) return { ok: false, error: "invalid" };
  if (input.userId && row.userId !== input.userId) {
    return { ok: false, error: "invalid" };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await db
      .delete(phoneVerifications)
      .where(eq(phoneVerifications.id, row.id));
    return { ok: false, error: "expired" };
  }
  if (row.codeHash !== hashCode(input.phone, code)) {
    const attempts = row.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await db
        .delete(phoneVerifications)
        .where(eq(phoneVerifications.id, row.id));
    } else {
      await db
        .update(phoneVerifications)
        .set({ attempts })
        .where(eq(phoneVerifications.id, row.id));
    }
    return { ok: false, error: "invalid" };
  }

  await db
    .update(phoneVerifications)
    .set({ verifiedAt: new Date() })
    .where(eq(phoneVerifications.id, row.id));
  return { ok: true, claimToken: row.claimToken, userId: row.userId };
}

async function burnChallenge(claimToken: string): Promise<void> {
  await db
    .update(phoneVerifications)
    .set({ consumedAt: new Date() })
    .where(eq(phoneVerifications.claimToken, claimToken));
}

export type PhoneLoginUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type PhoneLoginResult =
  | { ok: true; user: PhoneLoginUser }
  | {
      ok: false;
      error:
        | "invalid"
        | "expired"
        | "no_account"
        | "email_unverified"
        | "phone_reverification_required";
    };

/**
 * Complete a phone login: verify the code, then resolve the account whose
 * verified phone matches. The challenge is burned even when no account
 * exists, so a correct code can never be replayed.
 */
export async function completePhoneLogin(input: {
  phone: string;
  code: string;
}): Promise<PhoneLoginResult> {
  const checked = await consumePhoneCode({
    phone: input.phone,
    purpose: "login",
    code: input.code,
  });
  if (!checked.ok) return checked;
  await burnChallenge(checked.claimToken);

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
      phoneVerifiedAt: users.phoneVerifiedAt,
    })
    .from(users)
    .where(and(eq(users.phone, input.phone), isNotNull(users.phoneVerifiedAt)))
    .limit(1);
  if (!user) return { ok: false, error: "no_account" };
  // Legacy signup claims could be bound before email verification. Do not
  // let such a provisional password account log in by phone.
  if (user.passwordHash && !user.emailVerified) {
    return { ok: false, error: "email_unverified" };
  }
  if (
    user.passwordHash &&
    user.emailVerified &&
    user.phoneVerifiedAt &&
    user.phoneVerifiedAt.getTime() < user.emailVerified.getTime()
  ) {
    return { ok: false, error: "phone_reverification_required" };
  }
  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
  };
}

export type AccountPhoneResult =
  | {
      ok: true;
      phone: string;
      /** True when this is the account's first-ever verified number. */
      firstVerification: boolean;
    }
  | { ok: false; error: "invalid" | "expired" | "phone_taken" };

/**
 * Bind a freshly verified number to a logged-in user (account card).
 * Replaces any previously bound number; the one-number-one-account rule is
 * enforced by the unique index and the explicit taken check. Reports whether
 * this was the account's first verification so the caller can pay the
 * one-time phone-verify gift.
 */
export async function bindAccountPhone(input: {
  userId: string;
  phone: string;
  code: string;
}): Promise<AccountPhoneResult> {
  const checked = await consumePhoneCode({
    phone: input.phone,
    purpose: "account",
    code: input.code,
    userId: input.userId,
  });
  if (!checked.ok) return checked;

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.phone, input.phone), ne(users.id, input.userId)))
    .limit(1);
  if (taken) return { ok: false, error: "phone_taken" };

  const [before] = await db
    .select({ phoneVerifiedAt: users.phoneVerifiedAt })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  try {
    await db
      .update(users)
      .set({
        phone: input.phone,
        phoneVerifiedAt: new Date(),
        // Consent belongs to a specific verified number. Keep it only when
        // the user re-verifies the same number; a replacement starts opted out.
        smsMarketing: sql`CASE WHEN ${users.phone} = ${input.phone} THEN ${users.smsMarketing} ELSE false END`,
        smsMarketingConsentedAt: sql`CASE WHEN ${users.phone} = ${input.phone} THEN ${users.smsMarketingConsentedAt} ELSE NULL END`,
      })
      .where(eq(users.id, input.userId));
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "phone_taken" };
    throw err;
  }
  await burnChallenge(checked.claimToken);
  return {
    ok: true,
    phone: input.phone,
    firstVerification: !before?.phoneVerifiedAt,
  };
}

export type PhoneClaimResult =
  | { ok: true; phone: string }
  | { ok: false; error: "invalid_claim" | "phone_taken" };

/**
 * Bind a signup-time verified number after the account's email is verified,
 * using the claim token the browser received when it entered the SMS code.
 * Both proofs must be present before phone login can be enabled.
 */
export async function bindSignupPhoneClaim(input: {
  userId: string;
  claimToken: string;
}): Promise<PhoneClaimResult> {
  const token = input.claimToken.trim();
  if (!token) return { ok: false, error: "invalid_claim" };

  const [row] = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.claimToken, token),
        eq(phoneVerifications.purpose, "signup"),
      ),
    )
    .limit(1);

  if (!row || row.consumedAt || !row.verifiedAt) {
    return { ok: false, error: "invalid_claim" };
  }
  if (row.verifiedAt.getTime() + CLAIM_TTL_MS < Date.now()) {
    return { ok: false, error: "invalid_claim" };
  }

  // A signup claim can only be finalized once the inbox has been proven.
  // This prevents an attacker from registering someone else's email with
  // their own phone and waiting for the recipient to click a verify link.
  const [account] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);
  if (!account?.emailVerified) return { ok: false, error: "invalid_claim" };

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.phone, row.phone), ne(users.id, input.userId)))
    .limit(1);
  if (taken) return { ok: false, error: "phone_taken" };

  try {
    await db
      .update(users)
      .set({
        phone: row.phone,
        phoneVerifiedAt: new Date(
          Math.max(Date.now(), account.emailVerified.getTime() + 1),
        ),
      })
      .where(eq(users.id, input.userId));
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "phone_taken" };
    throw err;
  }
  await db
    .update(phoneVerifications)
    .set({ consumedAt: new Date(), userId: input.userId })
    .where(eq(phoneVerifications.id, row.id));
  return { ok: true, phone: row.phone };
}
