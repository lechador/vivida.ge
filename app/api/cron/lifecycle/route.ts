import { type NextRequest } from "next/server";

import { runLifecycleCron } from "@/lib/cron/lifecycle";

/**
 * Daily lifecycle emails and push: winback, verification/profile re-nudges,
 * birthday gifts, lead horoscopes and the daily push blast.
 *
 * Schedule (vercel.json): 15 6 * * *, i.e. 10:15 Asia/Tbilisi, deliberately
 * well clear of the 05:00 daily horoscope blast.
 *
 * This was split out of /api/cron/daily-horoscope because those jobs used to
 * run after the email blast inside one invocation. The blast now fills the
 * whole 300s window, which silently starved every job behind it for nine weeks
 * (see lib/cron/lifecycle.ts).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export function GET(req: NextRequest) {
  return runLifecycleCron(req);
}

export const POST = GET;
