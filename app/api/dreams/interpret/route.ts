import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { CREDIT_COST, getBalance, spendCredits } from "@/lib/credits";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { normalizeUserLocale } from "@/lib/i18n/locale";
import {
  generateDreamInterpretation,
  isOpenRouterConfigured,
} from "@/lib/openrouter";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Minimum dream length — shorter text has nothing to interpret. */
const MIN_DREAM_LEN = 10;
/** Generous cap: long personal stories welcome, unbounded blobs rejected. */
const MAX_DREAM_LEN = 2000;

/**
 * POST /api/dreams/interpret { dream } — interpret a user-told dream with AI.
 * Auth-gated (the client asks for sign-in before the request is sent) and
 * every interpretation costs CREDIT_COST.dream credits, charged BEFORE the
 * AI call so a failed upstream never spends the user's balance. 402 when
 * the balance is short; the client shows the top-up/invite prompt.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isOpenRouterConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    await enforceRateLimit({
      bucket: "dream_interpret_user_day",
      identifier: userId,
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    dream?: unknown;
    locale?: unknown;
  };
  const dream = typeof body.dream === "string" ? body.dream.trim() : "";
  if (dream.length < MIN_DREAM_LEN || dream.length > MAX_DREAM_LEN) {
    return NextResponse.json({ error: "invalid_dream" }, { status: 400 });
  }

  const locale =
    body.locale === "en" || body.locale === "ka"
      ? normalizeUserLocale(body.locale)
      : await getRequestLocale();

  // Charge first: no refund path exists, so a request rejected below must
  // never reach this point. Premium users pass through for free.
  const paid = await spendCredits(userId, CREDIT_COST.dream, "spend_dream");
  if (!paid) {
    const balance = await getBalance(userId);
    return NextResponse.json(
      { error: "needs_credits", cost: CREDIT_COST.dream, balance },
      { status: 402 },
    );
  }

  try {
    const result = await generateDreamInterpretation({ dream, locale });
    if (!result) {
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
    const balance = await getBalance(userId);
    return NextResponse.json(
      { ...result, charged: CREDIT_COST.dream, balance },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error("[dreams] interpretation failed:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
