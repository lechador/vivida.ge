import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { performReading } from "@/lib/tarot/reading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/tarot/reading { question } — draw a 3-card spread and get an AI
 * reading. First reading free, then CREDIT_COST.tarot each (charged inside
 * performReading). 402 when the balance is short; the client shows the
 * top-up/invite prompt.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { question?: unknown };
  const question = typeof body.question === "string" ? body.question : "";

  const locale = await getRequestLocale();
  const result = await performReading(userId, question, locale);
  if (!result.ok) {
    if (result.error === "insufficient") {
      return NextResponse.json(
        { error: "needs_credits", cost: result.cost, balance: result.balance },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.reading, {
    headers: { "cache-control": "no-store" },
  });
}
