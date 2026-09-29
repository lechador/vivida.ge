/**
 * Comma-separated allow-list of admin emails. Used by the token-authed
 * `/api/admin/*` endpoints (which serve the separate vivida-admin app) and
 * by admin powers inside the public UI (e.g. moderating any feed post).
 * The list is kept in an env var (not the DB) so promoting/demoting an
 * admin is a Vercel config edit, not a SQL migration.
 *
 * Falls back to a single hardcoded founder email so admin checks work in
 * dev without env wiring. Set ADMIN_EMAILS in production to override.
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
