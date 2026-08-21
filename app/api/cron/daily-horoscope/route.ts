import { type NextRequest } from "next/server";

import { runDailyHoroscopeCron } from "@/lib/cron/daily-horoscope";

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
 * Concurrency — defaults to 8, but this only parallelizes per-user prep
 * (horoscope lookup, unsubscribe tokens). The Resend calls themselves
 * serialize through lib/resend-throttle.ts at ~1.7/s, under the account's
 * 2 req/s limit. Tunable via `?concurrency=N` query param.
 *
 * Date — uses today's UTC date (YYYY-MM-DD) as the send-log partition
 * key, matching what `sendDailyHoroscopeBlast` does internally.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel Cron fires GET; manual reruns from admin can use POST.
export function GET(req: NextRequest) {
  return runDailyHoroscopeCron(req, false);
}

export const POST = GET;
