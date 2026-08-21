import { z } from "zod";

import { requireMobileUserId } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import {
  pollInboundMessages,
  pollReadReceipts,
  pollTypingIndicators,
} from "@/lib/messages";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  since: z.string().datetime({ offset: true }).optional(),
  with: z.string().min(1),
});

/**
 * GET /api/v1/messages/poll?with=<partnerId>&since=<ISO>
 *
 * The mobile equivalent of the website's SSE message stream. Returns
 * everything that happened since the client's last poll:
 *   - inbound messages (with sender info)
 *   - active typing indicators targeting the viewer
 *   - read receipts on the viewer's sent messages
 * plus `now` — pass it back as `since` on the next poll. Omit `since` on the
 * first poll to establish a baseline cursor without replaying history.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const userId = await requireMobileUserId(req);

    const { searchParams } = new URL(req.url);
    const { since, with: partnerId } = Query.parse({
      since: searchParams.get("since") ?? undefined,
      with: searchParams.get("with") ?? undefined,
    });

    const now = new Date();
    const sinceDate = since ? new Date(since) : now;

    const [messages, typing, receipts] = await Promise.all([
      pollInboundMessages(userId, sinceDate, partnerId),
      pollTypingIndicators(userId, partnerId),
      pollReadReceipts(userId, sinceDate, partnerId),
    ]);

    return ok({ messages, typing, receipts, now: now.toISOString() });
  });
}
