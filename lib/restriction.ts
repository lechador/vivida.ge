import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { ageFromDob } from "@/lib/profile-utils";
import { MINIMUM_AGE_YEARS } from "@/lib/profile-core";

/**
 * Account-level restriction for trust & safety. A restricted account keeps
 * read-only astrology access (chart, daily horoscope) but cannot write to the
 * social layer — no chat, no friend requests (in or out), no feed posts or
 * comments. Enforced in the shared write cores so the mobile API inherits it.
 *
 * The *effective* restriction is DOB-driven OR a manual override:
 *   - under MINIMUM_AGE_YEARS by birth date → restricted, and it **auto-lifts
 *     the day they turn 18** (nothing to remember to clear); or
 *   - `users.restricted = true` → a manual override for non-age cases.
 *
 * Shared Georgian copy so web + mobile surface the same message.
 */
export const RESTRICTED_MESSAGE =
  "შენი ანგარიში შეზღუდულია 18 წლის ასაკამდე — ამ ფუნქციით ვერ ისარგებლებ.";

export async function isAccountRestricted(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ restricted: users.restricted, dob: profiles.dateOfBirth })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return false;
  if (row.restricted) return true;
  const age = ageFromDob(row.dob);
  return age !== null && age < MINIMUM_AGE_YEARS;
}
