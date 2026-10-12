import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * Returns the user's unsubscribe token, generating + persisting one if
 * the column is still NULL (which it is for every user that existed
 * before we added the column).
 *
 * Token is opaque, 32 hex chars, stored unique on the user row. No salt
 * needed, the row IS the lookup, and we don't expose any other PII via
 * the token endpoint.
 */
export async function getOrCreateUnsubscribeToken(
  userId: string
): Promise<string> {
  const [row] = await db
    .select({ token: users.unsubscribeToken })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (row?.token) return row.token;

  const token = randomBytes(16).toString("hex");
  await db
    .update(users)
    .set({ unsubscribeToken: token })
    .where(eq(users.id, userId));
  return token;
}

export type UnsubscribeType = "daily" | "marketing" | "nudges" | "all";

const TYPES: readonly UnsubscribeType[] = [
  "daily",
  "marketing",
  "nudges",
  "all",
] as const;

export function isUnsubscribeType(value: string): value is UnsubscribeType {
  return (TYPES as readonly string[]).includes(value);
}

/**
 * Look up a user by token and flip the requested opt-out flag(s) to false.
 * Returns the user record (id + email) on success, null when the token
 * doesn't match anyone.
 */
export async function applyUnsubscribe(
  token: string,
  type: UnsubscribeType
): Promise<{ userId: string; email: string | null } | null> {
  const [row] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.unsubscribeToken, token))
    .limit(1);
  if (!row) return null;

  const patch: {
    emailDailyHoroscope?: boolean;
    emailMarketing?: boolean;
    emailNudges?: boolean;
  } = {};
  if (type === "daily" || type === "all") patch.emailDailyHoroscope = false;
  if (type === "marketing" || type === "all") patch.emailMarketing = false;
  if (type === "nudges" || type === "all") patch.emailNudges = false;

  await db.update(users).set(patch).where(eq(users.id, row.id));
  return { userId: row.id, email: row.email };
}
