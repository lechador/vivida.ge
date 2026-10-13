import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-helpers";
import { normalizeReturnPath } from "@/lib/safe-return-path";

/**
 * Post-auth landing.
 *
 * Every auth flow (Google / Apple / email / phone, login and signup) lands
 * here when no explicit `next` was requested, instead of hard-coding
 * `/dashboard`. Birth details are NOT required to finish registration:
 * the user goes straight to the requested destination (or `/dashboard`),
 * and features that need a natal chart render their own in-place unlock
 * card (AstroGate / BirthDataBanner) with a voluntary `/onboarding?next=`
 * CTA, so chart-free surfaces (tests, tarot, articles, feed) work
 * immediately and birth details can be added later.
 */
export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await requireUser();
  const { next } = await searchParams;
  const raw = next ? normalizeReturnPath(next, "") || null : null;
  // Never resolve to an auth-loop destination: the resolver itself and the
  // auth pages fall back to the dashboard instead of bouncing forever.
  const requestedPathname = raw
    ? new URL(raw, "https://vivida.invalid").pathname
    : null;
  const dest =
    !raw ||
    requestedPathname === "/post-login" ||
    requestedPathname === "/login" ||
    requestedPathname === "/signup"
      ? "/dashboard"
      : raw;

  redirect(dest);
}
