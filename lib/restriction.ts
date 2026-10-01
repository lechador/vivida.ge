import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { ageFromDob } from "@/lib/profile-utils";
import { MINIMUM_AGE_YEARS } from "@/lib/profile-core";

/**
 * Account-level restriction for trust & safety. A restricted account keeps
 * read-only astrology access (chart, daily horoscope) but cannot write to the
 * social layer — no chat, no friend requests (in or out), no feed posts or
 * comments. Enforced in the website's write cores.
 *
 * The *effective* restriction is DOB-driven OR a manual override:
 *   - under MINIMUM_AGE_YEARS by birth date → restricted, and it **auto-lifts
 *     the day they turn 18** (nothing to remember to clear); or
 *   - `users.restricted = true` → a manual override for non-age cases.
 *
 * Shared Georgian copy so restricted actions show the same message. The wording
 * intentionally covers both age-based and manual safety restrictions without
 * disclosing an internal moderation decision.
 */
export const RESTRICTED_MESSAGE =
  "შენი ანგარიში უსაფრთხოების წესების გამო შეზღუდულია — ამ ფუნქციით ვერ ისარგებლებ.";

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
