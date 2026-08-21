import { type NextRequest } from "next/server";

import { runDailyHoroscopeCron } from "@/lib/cron/daily-horoscope";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export function GET(req: NextRequest) {
  return runDailyHoroscopeCron(req, true);
}

export const POST = GET;
