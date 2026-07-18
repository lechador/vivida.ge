import { after } from "next/server";
import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { sendMessageEmail } from "@/lib/email";
import { sendMessagePush } from "@/lib/notification-push";
import { listMessages, partnerSnippet } from "@/lib/messages";
import { sendMessageCore } from "@/lib/messages-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  since: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const Body = z.object({
  body: z.string().min(1),
});

/**
 * GET /api/v1/messages/<userId>?since=<ISO>&limit=<n>
 *
 * The thread between the viewer and one partner, oldest-first. Optional
 * `since` returns only newer messages (incremental fetch). Includes a
 * partner snippet so the chat header can render without a second call.
 * Shares listMessages() with the website.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { userId } = await ctx.params;

    const { searchParams } = new URL(req.url);
    const { since, limit } = Query.parse({
      since: searchParams.get("since") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const [messages, partner] = await Promise.all([
      listMessages(user.id, userId, {
        limit,
        since: since ? new Date(since) : undefined,
      }),
      partnerSnippet(userId),
    ]);

    return ok({ messages, partner });
  });
}

/**
 * POST /api/v1/messages/<userId>  { body }
 *
 * Send a message to a friend. Shares sendMessageCore() with the website —
 * same mutual-friends gating and length cap — and fires the same
 * fire-and-forget notification email.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { userId } = await ctx.params;
    const { body } = await parseBody(req, Body);

    const result = await sendMessageCore(user.id, userId, body);
    if (!result.ok) {
      return fail(422, "message_rejected", result.error);
    }

    const trimmed = result.message.body;
    after(async () => {
      try {
        await sendMessageEmail({
          recipientUserId: userId,
          fromUserId: user.id,
          fromName: user.name ?? "Vivida-ის წევრი",
          body: trimmed,
        });
      } catch (err) {
        console.warn(
          "[api/v1/messages] message email after-hook failed:",
          (err as Error).message
        );
      }
      try {
        await sendMessagePush({
          recipientUserId: userId,
          fromUserId: user.id,
          fromName: user.name ?? "Vivida-ის წევრი",
          body: trimmed,
        });
      } catch (err) {
        console.warn(
          "[api/v1/messages] message push after-hook failed:",
          (err as Error).message
        );
      }
    });

    return ok({ message: result.message }, 201);
  });
}
