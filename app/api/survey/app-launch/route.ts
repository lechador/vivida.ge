import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserLocale } from "@/lib/i18n/user-locale";
import {
  ACTIVE_SURVEY_KEY,
  FEEDBACK_MAX,
  hasSeenSurvey,
  isSurveyChoice,
  recordSurveyResponse,
} from "@/lib/survey";

export const dynamic = "force-dynamic";

/**
 * GET — should this visitor see the one-shot survey popup?
 *
 * 204 for anonymous visitors and for anyone who already has a row (shown,
 * dismissed, or submitted), which is what makes it once-per-user for real
 * instead of once-per-browser. Mirrors /api/chat/bootstrap: the survey shell
 * asks after hydration so public/SEO pages stay statically prerendered.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new NextResponse(null, { status: 204 });

  if (await hasSeenSurvey(userId)) {
    return new NextResponse(null, { status: 204 });
  }

  const locale = await getUserLocale(userId);
  return NextResponse.json(
    { surveyKey: ACTIVE_SURVEY_KEY, locale },
    { headers: { "cache-control": "no-store" } }
  );
}

/**
 * POST — record an interaction: `shown` when the modal renders, then
 * `dismissed` or `submitted` when the user acts. Both answer fields are
 * optional, so an empty submit is just a dismissal with extra steps.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new NextResponse(null, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { action, choice, feedback } = (body ?? {}) as Record<string, unknown>;
  if (action !== "shown" && action !== "dismissed" && action !== "submitted") {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  await recordSurveyResponse({
    userId,
    action,
    choice: isSurveyChoice(choice) ? choice : null,
    feedback:
      typeof feedback === "string" ? feedback.slice(0, FEEDBACK_MAX) : null,
  });

  return NextResponse.json({ ok: true });
}
