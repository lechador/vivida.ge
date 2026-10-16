import { type NextRequest } from "next/server";

/**
 * Shared auth for cron endpoints.
 *
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is
 * set as a project env var. The admin token alternative exists so the same
 * endpoint can be re-fired by hand from the admin panel.
 *
 * Fails closed: with neither secret configured, nothing is authorized.
 */
export function cronAuthed(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = process.env.ADMIN_API_TOKEN;

  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const adminHeader = req.headers.get("x-admin-token");
  if (adminToken && adminHeader === adminToken) return true;

  return false;
}
