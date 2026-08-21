import { type NextRequest, NextResponse } from "next/server";

import { sendBirthdayGifts } from "@/lib/birthday";
import {
  sendDailyHoroscopeBlast,
  utcDateKey,
} from "@/lib/email-marketing";
import { pruneGenerationLocks } from "@/lib/generation-lock";
import { sendDailyHoroscopeToLeads } from "@/lib/horoscope-leads";
import { sendDailyPushBlast } from "@/lib/push";
import { pruneRateLimits } from "@/lib/rate-limit";
import {
  sendProfileIncompleteRenudges,
  sendVerificationRenudges,
} from "@/lib/renudge";
import { sendWinbackNudges } from "@/lib/winback";

function authed(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = process.env.ADMIN_API_TOKEN;

  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const adminHeader = req.headers.get("x-admin-token");
  if (adminToken && adminHeader === adminToken) return true;

  return false;
}

/**
 * Runs the daily marketing workload. The retry invocation drains only
 * pending/failed email rows; it does not repeat every other daily job.
 */
export async function runDailyHoroscopeCron(
  req: NextRequest,
  retryOnly: boolean,
) {
  if (!authed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const concurrencyParam = url.searchParams.get("concurrency");
  const concurrency = concurrencyParam
    ? Math.max(1, Math.min(20, Number(concurrencyParam) || 8))
    : 8;

  const sendDate = utcDateKey();
  const result = await sendDailyHoroscopeBlast({
    sendDate,
    concurrency,
    enqueue: !retryOnly,
  });

  if (retryOnly) {
    return NextResponse.json({
      sendDate,
      concurrency,
      retryOnly: true,
      ...result,
    });
  }

  let push = { recipients: 0, sent: 0 };
  try {
    push = await sendDailyPushBlast({ sendDate });
  } catch (err) {
    console.warn("[cron] daily push blast failed:", (err as Error).message);
  }

  let birthdays = { birthdays: 0, gifted: 0, emailed: 0, failed: 0 };
  try {
    birthdays = await sendBirthdayGifts();
  } catch (err) {
    console.warn("[cron] birthday gifts failed:", (err as Error).message);
  }

  let winback = { dormant: 0, emailed: 0, pushed: 0, skipped: 0, failed: 0 };
  try {
    winback = await sendWinbackNudges();
  } catch (err) {
    console.warn("[cron] winback nudges failed:", (err as Error).message);
  }

  let leads = { audience: 0, sent: 0, skipped: 0, failed: 0 };
  try {
    leads = await sendDailyHoroscopeToLeads({ sendDate });
  } catch (err) {
    console.warn("[cron] lead horoscope send failed:", (err as Error).message);
  }

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

  await Promise.all([pruneRateLimits(), pruneGenerationLocks()]);

  return NextResponse.json({
    sendDate,
    concurrency,
    ...result,
    push,
    birthdays,
    winback,
    leads,
    renudge,
  });
}
