import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

/**
 * Intent-aware post-auth landing (W03).
 *
 * Every auth flow (Google / Apple / email, login and signup) lands here when
 * no explicit `next` was requested, instead of hard-coding `/dashboard`:
 * - new / incomplete profile → `/onboarding` (carrying the final destination
 *   as `?next=`, so the wizard returns the user to their original goal);
 * - complete profile → the requested destination, or `/dashboard`;
 * - `/taro` is honored directly even without birth data — the reader works
 *   without a profile and restores the pending question from sessionStorage,
 *   so auth must not swallow the draft behind onboarding.
 */
function safeNext(v: string | undefined): string | null {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
}

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  const { next } = await searchParams;
  const raw = safeNext(next);
  // Never resolve to an auth-loop destination: the resolver itself and the
  // auth pages fall back to the dashboard instead of bouncing forever.
  const dest =
    !raw ||
    raw === "/post-login" ||
    raw.startsWith("/post-login?") ||
    raw === "/login" ||
    raw === "/signup"
      ? "/dashboard"
      : raw;

  const [profile] = await db
    .select({ dateOfBirth: profiles.dateOfBirth })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile?.dateOfBirth && !dest.startsWith("/taro")) {
    redirect(`/onboarding?next=${encodeURIComponent(dest)}`);
  }
  redirect(dest);
}
