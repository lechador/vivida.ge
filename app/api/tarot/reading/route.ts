import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { normalizeUserLocale } from "@/lib/i18n/locale";
import { enforceRateLimit } from "@/lib/rate-limit";
import { performReading } from "@/lib/tarot/reading";
import { tarotSpreadById } from "@/lib/tarot/spreads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/tarot/reading { question }, draw a 3-card spread and get an AI
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

  const body = (await req.json().catch(() => ({}))) as {
    question?: unknown;
    locale?: unknown;
    requestId?: unknown;
    spreadId?: unknown;
    optionA?: unknown;
    optionB?: unknown;
  };
  const question = typeof body.question === "string" ? body.question : "";
  const requestId =
    typeof body.requestId === "string" ? body.requestId : undefined;
  if (requestId !== undefined && !/^[A-Za-z0-9_-]{8,64}$/.test(requestId)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const spread =
    body.spreadId === undefined
      ? tarotSpreadById("situation")
      : tarotSpreadById(body.spreadId);
  if (!spread) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const optionA =
    typeof body.optionA === "string" ? body.optionA.trim().slice(0, 100) : "";
  const optionB =
    typeof body.optionB === "string" ? body.optionB.trim().slice(0, 100) : "";
  const spreadOptions =
    spread.id === "choice" && optionA && optionB
      ? { a: optionA, b: optionB }
      : undefined;

  // Daily cap on the AI call, matching the other LLM routes. Credits alone are
  // not a bound: spendCredits is a no-op for premium accounts.
  try {
    await enforceRateLimit({
      bucket: "tarot_reading_user_day",
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
  const result = await performReading(
    userId,
    question,
    locale,
    requestId,
    spread.id,
    spreadOptions,
  );
  if (!result.ok) {
    if (result.error === "insufficient") {
      return NextResponse.json(
        {
          error: "needs_credits",
          cost: result.cost,
          balance: result.balance,
          // Free teaser: drawn card art/positions, no interpretations.
          ...(result.preview ? { preview: result.preview } : {}),
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.reading, {
    headers: { "cache-control": "no-store" },
  });
}
