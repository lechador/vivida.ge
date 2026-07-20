import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bigFiveResults, eqResults, iqResults, mbtiTestResults, partners } from "@/db/schema";
import { CREDIT_COST, spendOnce, type CreditReason } from "@/lib/credits";

export const dynamic = "force-dynamic";

const KINDS = ["iq", "eq", "big-five", "mbti", "synastry", "weekly"] as const;
type Kind = (typeof KINDS)[number];

const REASON: Record<Kind, CreditReason> = {
  iq: "spend_iq",
  eq: "spend_eq",
  "big-five": "spend_bigfive",
  mbti: "spend_mbti",
  synastry: "spend_synastry",
  weekly: "spend_weekly",
};
const COST: Record<Kind, number> = {
  iq: CREDIT_COST.iqTest,
  eq: CREDIT_COST.eqTest,
  "big-five": CREDIT_COST.bigFiveTest,
  mbti: CREDIT_COST.mbtiTest,
  synastry: CREDIT_COST.synastry,
  weekly: CREDIT_COST.weeklyForecast,
};

/**
 * POST /api/credits/unlock { kind, resultId } — pay once to unlock a deep
 * result. For "iq" | "eq" | "mbti" | "synastry", `resultId` identifies the row and is
 * verified to belong to the caller. "weekly" is a per-user lifetime unlock
 * (the 7-day forecast) keyed by a fixed ref, so no row lookup is needed.
 * Spends credits idempotently (re-unlocking is free). 402 when short.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    kind?: unknown;
    resultId?: unknown;
  };
  const kind = KINDS.includes(body.kind as Kind) ? (body.kind as Kind) : null;
  if (!kind) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // "weekly" is a per-user lifetime unlock keyed by a fixed ref — no row to
  // own or verify. The others need a resultId that belongs to the caller.
  let ref: string;
  if (kind === "weekly") {
    ref = "weekly";
  } else {
    const resultId = typeof body.resultId === "string" ? body.resultId : null;
    if (!resultId) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    // Ownership check — never let someone unlock (or probe) another's row.
    const owns =
      kind === "iq"
        ? await db
            .select({ id: iqResults.id })
            .from(iqResults)
            .where(and(eq(iqResults.id, resultId), eq(iqResults.userId, userId)))
            .limit(1)
        : kind === "eq"
          ? await db
              .select({ id: eqResults.id })
              .from(eqResults)
              .where(and(eq(eqResults.id, resultId), eq(eqResults.userId, userId)))
              .limit(1)
          : kind === "big-five"
            ? await db
                .select({ id: bigFiveResults.id })
                .from(bigFiveResults)
                .where(
                  and(eq(bigFiveResults.id, resultId), eq(bigFiveResults.userId, userId))
                )
                .limit(1)
            : kind === "mbti"
              ? await db
                  .select({ id: mbtiTestResults.id })
                  .from(mbtiTestResults)
                  .where(
                    and(eq(mbtiTestResults.id, resultId), eq(mbtiTestResults.userId, userId))
                  )
                  .limit(1)
              : await db
                  .select({ id: partners.id })
                  .from(partners)
                  .where(and(eq(partners.id, resultId), eq(partners.userId, userId)))
                  .limit(1);
    if (!owns.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
    ref = resultId;
  }

  const reason = REASON[kind];
  const cost = COST[kind];
  const status = await spendOnce(userId, cost, reason, ref);

  if (status === "insufficient") {
    return NextResponse.json({ status, cost }, { status: 402 });
  }
  return NextResponse.json({ status });
}
