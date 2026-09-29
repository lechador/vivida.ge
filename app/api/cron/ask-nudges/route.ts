import { NextRequest, NextResponse } from "next/server";

import { deliverAskNudges } from "@/lib/ask-nudges";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authed(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`)
    return true;
  if (adminToken && req.headers.get("x-admin-token") === adminToken)
    return true;
  return false;
}

async function run(req: NextRequest) {
  if (!authed(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await deliverAskNudges());
}

export const GET = run;
export const POST = run;
