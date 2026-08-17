import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { suggestUsername } from "@/lib/profile-utils";

/**
 * Guarantee a user ends up with a username, creating their `profile` row if
 * they don't have one yet.
 *
 * Every people surface — /people, the discovery feed, the match deck, site
 * search and @mention autocomplete — filters on `username IS NOT NULL`, so a
 * user without one is invisible to everybody and unreachable at /u/<name>.
 *
 * Username used to be assigned lazily, on the first profile save, which left
 * two holes: users who signed up and never onboarded had no profile row at
 * all, and the two upserts that create a bare row (updateAccountSettingsCore,
 * setTestResultVisibility) never set one. Both are closed by calling this at
 * account-creation time instead — see the callers in lib/auth-core.ts and the
 * `createUser` event in auth.ts.
 *
 * Idempotent: returns the existing username untouched when there is one, so it
 * is safe to call on every code path that can create or touch a user.
 *
 * @param name Display name to derive the slug from. Pass it when the caller
 *   already has it (fresh signup) to skip a lookup; omit to read `user.name`.
 * @returns The username now on the row, or null if one couldn't be assigned.
 */
export async function ensureUsername(
  userId: string,
  name?: string | null
): Promise<string | null> {
  const [existing] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (existing?.username) return existing.username;

  let sourceName = name ?? null;
  if (name === undefined) {
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return null; // no such user — nothing to attach a profile to
    sourceName = user.name;
  }

  // suggestUsername appends a random 4-digit suffix, so every retry is a fresh
  // candidate. A 23505 means the candidate was taken; anything else is real.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = suggestUsername(sourceName);
    try {
      // No profile row yet (the common case for a never-onboarded user): make
      // one carrying the username. Every other profile column is nullable or
      // defaulted, and onboarding gates on `date_of_birth` rather than on the
      // row existing, so a bare row doesn't fake a completed profile.
      const inserted = await db
        .insert(profiles)
        .values({ userId, username: candidate })
        .onConflictDoNothing({ target: profiles.userId })
        .returning({ username: profiles.username });
      if (inserted.length > 0) return inserted[0].username;

      // Row already existed. The isNull guard keeps a concurrent write from
      // being clobbered, and .returning() tells us whether we actually won.
      const updated = await db
        .update(profiles)
        .set({ username: candidate, updatedAt: new Date() })
        .where(and(eq(profiles.userId, userId), isNull(profiles.username)))
        .returning({ username: profiles.username });
      if (updated.length > 0) return updated[0].username;

      // Zero rows updated: somebody else set a username between our read and
      // our write. Report theirs rather than looping on a row that's done.
      const [current] = await db
        .select({ username: profiles.username })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      return current?.username ?? null;
    } catch (err) {
      if ((err as { code?: string }).code === "23505") continue; // taken, re-roll
      throw err;
    }
  }
  return null;
}
