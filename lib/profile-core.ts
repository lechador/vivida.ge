import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ageFromDob } from "@/lib/profile-utils";
import { qualifyReferral } from "@/lib/referral";
import { completeEligibleEmailCampaigns } from "@/lib/email-campaigns";

/**
 * Framework-agnostic profile *write* logic, shared by the website (Server
 * Actions in actions/profile.ts) and the mobile API (app/api/v1/me/profile).
 * Callers do their own auth and pass the resolved user id in — these
 * functions never touch sessions, revalidate Next's cache, or redirect.
 *
 * Errors come back as `{ ok: false, error }` with the same Georgian strings
 * the website already shows, so web and mobile surface identical copy.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

/**
 * Minimum age to register/use Vivida. The app has 1:1 chat and a social feed
 * (and shipped with a dating-style match deck), so we gate on adulthood.
 * Derived from the natal birth date the user already provides — no separate
 * age field. Adjust this single constant to change the threshold.
 */
export const MINIMUM_AGE_YEARS = 18;

export type SaveBirthDataInput = {
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string | null; // HH:MM (24h) or null = unknown
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** Self-reported sex; null = skipped. */
  gender?: "male" | "female" | null;
  /** Optional username — wizard sets it on first save. */
  username?: string | null;
};

export type ProfileWriteResult = { ok: true } | { ok: false; error: string };

/**
 * Validate birth data and upsert the user's profile row. Birth date is
 * locked after the first save — the server ignores any date the client
 * sends thereafter and reuses the stored value (prevents one account from
 * spinning up unlimited charts / burning AI credits). Time + location
 * remain editable. Username is only validated/persisted when explicitly
 * provided (the onboarding wizard passes it; later edits don't).
 */
