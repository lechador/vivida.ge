import { NextRequest, NextResponse } from "next/server";

import { grantMonthlyCredits } from "@/lib/credits-monthly";

/**
 * Monthly free-credit drop — cron-triggered.
 *
 * Schedule (vercel.json): `0 6 1 * *` — 06:00 UTC on the 1st of each month
 * (10:00 Asia/Tbilisi). grantMonthlyCredits is idempotent per month (keyed by
 * the YYYY-MM ref), so a manual re-fire or an accidental double-tick never
 * double-grants.
 *
 * Auth mirrors the daily cron: Vercel's `Authorization: Bearer ${CRON_SECRET}`
 * or an `x-admin-token: ${ADMIN_API_TOKEN}` for manual reruns.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

  // Optional `?month=YYYY-MM` override for manual back-fills from admin.
  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month");
  const month = /^\d{4}-\d{2}$/.test(monthParam ?? "")
    ? (monthParam as string)
    : undefined;

  const result = await grantMonthlyCredits(month);
  return NextResponse.json(result);
}

// Vercel Cron fires GET; manual reruns from admin can use POST.
export const GET = run;
export const POST = run;
