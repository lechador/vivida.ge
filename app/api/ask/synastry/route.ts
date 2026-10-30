import { auth } from "@/auth";
import { confirmSynastry } from "@/lib/ask-synastry";
import { db } from "@/db";
import { chartChatMessages } from "@/db/schema";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * POST /api/ask/synastry, the user tapped "confirm" on a synastry proposal
 * card in the AI chat. Charges exactly like the website unlock (same ledger
 * reason and price, PRO free, idempotent per partner), creates the partner,
 * stores the result as an assistant message and returns it for display.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "chart_chat_synastry_day",
      identifier: userId,
      limit: 15,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const date = typeof body.date === "string" ? body.date : "";
  const time =
    typeof body.time === "string" && TIME_RE.test(body.time) ? body.time : null;
  const cityName = typeof body.cityName === "string" ? body.cityName : "";
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const timezone = typeof body.timezone === "string" ? body.timezone : "";
  if (
    !name ||
    !DATE_RE.test(date) ||
    !cityName ||
    !timezone ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const locale = await getUserLocale(userId);
  const outcome = await confirmSynastry(
    userId,
    {
      name,
      dateOfBirth: date,
      timeOfBirth: time,
      cityName,
      latitude,
      longitude,
      timezone,
    },
    locale,
  );

  if (!outcome.ok) {
    const status =
      outcome.error === "needs_credits"
        ? 402
        : outcome.error === "no_chart" || outcome.error === "invalid"
          ? 400
          : 503;
    return Response.json(outcome, { status });
  }

  await db
    .insert(chartChatMessages)
    .values({ userId, role: "assistant", content: outcome.content })
    .catch((e) => console.error("[ask/synastry] persist failed:", e));

  return Response.json({ ok: true, content: outcome.content });
}
