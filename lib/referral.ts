import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { users, profiles, referrals } from "@/db/schema";
import {
  earnOnce,
  ensureCreditAccount,
  grantCredits,
  REFERRAL_REWARD,
  SIGNUP_BONUS,
} from "@/lib/credits";

/**
 * Referral engine — the credit-earning growth loop.
 *
 *   1. Every user has a short `referral_code`; they share /?ref=CODE.
 *   2. A visitor who lands with ?ref=CODE gets it stored in a cookie
 *      (REF_COOKIE); on signup we attribute them to the referrer (once).
 *   3. When that invited user *activates* — verifies email AND fills birth
 *      data — the referral qualifies and the referrer is paid REFERRAL_REWARD,
 *      exactly once. This gate is the anti-fraud: a fake/duplicate/abandoned
 *      signup never qualifies, and self-referral is blocked at attribution.
 */

export const REF_COOKIE = "vivida_ref";

function genCode(): string {
  return randomBytes(6).toString("base64url").replace(/[-_]/g, "").slice(0, 7).toLowerCase();
}

/** Get (or lazily create) this user's referral code. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const [u] = await db
    .select({ code: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (u?.code) return u.code;

  for (let i = 0; i < 6; i++) {
    const code = genCode();
    try {
      await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
      return code;
    } catch (e) {
      if ((e as { code?: string }).code === "23505") continue; // code collision — retry
      throw e;
    }
  }
  throw new Error("could not allocate referral code");
}

/**
 * Attribute a freshly-signed-up user to whoever's code they arrived with.
 * No-ops on unknown code, self-referral, or an already-attributed invitee (the
 * unique constraint on invited_user_id guarantees at most one referrer).
 */
export async function attributeReferral(invitedUserId: string, rawCode: string): Promise<void> {
  const code = rawCode.trim().toLowerCase();
  if (!code) return;
  const [referrer] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, code))
    .limit(1);
  if (!referrer || referrer.id === invitedUserId) return; // unknown code / self-referral
  await db
    .insert(referrals)
    .values({ referrerId: referrer.id, invitedUserId, status: "pending" })
    .onConflictDoNothing({ target: referrals.invitedUserId });
}

/**
 * Called when an invited user activates. If they meet the qualification gate
 * (verified email + birth data) and a still-unpaid referral exists, mark it
 * qualified and pay the referrer — atomically, exactly once. Safe to call on
 * every onboarding save; it's a cheap no-op once credited.
 */
export async function qualifyReferral(invitedUserId: string): Promise<void> {
  const [ref] = await db
    .select({ id: referrals.id, referrerId: referrals.referrerId })
    .from(referrals)
    .where(and(eq(referrals.invitedUserId, invitedUserId), isNull(referrals.creditedAt)))
    .limit(1);
  if (!ref) return;

  const [inv] = await db
    .select({ verified: users.emailVerified, dob: profiles.dateOfBirth })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, invitedUserId))
    .limit(1);
  if (!inv || !inv.verified || !inv.dob) return; // not activated yet

  // Claim the payout atomically — only the caller that flips credited_at wins.
  const claimed = await db
    .update(referrals)
    .set({ status: "qualified", qualifiedAt: new Date(), creditedAt: new Date() })
    .where(and(eq(referrals.id, ref.id), isNull(referrals.creditedAt)))
    .returning({ id: referrals.id });
  if (claimed.length === 0) return;

  await grantCredits(ref.referrerId, REFERRAL_REWARD, "referral", invitedUserId);
}

/**
 * Run once when a brand-new user is created (email or OAuth): grant the signup
 * bonus and, if they arrived with a ref cookie, attribute the referral. Called
 * from lib/auth-core's create paths; entirely best-effort so it can never block
 * registration.
 */
export async function onUserSignedUp(userId: string): Promise<void> {
  try {
    await ensureCreditAccount(userId);
    // `earnOnce` guards on an existing signup_bonus row, so no matter how many
    // create paths fire for one user (email registerUser + the Auth.js
    // createUser event, etc.), the bonus lands exactly once.
    await earnOnce(userId, SIGNUP_BONUS, "signup_bonus");
  } catch (err) {
    console.warn("[referral.onUserSignedUp] bonus failed:", (err as Error).message);
  }
  try {
    const ref = (await cookies()).get(REF_COOKIE)?.value;
    if (ref) await attributeReferral(userId, ref);
  } catch {
    /* attribution is best-effort */
  }
}

export type ReferralStats = { code: string; invited: number; qualified: number };

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const code = await ensureReferralCode(userId);
  const rows = await db
    .select({ status: referrals.status })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));
  return {
    code,
    invited: rows.length,
    qualified: rows.filter((r) => r.status === "qualified").length,
  };
}
