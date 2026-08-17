import { and, desc, eq, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, chartChatMessages } from "@/db/schema";
import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  spendCredits,
} from "@/lib/credits";
import { computeChartSalience } from "@/lib/report-salience";
import { buildChartChatSystem } from "@/lib/chart-chat";
import {
  isOpenRouterConfigured,
  streamChatCompletion,
  type ChatMessage,
} from "@/lib/openrouter";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getUserLocale } from "@/lib/i18n/user-locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HISTORY_LIMIT = 12;
const MAX_MESSAGE_LEN = 1000;

/**
 * "Chat with your chart" — streams an AI astrologer reply grounded in the
 * user's natal chart. Plain-text streaming body; both turns are persisted.
 * Daily per-user cap keeps AI cost bounded.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!isOpenRouterConfigured()) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    await enforceRateLimit({
      bucket: "chart_chat_user_day",
      identifier: userId,
      limit: 30,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { message?: unknown };
  const message =
    typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE_LEN) {
    return Response.json({ error: "invalid_message" }, { status: 400 });
  }

  const [chartRow] = await db
    .select({ data: charts.data })
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  if (!chartRow) return Response.json({ error: "no_chart" }, { status: 400 });

  const salience = computeChartSalience(chartRow.data);
  const locale = await getUserLocale(userId);
  const system = buildChartChatSystem(
    session.user?.name?.split(" ")[0] ?? null,
    chartRow.data,
    salience,
    locale,
  );

  // Recent history (oldest→newest) for conversational continuity.
  const history = (
    await db
      .select({ role: chartChatMessages.role, content: chartChatMessages.content })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, userId))
      .orderBy(desc(chartChatMessages.createdAt))
      .limit(HISTORY_LIMIT)
  ).reverse();

  // Credit gate: FREE_ALLOWANCE.chatPerDay free messages/day, then spend
  // CREDIT_COST.chat per message. 402 tells the client to open the credit
  // unlock screen (invite or buy). Kept last so a request rejected by any of
  // the checks above (503/429/400) is never charged — there is no refund path.
  const [used] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(chartChatMessages)
    .where(
      and(
        eq(chartChatMessages.userId, userId),
        eq(chartChatMessages.role, "user"),
        sql`${chartChatMessages.createdAt} >= date_trunc('day', now())`
      )
    );
  if ((used?.n ?? 0) >= FREE_ALLOWANCE.chatPerDay) {
    const paid = await spendCredits(userId, CREDIT_COST.chat, "spend_chat");
    if (!paid) {
      return Response.json(
        { error: "needs_credits", cost: CREDIT_COST.chat },
        { status: 402 }
      );
    }
  }

  // Persist the user's turn before we stream the answer.
  await db.insert(chartChatMessages).values({ userId, role: "user", content: message });

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        for await (const delta of streamChatCompletion(messages, { maxTokens: 900 })) {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        console.error("[ask] stream failed:", err);
        if (!full) {
          controller.enqueue(
            encoder.encode(
              locale !== "ka"
                ? "Sorry, I couldn't generate a response. Please try again."
                : "ბოდიში, პასუხის გენერაცია ვერ მოხერხდა. სცადე ხელახლა.",
            )
          );
        }
      } finally {
        if (full.trim()) {
          await db
            .insert(chartChatMessages)
            .values({ userId, role: "assistant", content: full })
            .catch((e) => console.error("[ask] persist failed:", e));
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
