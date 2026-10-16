import { type NextRequest } from "next/server";

import { runDailyHoroscopeCron } from "@/lib/cron/daily-horoscope";

/**
 * Daily-horoscope email blast, cron-triggered.
 *
 * Schedule (vercel.json): runs at 05:00 UTC and 05:30 UTC daily, which
 * is 09:00 / 09:30 Asia/Tbilisi. The 05:30 tick is a safety retry: if
 * the 05:00 invocation timed out or crashed mid-send, the second tick
 * picks up rows still marked pending/failed for today.
 *
 * Auth, accepts either:
 *   - `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron's standard
 *     header when CRON_SECRET is set as a project env var); or
 *   - `x-admin-token: ${ADMIN_API_TOKEN}` for manual reruns from the
 *     admin panel ("re-fire today's blast").
 *
 * Idempotency, rows are enqueued once per (user, sendDate) and the drain only
 * ever sends a row that is still pending, so a normal re-run cannot double-send.
 * Note the batch endpoint cannot carry per-email idempotency keys, so a batch
 * that succeeds at Resend but whose response we lose can resend on the next
 * tick. See the DURABILITY TRADE-OFF note in sendDailyHoroscopeBlast.
 *
 * This endpoint now does ONE thing: the daily horoscope blast. Push,
 * birthday gifts, winback, lead horoscopes and the verification/profile
 * re-nudges moved to /api/cron/lifecycle. They used to run after the blast
 * in this same invocation, and once the blast grew to fill the 300s
 * maxDuration it silently starved every one of them for nine weeks. See
 * lib/cron/lifecycle.ts for the full post-mortem.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel Cron fires GET; manual reruns from admin can use POST.
export function GET(req: NextRequest) {
  return runDailyHoroscopeCron(req, false);
}

export const POST = GET;
