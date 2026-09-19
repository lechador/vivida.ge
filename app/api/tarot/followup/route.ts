import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { normalizeUserLocale } from "@/lib/i18n/locale";
import { enforceRateLimit } from "@/lib/rate-limit";
import { performFollowup } from "@/lib/tarot/followup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/tarot/followup { libraryId, question } — ask a follow-up about
 * an already-drawn spread. First follow-up per reading free, then
 * CREDIT_COST.tarotFollowup each (charged inside performFollowup). 402 when
 * the balance is short; 404 when the reading isn't the user's.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    libraryId?: unknown;
    question?: unknown;
    locale?: unknown;
  };
  const libraryId = typeof body.libraryId === "string" ? body.libraryId : "";
  const question = typeof body.question === "string" ? body.question : "";
  if (!libraryId || question.trim().length < 3) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await enforceRateLimit({
      bucket: "tarot_followup_user_day",
      identifier: userId,
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const locale =
    body.locale === "am" || body.locale === "en" || body.locale === "ka"
      ? normalizeUserLocale(body.locale)
      : await getRequestLocale();
  const result = await performFollowup(userId, libraryId, question, locale);
  if (!result.ok) {
    if (result.error === "insufficient") {
      return NextResponse.json(
        { error: "needs_credits", cost: result.cost, balance: result.balance },
        { status: 402 },
      );
    }
    if (result.error === "not_found") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.followup, {
    headers: { "cache-control": "no-store" },
  });
}
