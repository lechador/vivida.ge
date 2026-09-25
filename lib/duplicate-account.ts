import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import {
  matchesBirthIdentity,
  normalizeAccountName,
  type BirthIdentity,
} from "@/lib/duplicate-account-match";

/**
 * A cautious onboarding signal, never proof of identity. Require the same
 * account name, birth date and minute, and birthplace within roughly 3 km.
 * An unknown birth time only matches another unknown time. We show a warning
 * with an explicit continue option instead of refusing the profile.
 */
export async function hasLikelyDuplicateAccount(
  userId: string,
  birth: Omit<BirthIdentity, "name">,
): Promise<boolean> {
  const [current] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const name = normalizeAccountName(current?.name ?? null);
  if (!name) return false;

  const candidates = await db
    .select({
      name: users.name,
      verified: users.emailVerified,
      dateOfBirth: profiles.dateOfBirth,
      timeOfBirth: profiles.timeOfBirth,
      latitude: profiles.latitude,
      longitude: profiles.longitude,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(
      and(
        eq(profiles.dateOfBirth, birth.dateOfBirth),
        ne(profiles.userId, userId),
      ),
    );

  return candidates.some((candidate) =>
    matchesBirthIdentity({ ...birth, name }, candidate),
  );
}
