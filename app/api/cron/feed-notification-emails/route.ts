import { NextRequest, NextResponse } from "next/server";

import { flushUnreadFeedActivityEmails } from "@/lib/email";

/**
 * Hourly flush of comment/reaction emails for users who were on the site
 * when the event happened (so the immediate send was skipped) and then
 * stayed away for ≥1h. sendFeedActivityEmail itself re-checks absence,
 * emailNudges, and the 1h throttle, so a double-tick is a no-op.
 *
 * Auth mirrors the daily cron: Vercel's `Authorization: Bearer ${CRON_SECRET}`
 * or an `x-admin-token: ${ADMIN_API_TOKEN}` for manual reruns.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authed(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = process.env.ADMIN_API_TOKEN;

  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const adminHeader = req.headers.get("x-admin-token");
  if (adminToken && adminHeader === adminToken) return true;

  return false;
}

async function run(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await flushUnreadFeedActivityEmails();
  return NextResponse.json(result);
}

export const GET = run;
export const POST = run;