export async function saveBirthDataCore(
  userId: string,
  input: SaveBirthDataInput
): Promise<ProfileWriteResult> {
  // Validation — server is the source of truth, never trust the client.
  if (!DATE_RE.test(input.dateOfBirth)) {
    return { ok: false, error: "დაბადების თარიღი არასწორია" };
  }
  if (input.timeOfBirth !== null && !TIME_RE.test(input.timeOfBirth)) {
    return { ok: false, error: "დაბადების დრო არასწორია" };
  }
  if (!input.cityName.trim()) {
    return { ok: false, error: "აირჩიე ქალაქი" };
  }
  if (
    Number.isNaN(input.latitude) ||
    Number.isNaN(input.longitude) ||
    Math.abs(input.latitude) > 90 ||
    Math.abs(input.longitude) > 180
  ) {
    return { ok: false, error: "კოორდინატები არასწორია" };
  }
  if (!input.timezone.trim()) {
    return { ok: false, error: "მიუთითე დროის სარტყელი" };
  }

  const year = Number(input.dateOfBirth.slice(0, 4));
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear) {
    return { ok: false, error: "დაბადების წელი უნდა იყოს 1900-დან დღემდე" };
  }

  // Birth date is fixed at first registration. After that we reuse the
  // stored value and ignore the client's date.
  const [existingProfile] = await db
    .select({ dateOfBirth: profiles.dateOfBirth })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const lockedDate = existingProfile?.dateOfBirth ?? input.dateOfBirth;

  // Minimum-age gate. Computed from the date that will actually be persisted
  // (locked on first save), so under-age users can't complete onboarding and
  // thus can't get a profile/chart or reach chat. Server-enforced — the
  // client never decides this.
  const age = ageFromDob(lockedDate);
  if (age !== null && age < MINIMUM_AGE_YEARS) {
    return {
      ok: false,
      error: `Vivida-ს გამოყენება ${MINIMUM_AGE_YEARS} წლიდან არის შესაძლებელი`,
    };
  }

  // Time stored as HH:MM:SS for Postgres `time` column.
  const timeForDb = input.timeOfBirth ? `${input.timeOfBirth}:00` : null;

  // Username — only validate / persist when explicitly set in the call.
  const usernameProvided = input.username !== undefined;
  let username: string | null = null;
  if (usernameProvided) {
    const u = input.username?.trim().toLowerCase() || null;
    if (u) {
      if (!USERNAME_RE.test(u)) {
        return {
          ok: false,
          error: "მომხმარებლის სახელი უნდა იყოს 3-24 სიმბოლო (a-z, 0-9, _)",
        };
      }
      const [taken] = await db
        .select({ userId: profiles.userId })
        .from(profiles)
        .where(eq(profiles.username, u))
        .limit(1);
      if (taken && taken.userId !== userId) {
        return { ok: false, error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" };
      }
    }
    username = u;
  }

  // Only write gender when the user actually picked one (skipping leaves any
  // existing value — incl. an AI-inferred one — untouched). Self-reported
  // overrides AI: source='self'.
  const genderFields =
    input.gender === "male" || input.gender === "female"
      ? { gender: input.gender, genderSource: "self" as const }
      : {};

  try {
    await db
      .insert(profiles)
      .values({
        userId,
        dateOfBirth: lockedDate,
        timeOfBirth: timeForDb,
        latitude: input.latitude,
        longitude: input.longitude,
        cityName: input.cityName.trim(),
        timezone: input.timezone,
        ...genderFields,
        ...(usernameProvided ? { username } : {}),
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        // dateOfBirth is intentionally absent — it's locked after first save.
        set: {
          timeOfBirth: timeForDb,
          latitude: input.latitude,
          longitude: input.longitude,
          cityName: input.cityName.trim(),
          timezone: input.timezone,
          ...genderFields,
          ...(usernameProvided ? { username } : {}),
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" };
    }
    throw err;
  }

  // Filling birth data completes "activation" — pay out any pending referral
  // (the other half of the gate, email verification, is handled on verify).
  try {
    await qualifyReferral(userId);
  } catch {
    /* referral payout is best-effort */
  }

  // Attribute the conversion and pay any promised campaign reward once.
  await completeEligibleEmailCampaigns(userId);

  return { ok: true };
}

export type UpdatePublicProfileInput = {
  username: string;
  displayName?: string | null;
  bio?: string | null;
};

/**
 * Edit the public-profile fields (username + display name + bio). Username
 * must be unique + slug-shaped (3–24 chars, lowercase + digits + _).
 */
export async function updatePublicProfileCore(
  userId: string,
  input: UpdatePublicProfileInput
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  const username = input.username.trim().toLowerCase();
  if (!username) {
    return { ok: false, error: "აირჩიე მომხმარებლის სახელი" };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error: "მომხმარებლის სახელი უნდა იყოს 3-24 სიმბოლო (a-z, 0-9, _)",
    };
  }
  const [taken] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  if (taken && taken.userId !== userId) {
    return { ok: false, error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" };
  }

  const displayName = input.displayName?.trim() || null;
  if (displayName && displayName.length > 60) {
    return { ok: false, error: "სახელი ძალიან გრძელია" };
  }

  const bio = input.bio?.trim() || null;
  if (bio && bio.length > 280) {
    return { ok: false, error: "ბიო ზედმეტად გრძელია (მაქს. 280 სიმბოლო)" };
  }

  try {
    await db
      .update(profiles)
      .set({ username, displayName, bio, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" };
    }
    throw err;
  }

  return { ok: true, username };
}

export type AccountSettingsInput = {
  /** Discovery opt-out toggle. */
  discoverable?: boolean;
  /** Self-reported sex; only 'male' | 'female' are accepted. */
  gender?: "male" | "female";
};

/**
 * Update lightweight account/privacy settings (discoverability + self-reported
 * gender) in one call. Only fields that are present are written; gender is
 * always stamped source='self' so the AI name-inference backfill never
 * overwrites it. Upserts the profile row so a user who registered without
 * birth data still gets one. Backs the mobile PATCH /api/v1/me/settings
 * endpoint; mirrors the website's setDiscoverable / updateGender Server
 * Actions.
 */
export async function updateAccountSettingsCore(
  userId: string,
  input: AccountSettingsInput
): Promise<void> {
  const set: Partial<typeof profiles.$inferInsert> = {};
  if (typeof input.discoverable === "boolean") {
    set.discoverable = input.discoverable;
  }
  if (input.gender === "male" || input.gender === "female") {
    set.gender = input.gender;
    set.genderSource = "self";
  }
  if (Object.keys(set).length === 0) return;
  set.updatedAt = new Date();
  await db
    .insert(profiles)
    .values({ userId, ...set })
    .onConflictDoUpdate({ target: profiles.userId, set });
}
