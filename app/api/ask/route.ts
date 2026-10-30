import { and, desc, eq, sql } from "drizzle-orm";
import { after } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, chartChatMessages } from "@/db/schema";
import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  getBalance,
  spendCredits,
} from "@/lib/credits";
import { isPremiumUser } from "@/lib/premium";
import {
  DirectiveFilter,
  encodeMarker,
  parseDirective,
  stripMarkers,
  stripMarkersForModel,
} from "@/lib/ask-synastry-pure";
import { buildSynastryProposal } from "@/lib/ask-synastry";
import { computeChartSalience } from "@/lib/report-salience";
import { buildChartChatSystem } from "@/lib/chart-chat";
import {
  ASK_DEPTH_TOKENS,
  buildMemoryBlock,
  detectDistress,
  getAskMemory,
  inferVerbosity,
  normalizeAskDepth,
  refreshAskMemory,
} from "@/lib/ask-memory";
import {
  isOpenRouterConfigured,
  streamChatCompletion,
  type ChatMessage,
} from "@/lib/openrouter";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { archiveLibraryEntry } from "@/lib/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HISTORY_LIMIT = 12;
/** Generous cap: long personal stories welcome, unbounded blobs rejected. */
const MAX_MESSAGE_LEN = 4000;

/**
 * "Chat with your chart", streams an AI astrologer reply grounded in the
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

  const body = (await req.json().catch(() => ({}))) as {
    message?: unknown;
    depth?: unknown;
  };
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const depth = normalizeAskDepth(body.depth);
  const distress = detectDistress(message);
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
  // Long-term memory: rolling portrait (PK lookup, free). Never fails the request.
  const storedMemory = await getAskMemory(userId).catch(() => null);

  // Recent history (oldest→newest) for conversational continuity.
  const history = (
    await db
      .select({
        role: chartChatMessages.role,
        content: chartChatMessages.content,
      })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, userId))
      .orderBy(desc(chartChatMessages.createdAt))
      .limit(HISTORY_LIMIT)
  ).reverse();

  // Credit gate: FREE_ALLOWANCE.chatPerDay free messages/day, then spend
  // CREDIT_COST.chat per message. 402 tells the client to open the credit
  // unlock screen (invite or buy). Kept last so a request rejected by any of
  // the checks above (503/429/400) is never charged, there is no refund path.
  const [used] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(chartChatMessages)
    .where(
      and(
        eq(chartChatMessages.userId, userId),
        eq(chartChatMessages.role, "user"),
        sql`${chartChatMessages.createdAt} >= date_trunc('day', now())`,
      ),
    );
  if ((used?.n ?? 0) >= FREE_ALLOWANCE.chatPerDay) {
    const paid = await spendCredits(userId, CREDIT_COST.chat, "spend_chat");
    if (!paid) {
      return Response.json(
        { error: "needs_credits", cost: CREDIT_COST.chat },
        { status: 402 },
      );
    }
  }

  // Persist the user's turn before we stream the answer.
  await db
    .insert(chartChatMessages)
    .values({ userId, role: "user", content: message });

  // System prompt: chart grounding + long-term memory + style mirroring.
  // Stored portrait wins; for newcomers (no portrait yet) infer verbosity
  // deterministically from their own turns so adaptation is instant.
  const recentUserMessages = [
    ...history.filter((m) => m.role !== "assistant").map((m) => m.content),
    message,
  ];
  let memoryBlock = buildMemoryBlock(storedMemory, locale);
  if (!memoryBlock) {
    if (recentUserMessages.length >= 2) {
      const v = inferVerbosity(recentUserMessages);
      memoryBlock =
        locale === "en"
          ? `The person writes ${v === "short" ? "short, simple" : v === "detailed" ? "long, elaborate" : "medium-length"} messages, match that length and simplicity.`
          : `ადამიანი წერს ${v === "short" ? "მოკლე, მარტივ" : v === "detailed" ? "გრძელ, გაშლილ" : "საშუალო სიგრძის"} შეტყობინებებს, პასუხის სიგრძე და სიმარტივე ამას შეუსაბამე.`;
    }
  }
  // Premium flag + balance let the astrologer state cost/affordability
  // truthfully when the user asks about compatibility or top-ups.
  const [premium, balance] = await Promise.all([
    isPremiumUser(userId).catch(() => false),
    getBalance(userId).catch(() => 0),
  ]);
  const system = buildChartChatSystem(
    session.user?.name?.split(" ")[0] ?? null,
    chartRow.data,
    salience,
    locale,
    memoryBlock,
    { depth, distress, recentUserMessages, account: { premium, balance } },
  );

  // Refresh the rolling portrait in the background (cheap merge, throttled
  // inside to ≤1 call per 5 turns). Runs after the response; never blocks it.
  try {
    after(() => {
      void refreshAskMemory(userId, locale);
    });
  } catch {
    /* after() unavailable outside request scope in some runtimes, skip */
  }

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: stripMarkersForModel(m.content),
    })),
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // `full` is what the user saw and what is persisted; the synastry
      // directive is hidden from the stream and replaced by a proposal card.
      let full = "";
      const filter = new DirectiveFilter();
      try {
        for await (const delta of streamChatCompletion(messages, {
          maxTokens: ASK_DEPTH_TOKENS[depth],
        })) {
          const visible = filter.push(delta);
          if (visible) {
            full += visible;
            controller.enqueue(encoder.encode(visible));
          }
        }
        const tail = filter.end();
        if (tail.text) {
          full += tail.text;
          controller.enqueue(encoder.encode(tail.text));
        }
        const directive = tail.directive
          ? parseDirective(tail.directive)
          : null;
        if (directive) {
          const proposal = await buildSynastryProposal(userId, directive).catch(
            (e) => {
              console.warn("[ask] synastry proposal failed:", e);
              return null;
            },
          );
          const card = proposal
            ? encodeMarker("synastry-proposal", proposal)
            : locale !== "ka"
              ? '\n\nI could not find that birth city. Tell me the city again (for example "Tbilisi") and I will set it up.'
              : "\n\nამ დაბადების ადგილს ვერ მივაგენი. მითხარი ქალაქი თავიდან (მაგ. „თბილისი“) და მოვამზადებ.";
          full = full.trimEnd() + card;
          controller.enqueue(encoder.encode(card));
        }
      } catch (err) {
        console.error("[ask] stream failed:", err);
        if (!full) {
          controller.enqueue(
            encoder.encode(
              locale !== "ka"
                ? "Sorry, I couldn't generate a response. Please try again."
                : "ბოდიში, პასუხის გენერაცია ვერ მოხერხდა. სცადე ხელახლა.",
            ),
          );
        }
      } finally {
        if (full.trim()) {
          const assistantMessages = await db
            .insert(chartChatMessages)
            .values({ userId, role: "assistant", content: full })
            .returning({
              id: chartChatMessages.id,
              createdAt: chartChatMessages.createdAt,
            })
            .catch((e) => {
              console.error("[ask] persist failed:", e);
              return [];
            });
          const assistantMessage = assistantMessages[0];
          if (assistantMessage) {
            await archiveLibraryEntry({
              userId,
              kind: "ai",
              sourceId: assistantMessage.id,
              title: message.slice(0, 160),
              summary: stripMarkers(full).slice(0, 240),
              content: {
                type: "ai",
                question: message,
                answer: stripMarkers(full),
              },
              href: "/ask",
              language: locale,
              occurredAt: assistantMessage.createdAt,
            }).catch((error) =>
              console.warn("[library] AI archive failed:", error),
            );
          }
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
