import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

import { sendBirthdayGifts, type BirthdayResult } from "@/lib/birthday";
import { cronAuthed } from "@/lib/cron/auth";
import { SendBudget } from "@/lib/email-send-budget";
import { checkEmailHealth } from "@/lib/email-health";
import { utcDateKey } from "@/lib/email-marketing";
import { pruneGenerationLocks } from "@/lib/generation-lock";
import {
  sendDailyHoroscopeToLeads,
  type LeadBlastResult,
} from "@/lib/horoscope-leads";
import { sendDailyPushBlast } from "@/lib/push";
import { prunePwaInstallations } from "@/lib/pwa-installations";
import { pruneRateLimits } from "@/lib/rate-limit";
import {
  sendProfileIncompleteRenudges,
  sendVerificationRenudges,
} from "@/lib/renudge";
import {
  emptyWinbackResult,
  sendWinbackNudges,
  type WinbackResult,
} from "@/lib/winback";

/**
 * Daily lifecycle workload: push, birthday gifts, winback, lead horoscopes and
 * the verification/profile re-nudges.
 *
 * Deliberately a SEPARATE invocation from the daily horoscope email blast.
 *
 * These jobs used to run after `sendDailyHoroscopeBlast` inside the same
 * `/api/cron/daily-horoscope` request. That blast sends ~1,400 emails through a
 * serialized Resend throttle and consumes the entire 300s `maxDuration`. Once
 * the audience outgrew the window in August 2026, every job sequenced behind it
 * silently stopped running: winback and verify_reminder last sent 2026-08-04,
 * birthday 2026-08-07, profile_incomplete 2026-08-18, and each sent zero emails
 * for the following nine weeks.
 *
 * Isolation is the fix, not just speed. Each scheduled invocation gets its own
 * 300-second budget, so no single failing job can starve the others. Every job
 * below is additionally wrapped so one failure cannot abort the rest.
 */
export async function runLifecycleCron(req: NextRequest) {
  if (!cronAuthed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sendDate = utcDateKey();
  const startedAt = Date.now();
  /**
   * One shared send budget for every sequence in this invocation.
   *
   * These jobs used to drain their whole cohort. Restoring them would have meant
   * 861 sends on the first run — ~947s of serial 1.1s Resend calls against a 300s
   * `maxDuration`. The budget bounds each job (so none can starve the others, the
   * same failure this file exists to fix) and the run as a whole, leaving headroom
   * for the push blast, birthdays, leads and housekeeping that follow.
   */
  const budget = new SendBudget();

  let push: { recipients: number; sent: number } = { recipients: 0, sent: 0 };
  try {
    push = await sendDailyPushBlast({ sendDate });
  } catch (err) {
    console.warn(
      "[cron:lifecycle] daily push blast failed:",
      (err as Error).message,
    );
  }

  let birthdays: BirthdayResult = {
    birthdays: 0,
    gifted: 0,
    emailed: 0,
    failed: 0,
  };
  try {
    birthdays = await sendBirthdayGifts();
  } catch (err) {
    console.warn(
      "[cron:lifecycle] birthday gifts failed:",
      (err as Error).message,
    );
  }

  let winback: WinbackResult = emptyWinbackResult();
  try {
    winback = await sendWinbackNudges(budget);
  } catch (err) {
    console.warn(
      "[cron:lifecycle] winback sequence failed:",
      (err as Error).message,
    );
  }

  let leads: LeadBlastResult = { audience: 0, sent: 0, skipped: 0, failed: 0 };
  try {
    leads = await sendDailyHoroscopeToLeads({ sendDate });
  } catch (err) {
    console.warn(
      "[cron:lifecycle] lead horoscope send failed:",
      (err as Error).message,
    );
  }

  const renudge = {
    verify: { candidates: 0, sent: 0 },
    profile: { candidates: 0, sent: 0 },
  };
  try {
    renudge.verify = await sendVerificationRenudges(budget);
  } catch (err) {
    console.warn(
      "[cron:lifecycle] verification renudge failed:",
      (err as Error).message,
    );
  }
  try {
    renudge.profile = await sendProfileIncompleteRenudges(budget);
  } catch (err) {
    console.warn(
      "[cron:lifecycle] profile renudge failed:",
      (err as Error).message,
    );
  }

  await Promise.all([
    pruneRateLimits().catch(() => undefined),
    pruneGenerationLocks().catch(() => undefined),
    prunePwaInstallations().catch(() => undefined),
  ]);

  // These jobs sent zero emails for nine weeks without a single alert. Report
  // delivery health from the same invocation that runs them, so silence
  // becomes loud.
  const health = await checkEmailHealth({ today: sendDate });

  return NextResponse.json({
    sendDate,
    durationMs: Date.now() - startedAt,
    push,
    birthdays,
    winback,
    leads,
    renudge,
    // Surfaced so an operator can see the cap actually binding and that the
    // backlog is draining rather than silently stuck.
    sendBudgetRemaining: budget.left,
    health,
  });
}
