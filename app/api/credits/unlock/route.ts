import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { iqResults, mbtiTestResults, partners } from "@/db/schema";
import { CREDIT_COST, spendOnce, type CreditReason } from "@/lib/credits";

export const dynamic = "force-dynamic";

const KINDS = ["iq", "mbti", "synastry"] as const;
type Kind = (typeof KINDS)[number];

const REASON: Record<Kind, CreditReason> = {
  iq: "spend_iq",
  mbti: "spend_mbti",
  synastry: "spend_synastry",
};
const COST: Record<Kind, number> = {
  iq: CREDIT_COST.iqTest,
  mbti: CREDIT_COST.mbtiTest,
  synastry: CREDIT_COST.synastry,
};

/**
 * POST /api/credits/unlock { kind: "iq" | "mbti" | "synastry", resultId } — pay
 * once to unlock a deep result (test result or a partner's synastry). Verifies
 * the row belongs to the caller, then spends credits idempotently (re-unlocking
 * is free). 402 when short.
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
  const resultId = typeof body.resultId === "string" ? body.resultId : null;
  if (!kind || !resultId) {
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

  const reason = REASON[kind];
  const cost = COST[kind];
  const status = await spendOnce(userId, cost, reason, resultId);

  if (status === "insufficient") {
    return NextResponse.json({ status, cost }, { status: 402 });
  }
  return NextResponse.json({ status });
}
