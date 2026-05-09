import { NextRequest, NextResponse } from "next/server";

import {
  sendDailyHoroscopeBlast,
  utcDateKey,
} from "@/lib/email-marketing";

/**
 * Daily-horoscope email blast — cron-triggered.
 *
 * Schedule (vercel.json): runs at 05:00 UTC and 05:30 UTC daily, which
 * is 09:00 / 09:30 Asia/Tbilisi. The 05:30 tick is a safety retry: if
 * the 05:00 invocation timed out or crashed mid-send, the second tick
 * picks up rows still marked pending/failed for today.
 *
 * Auth — accepts either:
 *   - `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron's standard
 *     header when CRON_SECRET is set as a project env var); or
 *   - `x-admin-token: ${ADMIN_API_TOKEN}` for manual reruns from the
 *     admin panel ("re-fire today's blast").
 *
 * Idempotency — every Resend call carries `Idempotency-Key=daily:<userId>:<date>`,
 * so even an at-least-once retry on our side never produces a duplicate
 * email on Resend's side.
 *
 * Concurrency — defaults to 8 simultaneous Resend requests. Resend Pro
 * is rate-limited to 10/sec sustained; 8 leaves headroom for transient
 * spikes from natural retry. Tunable via `?concurrency=N` query param.
 *
 * Date — uses today's UTC date (YYYY-MM-DD) as the send-log partition
 * key, matching what `sendDailyHoroscopeBlast` does internally.
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

  const url = new URL(req.url);
  const concurrencyParam = url.searchParams.get("concurrency");
  const concurrency = concurrencyParam
    ? Math.max(1, Math.min(20, Number(concurrencyParam) || 8))
    : 8;

  const sendDate = utcDateKey();
  const result = await sendDailyHoroscopeBlast({ sendDate, concurrency });

  return NextResponse.json({ sendDate, concurrency, ...result });
}

// Vercel Cron fires GET; manual reruns from admin can use POST.
export const GET = run;
export const POST = run;
