import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { askUserMemories } from "@/db/schema";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Transparency for ask long-term memory ("რა გახსოვს ჩემზე?").
 * GET returns the stored portrait; DELETE wipes it. Own data only.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "ask_memory_user_day",
      identifier: userId,
      limit: 120,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const [row] = await db
    .select({
      summary: askUserMemories.summary,
      traits: askUserMemories.traits,
      nudgesEnabled: askUserMemories.nudgesEnabled,
      updatedAt: askUserMemories.updatedAt,
    })
    .from(askUserMemories)
    .where(eq(askUserMemories.userId, userId))
    .limit(1);
  if (
    !row ||
    (!row.summary.trim() && Object.keys(row.traits ?? {}).length === 0)
  ) {
    return Response.json({ memory: null });
  }
  return Response.json({ memory: row });
}

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "ask_memory_user_day",
      identifier: userId,
      limit: 120,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  await db.delete(askUserMemories).where(eq(askUserMemories.userId, userId));
  return Response.json({ ok: true });
}

/** Opt-out toggle for proactive nudges — one tap, no confirmation needed. */
export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    nudgesEnabled?: unknown;
  };
  if (typeof body.nudgesEnabled !== "boolean") {
    return Response.json({ error: "invalid_nudges_enabled" }, { status: 400 });
  }

  await db
    .insert(askUserMemories)
    .values({
      userId,
      summary: "",
      traits: {},
      nudgesEnabled: body.nudgesEnabled,
    })
    .onConflictDoUpdate({
      target: askUserMemories.userId,
      set: { nudgesEnabled: body.nudgesEnabled, updatedAt: new Date() },
    });
  return Response.json({ ok: true, nudgesEnabled: body.nudgesEnabled });
}
