import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { saveEqResult, sanitizeEqAnswers } from "@/lib/eq/store";

/**
 * POST /api/eq/submit — persist a finished EQ attempt (fire-and-forget from the
 * result page). Best-effort: any failure is swallowed so the result page is
 * never affected. Scoring is redone server-side from the raw answers, so a
 * tampered client body can't inject a fake score.
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
  const answers = sanitizeEqAnswers(body?.answers);

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const { result, id } = await saveEqResult({ attemptId, answers, userId });
    // Only signed-in takers get the id (to route to the gated saved view).
    return NextResponse.json({
      ok: true,
      overall: result.overall,
      band: result.band,
      id: userId ? id : null,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
