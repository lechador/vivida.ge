import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

import { cronAuthed } from "@/lib/cron/auth";
import { checkEmailHealth } from "@/lib/email-health";
import {
  expireStaleDailyRows,
  sendDailyHoroscopeBlast,
  utcDateKey,
} from "@/lib/email-marketing";

/**
 * Daily-horoscope email blast.
 *
 * This used to also run push, birthday gifts, winback, lead horoscopes and the
 * verification/profile re-nudges. Because they were sequenced *after* the blast
 * in the same invocation, and the blast grew to consume the entire 300s
 * `maxDuration`, all of them silently stopped executing: winback and
 * verify_reminder last sent 2026-08-04, birthday 2026-08-07, profile_incomplete
 * 2026-08-18, each with zero sends for the following nine weeks.
 *
 * They now live in lib/cron/lifecycle.ts on their own schedule. The rule that
 * came out of that incident: a scheduled job must never depend on an unrelated
 * heavier job finishing first.
 */
export async function runDailyHoroscopeCron(
  req: NextRequest,
  retryOnly: boolean,
) {
  if (!cronAuthed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const concurrencyParam = url.searchParams.get("concurrency");
  const concurrency = concurrencyParam
    ? Math.max(1, Math.min(20, Number(concurrencyParam) || 8))
    : 8;

  const sendDate = utcDateKey();

  // Expire rows that missed their send window before draining. Without this the
  // table accumulates orphaned `pending` rows forever (28,449 of them by
  // 2026-10-16, dating back to 2026-08-09), and a late retry risks mailing a
  // stale horoscope.
  let expired = 0;
  try {
    expired = await expireStaleDailyRows({ today: sendDate });
  } catch (err) {
    // Never let housekeeping block the day's real send.
    console.warn(
      "[cron] stale daily row expiry failed:",
      (err as Error).message,
    );
  }

  const result = await sendDailyHoroscopeBlast({
    sendDate,
    concurrency,
    enqueue: !retryOnly,
  });

  // Surface silent degradation. This blast ran at 41% delivery for two months
  // without anyone noticing, because nothing was watching.
  const health = await checkEmailHealth({ today: sendDate });

  return NextResponse.json({
    sendDate,
    concurrency,
    retryOnly,
    expired,
    ...result,
    health,
  });
}
