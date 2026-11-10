import { type NextRequest } from "next/server";

import { runSignHoroscopeCron } from "@/lib/cron/sign-horoscopes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export function GET(req: NextRequest) {
  return runSignHoroscopeCron(req);
}

export const POST = GET;
