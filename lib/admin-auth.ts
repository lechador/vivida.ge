import { redirect } from "next/navigation";

import { auth } from "@/auth";

/**
 * Comma-separated allow-list of admin emails. Anyone whose session email
 * matches an entry can access `/admin/*` pages. The list is kept in an
 * env var (not the DB) so promoting/demoting an admin is a Vercel
 * config edit, not a SQL migration.
 *
 * Falls back to a single hardcoded founder email so /admin works in
 * dev without env wiring, matching how the API-token admin endpoints
 * degrade. Set ADMIN_EMAILS in production to override.
 */
const FOUNDER_EMAIL = "endeladzegivi@gmail.com";

function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  const list = (raw ?? FOUNDER_EMAIL)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 ? list : [FOUNDER_EMAIL];
}

/** True iff `email` is one of the configured admins (case-insensitive). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/**
 * Gate for `/admin/*` Server Components and admin server actions.
 * Redirects non-admins to `/` so admin URLs don't leak existence to
 * curious users. Returns the (verified) session user for callers that
 * want to log who performed the action.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/");
  }
  return session.user;
}
