"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { submitMbtiFor } from "@/lib/mbti-submit-core";
import { ApiError } from "@/lib/api/errors";

export type SubmitMbtiResult =
  { ok: true; id: string } | { ok: false; error: string };

/** Best-effort client IP from request headers (for rate limiting). */
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Claim + generate an Astro-MBTI result. Auth-gated on purpose: the quiz is
 * public and the 4-letter type is computed client-side for the free teaser,
 * but the expensive Gemini synthesis only runs for a signed-in user (so an
 * anonymous visitor can't burn AI budget), and it's rate-limited on top.
 *
 * The work itself lives in `lib/mbti-submit-core.ts`; this action supplies
 * the authenticated user and turns thrown errors into the form's result shape.
 */
export async function submitMbti(
  answers: Record<number, number>,
): Promise<SubmitMbtiResult> {
  const user = await requireUser();
  const locale = await getRequestLocale();
  const en = locale === "en";

  try {
    const { id } = await submitMbtiFor({
      userId: user.id,
      answers,
      locale,
      ip: await clientIp(),
    });
    return { ok: true, id };
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return {
        ok: false,
        error: en
          ? "Too many attempts. Please try again shortly."
          : "ბევრი მცდელობა იყო. სცადე ცოტა ხანში.",
      };
    }
    if (err instanceof ApiError && err.code === "save_failed") {
      return {
        ok: false,
        error: en
          ? "We could not save your result. Please try again."
          : "შენახვა ვერ მოხერხდა. სცადე თავიდან.",
      };
    }
    throw err;
  }
}

/** Whether the current user has completed onboarding (needed for the astro
 *  layer). Used by the claim UI to nudge no-chart users toward onboarding. */
export async function viewerHasBirthData(): Promise<boolean> {
  const user = await requireUser();
  const [p] = await db
    .select({ dob: profiles.dateOfBirth })
    .from(profiles)
    .where(and(eq(profiles.userId, user.id)))
    .limit(1);
  return !!p?.dob;
}
