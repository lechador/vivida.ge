import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { saveIqResult, sanitizeAnswers } from "@/lib/iq/store";

/**
 * POST /api/iq/submit, persist a finished IQ attempt (fire-and-forget from the
 * result page). Best-effort: if the table isn't migrated yet, or anything else
 * fails, we swallow it so the user's result page is never affected. Scoring is
 * redone server-side from the raw answers, so a tampered client body can't
 * inject a fake IQ.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    attemptId?: unknown;
    answers?: unknown;
    timeUsedSec?: unknown;
  } | null;

  const attemptId = typeof body?.attemptId === "string" ? body.attemptId : null;
  if (!attemptId || attemptId.length > 64) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const answers = sanitizeAnswers(body?.answers);
  const timeUsedSec =
    typeof body?.timeUsedSec === "number" && Number.isFinite(body.timeUsedSec)
      ? Math.max(0, Math.round(body.timeUsedSec))
      : null;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const { result, id } = await saveIqResult({ attemptId, answers, timeUsedSec, userId });
    // Only signed-in takers get the id (to route to the gated saved view);
    // the anonymous saved view is owner-gated and wouldn't be viewable anyway.
    return NextResponse.json({
      ok: true,
      iq: result.iq,
      percentile: result.percentile,
      id: userId ? id : null,
    });
  } catch {
    // Table may not exist yet, or a transient DB error, never surface to the UI.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
