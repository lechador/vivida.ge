import { NextRequest, NextResponse } from "next/server";

import {
  sendDailyHoroscopeBlast,
  utcDateKey,
} from "@/lib/email-marketing";
import { sendDailyPushBlast } from "@/lib/push";
import { sendBirthdayGifts } from "@/lib/birthday";
import { sendWinbackNudges } from "@/lib/winback";
import { sendDailyHoroscopeToLeads } from "@/lib/horoscope-leads";
import {
  sendVerificationRenudges,
  sendProfileIncompleteRenudges,
} from "@/lib/renudge";
import { pruneRateLimits } from "@/lib/rate-limit";

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

  // Daily web-push blast — runs after the email so today's headlines are
  // already generated/cached and the push can carry the personalized line.
  // Best-effort: a push failure never fails the email job.
  let push = { recipients: 0, sent: 0 };
  try {
    push = await sendDailyPushBlast({ sendDate });
  } catch (err) {
    console.warn("[cron] daily push blast failed:", (err as Error).message);
  }

  // Birthday gifts + emails — once-a-year per user (guarded inside), so the
  // 05:30 retry tick is safe. Best-effort: never fails the blast.
  let birthdays = { birthdays: 0, gifted: 0, emailed: 0, failed: 0 };
  try {
    birthdays = await sendBirthdayGifts();
  } catch (err) {
    console.warn("[cron] birthday gifts failed:", (err as Error).message);
  }

  // Winback nudges — users active before, quiet 7-14 days. Once per dormancy
  // spell (claim-row guard inside), so the retry tick is safe here too.
  let winback = { dormant: 0, emailed: 0, pushed: 0, skipped: 0, failed: 0 };
  try {
    winback = await sendWinbackNudges();
  } catch (err) {
    console.warn("[cron] winback nudges failed:", (err as Error).message);
  }

  // Anonymous "daily horoscope by email" leads (captured on the free natal
  // calculator) — send today's per-sign horoscope. Best-effort; never fails
  // the user blast.
  let leads = { audience: 0, sent: 0, skipped: 0, failed: 0 };
  try {
    leads = await sendDailyHoroscopeToLeads({ sendDate });
  } catch (err) {
    console.warn("[cron] lead horoscope send failed:", (err as Error).message);
  }

  // Lifecycle re-nudges — recover abandoned email verifications and prompt
  // birthdata-less accounts into the personalized daily audience. Low-volume,
  // capped (max 2 each), idempotent via email_send_log. Best-effort; never
  // fails the blast.
  const renudge = {
    verify: { candidates: 0, sent: 0 },
    profile: { candidates: 0, sent: 0 },
  };
  try {
    renudge.verify = await sendVerificationRenudges();
    renudge.profile = await sendProfileIncompleteRenudges();
  } catch (err) {
    console.warn("[cron] re-nudge failed:", (err as Error).message);
  }

  // Housekeeping: drop expired rate-limit counters. Best-effort, never
  // blocks or fails the blast (pruneRateLimits swallows its own errors).
  await pruneRateLimits();

  return NextResponse.json({ sendDate, concurrency, ...result, push, birthdays, winback, leads, renudge });
}

// Vercel Cron fires GET; manual reruns from admin can use POST.
export const GET = run;
export const POST = run;
