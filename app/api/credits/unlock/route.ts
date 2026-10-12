import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  UNLOCK_COST,
  isUnlockKind,
  unlockForUser,
} from "@/lib/credits-unlock-core";

export const dynamic = "force-dynamic";

/**
 * POST /api/credits/unlock { kind, resultId }, pay once to unlock a deep
 * result. For "iq" | "eq" | "mbti" | "synastry", `resultId` identifies the row
 * and is verified to belong to the caller. "weekly" is a per-user lifetime
 * unlock (the 7-day forecast) keyed by a fixed ref, so no row lookup is
 * needed. Spends credits idempotently (re-unlocking is free). 402 when short.
 *
 * Charging lives in lib/credits-unlock-core, which enforces pricing and
 * ownership checks.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    kind?: unknown;
    resultId?: unknown;
  };
  if (!isUnlockKind(body.kind)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const kind = body.kind;

  const result = await unlockForUser(
    userId,
    kind,
    typeof body.resultId === "string" ? body.resultId : null,
  );

  if (!result.ok) {
    if (result.error === "insufficient") {
      return NextResponse.json(
        { status: "insufficient", cost: UNLOCK_COST[kind] },
        { status: 402 },
      );
    }
    const status = result.error === "not_found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ status: result.status });
}
