import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { saveBigFiveResult, sanitizeBigFiveAnswers } from "@/lib/big-five/store";

/**
 * POST /api/big-five/submit — persist a finished Big Five attempt
 * (fire-and-forget from the result page). Best-effort: any failure is swallowed
 * so the result page is never affected. Scoring is redone server-side from the
 * raw answers, so a tampered client body can't inject a fake profile.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    attemptId?: unknown;
    answers?: unknown;
  } | null;

  const attemptId = typeof body?.attemptId === "string" ? body.attemptId : null;
  if (!attemptId || attemptId.length > 64) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const answers = sanitizeBigFiveAnswers(body?.answers);

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const { id } = await saveBigFiveResult({ attemptId, answers, userId });
    return NextResponse.json({ ok: true, id: userId ? id : null });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
