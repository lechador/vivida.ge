import { after } from "next/server";
import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { ensureChartFor } from "@/actions/chart";
import { sendWelcomeIfEligible } from "@/lib/email";
import { invalidateProfileForUser } from "@/lib/header-cache";
import { saveBirthDataCore, updatePublicProfileCore } from "@/lib/profile-core";
import { awardReputation, RepSubject } from "@/lib/reputation";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const BirthBody = z.object({
  dateOfBirth: z.string(),
  timeOfBirth: z.string().nullable(),
  cityName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  username: z.string().nullable().optional(),
  confirmPossibleDuplicate: z.boolean().optional(),
});

const PublicBody = z.object({
  username: z.string(),
  displayName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

/**
 * PUT /api/v1/me/profile  { dateOfBirth, timeOfBirth, cityName, latitude,
 *                           longitude, timezone, username? }
 *
 * Save birth data (the onboarding wizard's submit, and later edits). Shares
 * saveBirthDataCore() with the website's saveProfile Server Action — same
 * validation, the same locked-birth-date rule, the same username uniqueness
 * check. On success we pre-generate the natal chart and credit the one-shot
 * profile_completed reputation in the background, exactly like the web flow.
 */
export async function PUT(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, BirthBody);

    const result = await saveBirthDataCore(user.id, input);
    if (!result.ok) {
      return fail(
        result.code === "possible_duplicate" ? 409 : 422,
        result.code ?? "profile_rejected",
        result.error,
      );
    }

    const userId = user.id;
    after(async () => {
      try {
        await ensureChartFor(userId);
      } catch (err) {
        console.warn(
          "[api/v1/me/profile] background chart pre-gen failed:",
          (err as Error).message,
        );
      }
      await awardReputation({
        userId,
        kind: "profile_completed",
        subjectId: RepSubject.oneShot(userId),
      });
      // Welcome email fires now — onboarding complete (verified + birth
      // data), not at registration. Idempotent; edits never re-send.
      await sendWelcomeIfEligible(userId);
    });

    return ok({ ok: true });
  });
}

/**
 * PATCH /api/v1/me/profile  { username, displayName?, bio? }
 *
 * Edit the public-profile fields. Shares updatePublicProfileCore() with the
 * website's updateProfileFields Server Action.
 */
export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, PublicBody);

    const result = await updatePublicProfileCore(user.id, input);
    if (!result.ok) {
      return fail(422, "profile_rejected", result.error);
    }

    invalidateProfileForUser(user.id);
    return ok({ ok: true });
  });
}
