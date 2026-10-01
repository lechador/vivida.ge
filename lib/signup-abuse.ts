import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { and, eq, gte, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isLikelySameSignupPerson } from "@/lib/signup-abuse-match";

const DAY_MS = 24 * 60 * 60 * 1000;
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_LIMIT = 3;
const DAY_LIMIT = 10;
const DUPLICATE_WINDOW_MS = 30 * DAY_MS;

type NewSignupInput = {
  /** Extracted by the trusted edge/proxy, never read directly from form data. */
  ip: string | null | undefined;
  name: string | null | undefined;
  email: string | null | undefined;
};

export type NewSignupDecision =
  | { allowed: true; signupIpHash: string | null }
  | { allowed: false; reason: "duplicate" | "rate_limited" };

function canonicalIp(ip: string | null | undefined): string | null {
  const value = ip?.trim();
  if (!value || value.toLowerCase() === "unknown") return null;
  // Some proxies spell IPv4 addresses as IPv4-mapped IPv6 addresses.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(value);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];
  return isIP(value) ? value.toLowerCase() : null;
}

/** Irreversible, keyed IP identity; raw IPs never enter the user table. */
export function hashSignupIp(ip: string | null | undefined): string | null {
  const normalized = canonicalIp(ip);
  if (!normalized) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET must be set to hash signup IPs");
  return createHmac("sha256", secret)
    .update(`signup-ip:v1:${normalized}`)
    .digest("hex");
}

/**
 * Check before creating a new account through the website. The
 * atomic three-attempt/10m and ten-attempt/24h limits stop parallel bursts
 * without false-blocking carrier-NAT neighbours (several unrelated visitors
 * routinely share one public IPv4); an independent 30-day identity
 * check catches name/email variations from already verified accounts sharing
 * the same IP. A shared IP by itself never counts as a duplicate. Missing or
 * invalid IPs are ignored because a common "unknown" bucket would block
 * unrelated visitors.
 *
 * Persist `signupIpHash` from an allowed result on the newly created user.
 * This module does not write the user: callers own that transaction/adapter.
 */
export async function checkNewSignup(
  input: NewSignupInput,
): Promise<NewSignupDecision> {
  const signupIpHash = hashSignupIp(input.ip);
  if (!signupIpHash) return { allowed: true, signupIpHash: null };

  try {
    // A short few-attempt window closes the common race where two OAuth
    // callbacks both query before either new user has been inserted.
    await enforceRateLimit({
      bucket: "new_signup_ip_burst",
      identifier: signupIpHash,
      limit: BURST_LIMIT,
      windowMs: BURST_WINDOW_MS,
    });
    await enforceRateLimit({
      bucket: "new_signup_ip_day",
      identifier: signupIpHash,
      limit: DAY_LIMIT,
      windowMs: DAY_MS,
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "rate_limited") {
      return { allowed: false, reason: "rate_limited" };
    }
    throw error;
  }

  const recent = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(
      and(
        eq(users.signupIpHash, signupIpHash),
        gte(users.createdAt, new Date(Date.now() - DUPLICATE_WINDOW_MS)),
        isNotNull(users.emailVerified),
      ),
    );
  if (recent.some((user) => isLikelySameSignupPerson(input, user))) {
    return { allowed: false, reason: "duplicate" };
  }
  return { allowed: true, signupIpHash };
}
