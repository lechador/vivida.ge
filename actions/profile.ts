"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { invalidateProfileForUser } from "@/lib/header-cache";
import { ensureChartFor } from "@/actions/chart";
import { getCurrentPlan } from "@/lib/plan";
import { awardReputation, RepSubject } from "@/lib/reputation";

export type SaveProfileInput = {
  dateOfBirth: string;        // YYYY-MM-DD
  timeOfBirth: string | null; // HH:MM (24h) or null = unknown
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** Optional username — wizard sets it on first save. */
  username?: string | null;
};

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export async function saveProfile(
  input: SaveProfileInput
): Promise<SaveProfileResult> {
  const user = await requireUser();

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

  // Birth date is fixed at first registration. After that the server ignores
  // any date the client tries to send and reuses the stored value. This
  // prevents abuse where one account spins up unlimited charts (and burns AI
  // credits) by cycling through dates. Time + location remain editable.
  const [existingProfile] = await db
    .select({ dateOfBirth: profiles.dateOfBirth })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const lockedDate = existingProfile?.dateOfBirth ?? input.dateOfBirth;

  // Time stored as HH:MM:SS for Postgres `time` column.
  const timeForDb = input.timeOfBirth ? `${input.timeOfBirth}:00` : null;

  // Username — only validate / persist when explicitly set in the call.
  // Existing profiles editing their birth data won't have username passed.
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
      if (taken && taken.userId !== user.id) {
        return { ok: false, error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" };
      }
    }
    username = u;
  }

  try {
    await db
      .insert(profiles)
      .values({
        userId: user.id,
        dateOfBirth: lockedDate,
        timeOfBirth: timeForDb,
        latitude: input.latitude,
        longitude: input.longitude,
        cityName: input.cityName.trim(),
        timezone: input.timezone,
        ...(usernameProvided ? { username } : {}),
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        // Note: dateOfBirth is intentionally absent from the update set —
        // it's locked after first registration. See `lockedDate` above.
        set: {
          timeOfBirth: timeForDb,
          latitude: input.latitude,
          longitude: input.longitude,
          cityName: input.cityName.trim(),
          timezone: input.timezone,
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

  // Pre-generate the natal chart in the background — Gemini interpretation
  // can take 10-30s on a cold call and was blocking the wizard submit
  // button. /dashboard renders a CosmicLoader inside <Suspense> for its
  // own ensureChartFor call, so the user sees progress immediately
  // instead of a frozen "submit" spinner here. The deferred ensureChartFor
  // is upsert-safe and will collide-then-merge if the dashboard's call
  // happens to win the race.
  const userId = user.id;
  after(async () => {
    try {
      const plan = await getCurrentPlan(userId);
      await ensureChartFor(userId, plan);
    } catch (err) {
      console.warn(
        "[saveProfile] background chart pre-gen failed; dashboard will retry:",
        (err as Error).message
      );
    }
    // Reputation — credit the one-shot profile_completed milestone.
    // Dedup index makes a second save a no-op so editing later doesn't
    // re-fire the bonus.
    await awardReputation({
      userId,
      kind: "profile_completed",
      subjectId: RepSubject.oneShot(userId),
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  redirect("/dashboard");
}

// ────────────────────────────────────────────────────────────────────────
// Public profile fields: username + display name + bio
// ────────────────────────────────────────────────────────────────────────

export type UpdateProfileFieldsInput = {
  username: string;
  displayName?: string | null;
  bio?: string | null;
};

export type UpdateProfileFieldsResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Edit the public-profile fields. Every profile is public, so this just
 * validates and saves username/displayName/bio.
 * Username must be unique + slug-shaped (3–24 chars, lowercase + digits + _).
 */
export async function updateProfileFields(
  input: UpdateProfileFieldsInput
): Promise<UpdateProfileFieldsResult> {
  const user = await requireUser();

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
  if (taken && taken.userId !== user.id) {
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
      .set({
        username,
        displayName,
        bio,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id));
  } catch (err) {
    // Postgres unique-violation on username
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "ეს მომხმარებლის სახელი უკვე დაკავებულია" };
    }
    throw err;
  }

  revalidatePath("/account");
  revalidatePath(`/u/${username}`);
  invalidateProfileForUser(user.id);
  return { ok: true };
}
