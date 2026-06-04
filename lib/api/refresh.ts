import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mobileRefreshTokens } from "@/db/schema";

/**
 * Refresh-token lifecycle for the mobile API.
 *
 * The raw token is a 256-bit random hex string returned to the client
 * once. We only ever persist its SHA-256 hash, so a database leak can't
 * be replayed as a login. Tokens rotate on every use: /auth/refresh
 * revokes the presented token and issues a fresh one.
 */
const REFRESH_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Mint a new refresh token, persist its hash, return the raw value. */
export async function issueRefreshToken(
  userId: string,
  userAgent?: string | null
): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await db.insert(mobileRefreshTokens).values({
    userId,
    tokenHash: hashToken(raw),
    userAgent: userAgent ?? null,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  return raw;
}

/**
 * Validate a presented refresh token and rotate it. Returns the owning
 * userId plus a brand-new refresh token, or null if the presented token
 * is unknown, already revoked, or expired.
 */
export async function rotateRefreshToken(
  raw: string,
  userAgent?: string | null
): Promise<{ userId: string; refreshToken: string } | null> {
  const [row] = await db
    .select()
    .from(mobileRefreshTokens)
    .where(eq(mobileRefreshTokens.tokenHash, hashToken(raw)))
    .limit(1);

  if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) {
    return null;
  }

  // Revoke the old token, then issue a replacement (rotation).
  await db
    .update(mobileRefreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(mobileRefreshTokens.id, row.id));

  const refreshToken = await issueRefreshToken(row.userId, userAgent);
  return { userId: row.userId, refreshToken };
}

/** Revoke a single refresh token (logout on this device). No-op if unknown. */
export async function revokeRefreshToken(raw: string): Promise<void> {
  await db
    .update(mobileRefreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(mobileRefreshTokens.tokenHash, hashToken(raw)));
}

/** Revoke every active refresh token for a user (log out everywhere). */
export async function revokeAllForUser(userId: string): Promise<void> {
  await db
    .update(mobileRefreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(mobileRefreshTokens.userId, userId));
}
