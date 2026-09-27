import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import {
  matchesBirthIdentity,
  matchesConfirmedDuplicate,
  normalizeAccountName,
  type BirthIdentity,
} from "@/lib/duplicate-account-match";

/**
 * An exact-name birth match is an advisory onboarding signal. A matching
 * signup IP plus a known exact birth minute and near-identical full name is
 * strong enough to refuse a repeated profile, even when the user confirms
 * the advisory warning. Both signals use the current birth-data save.
 */
export async function findDuplicateAccountSignal(
  userId: string,
  birth: Omit<BirthIdentity, "name">,
): Promise<"confirmed_duplicate" | "possible_duplicate" | null> {
  const [current] = await db
    .select({ name: users.name, signupIpHash: users.signupIpHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const name = normalizeAccountName(current?.name ?? null);
  if (!name) return null;

  const candidates = await db
    .select({
      name: users.name,
      signupIpHash: users.signupIpHash,
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

  const identity = {
    ...birth,
    name,
    signupIpHash: current?.signupIpHash ?? null,
  };
  if (
    candidates.some((candidate) =>
      matchesConfirmedDuplicate(identity, candidate),
    )
  ) {
    return "confirmed_duplicate";
  }
  if (
    candidates.some((candidate) => matchesBirthIdentity(identity, candidate))
  ) {
    return "possible_duplicate";
  }
  return null;
}
