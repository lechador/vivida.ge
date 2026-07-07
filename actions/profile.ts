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
import { sendWelcomeIfEligible } from "@/lib/email";
import { awardReputation, RepSubject } from "@/lib/reputation";
import {
  saveBirthDataCore,
  updatePublicProfileCore,
  type SaveBirthDataInput,
  type UpdatePublicProfileInput,
} from "@/lib/profile-core";

export type SaveProfileInput = SaveBirthDataInput;

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveProfile(
  input: SaveProfileInput
): Promise<SaveProfileResult> {
  const user = await requireUser();

  // Validation + upsert live in the shared core so web and mobile stay
  // byte-for-byte identical. Only the side effects below are web-specific.
  const result = await saveBirthDataCore(user.id, input);
  if (!result.ok) return result;

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
    // Welcome email — onboarding is now complete (email verified + birth
    // data saved), so this is the right moment for "your cosmic journey
    // begins." Idempotent, so later profile edits never re-send.
    await sendWelcomeIfEligible(userId);
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  redirect("/dashboard");
}

// ────────────────────────────────────────────────────────────────────────
// Public profile fields: username + display name + bio
// ────────────────────────────────────────────────────────────────────────

export type UpdateProfileFieldsInput = UpdatePublicProfileInput;

export type UpdateProfileFieldsResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Edit the public-profile fields. Every profile is public, so this just
 * validates and saves username/displayName/bio via the shared core.
 */
export async function updateProfileFields(
  input: UpdateProfileFieldsInput
): Promise<UpdateProfileFieldsResult> {
  const user = await requireUser();

  const result = await updatePublicProfileCore(user.id, input);
  if (!result.ok) return result;

  revalidatePath("/account");
  revalidatePath(`/u/${result.username}`);
  invalidateProfileForUser(user.id);
  return { ok: true };
}

/**
 * Toggle discovery opt-out. When off, the user disappears from the /people
 * directory, people search, and "suggested people" rails — their profile
 * stays reachable by direct link. Instant-save (no Save button).
 */
export async function setDiscoverable(value: boolean): Promise<void> {
  const user = await requireUser();
  await db
    .update(profiles)
    .set({ discoverable: value, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/account");
  revalidatePath("/people");
}
