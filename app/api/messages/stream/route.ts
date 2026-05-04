import { auth } from "@/auth";
import {
  pollInboundMessages,
  pollReadReceipts,
  pollTypingIndicators,
} from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 2000;
const KEEPALIVE_MS = 15000;
// Auto-recycle so EventSource reconnects (avoids platform stream caps and
// keeps the connection from quietly dying on idle proxies).
const MAX_LIFETIME_MS = 23000;
// Lookback so a brief reconnect doesn't lose messages. Client dedups by id.
const RECONNECT_LOOKBACK_MS = 30000;
// Cap repeat-warning spam: only log first failure + every Nth after.
const FAIL_LOG_EVERY = 10;

function shortError(err: unknown): string {
  if (err instanceof Error) {
    // Neon connection blips are noisy; collapse to one line.
    if (err.message.includes("fetch failed")) {
      return "neon: fetch failed (transient)";
    }
    return err.message;
  }
  return String(err);
}

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastSeen = new Date(Date.now() - RECONNECT_LOOKBACK_MS);
  let lastReadCheck = new Date(Date.now() - RECONNECT_LOOKBACK_MS);
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  let lifetimeTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let consecutiveFailures = 0;

  const stream = new ReadableStream({
    start(controller) {
      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (pollTimer) clearInterval(pollTimer);
        if (keepaliveTimer) clearInterval(keepaliveTimer);
        if (lifetimeTimer) clearTimeout(lifetimeTimer);
        try {
          controller.close();
        } catch {}
      };

      const tryEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const emit = (
        event: "message" | "typing" | "read" | "open",
        data: unknown,
        id?: string
      ) => {
        const idLine = id ? `id: ${id}\n` : "";
        tryEnqueue(
          `${idLine}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        );
      };

      emit("open", { ts: Date.now() });

      pollTimer = setInterval(async () => {
        if (closed) return;
        const tickStart = new Date();
        // Run all three polls in parallel for snappier updates.
        const [messagesRes, typingRes, readRes] = await Promise.allSettled([
          pollInboundMessages(userId, lastSeen),
          pollTypingIndicators(userId),
          pollReadReceipts(userId, lastReadCheck),
        ]);

        const anyFailed =
          messagesRes.status === "rejected" ||
          typingRes.status === "rejected" ||
          readRes.status === "rejected";
        if (anyFailed) {
          consecutiveFailures += 1;
          if (
            consecutiveFailures === 1 ||
            consecutiveFailures % FAIL_LOG_EVERY === 0
          ) {
            const reason =
              messagesRes.status === "rejected"
                ? messagesRes.reason
                : typingRes.status === "rejected"
                  ? typingRes.reason
                  : (readRes as PromiseRejectedResult).reason;
            console.warn(
              `[messages/stream] poll failed (x${consecutiveFailures}): ${shortError(reason)}`
            );
          }
        } else if (consecutiveFailures > 0) {
          consecutiveFailures = 0;
        }

        if (messagesRes.status === "fulfilled") {
          const fresh = messagesRes.value;
          for (const m of fresh) {
            emit(
              "message",
              {
                id: m.id,
                senderId: m.senderId,
                recipientId: m.recipientId,
                body: m.body,
                createdAt: m.createdAt.toISOString(),
                readAt: m.readAt ? m.readAt.toISOString() : null,
                sender: {
                  name: m.senderName,
                  image: m.senderImage,
                  username: m.senderUsername,
                  displayName: m.senderDisplayName,
                },
              },
              m.id
            );
          }
          if (fresh.length > 0) {
            lastSeen = fresh[fresh.length - 1].createdAt;
          }
        }

        if (typingRes.status === "fulfilled" && typingRes.value.length > 0) {
          emit("typing", {
            senders: typingRes.value.map((t) => ({
              senderId: t.senderId,
              expiresAt: t.expiresAt.toISOString(),
            })),
          });
        }

        if (readRes.status === "fulfilled" && readRes.value.length > 0) {
          for (const r of readRes.value) {
            emit("read", {
              partnerId: r.partnerId,
              readAt: r.readAt.toISOString(),
            });
          }
          // Advance check pointer to avoid reemitting the same receipt.
          lastReadCheck = tickStart;
        }
      }, POLL_MS);

      keepaliveTimer = setInterval(() => {
        tryEnqueue(": ka\n\n");
      }, KEEPALIVE_MS);

      lifetimeTimer = setTimeout(cleanup, MAX_LIFETIME_MS);

      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      closed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (keepaliveTimer) clearInterval(keepaliveTimer);
      if (lifetimeTimer) clearTimeout(lifetimeTimer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
