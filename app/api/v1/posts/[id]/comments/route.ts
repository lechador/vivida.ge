import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { addCommentCore, listCommentsCore } from "@/lib/feed-write-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/posts/<id>/comments
 *
 * The post's comments in tree-render order (top-level oldest-first, each
 * followed by its one level of replies). Shares listCommentsCore() with the
 * web action so the ordering and author resolution match.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const viewer = await requireMobileUser(req);
    const { id } = await ctx.params;
    const comments = await listCommentsCore(id, viewer.id);
    return ok({ comments });
  });
}

const Body = z.object({
  body: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

/**
 * POST /api/v1/posts/<id>/comments  { body, parentId? }
 *
 * Add a comment, or a reply when `parentId` is given (one level only).
 * Shares addCommentCore() with the web action — same validation, throttle,
 * notification, and reputation behaviour.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;
    const { body, parentId } = await parseBody(req, Body);

    const result = await addCommentCore(user.id, id, body, parentId ?? null);
    if (!result.ok) {
      return fail(422, "comment_rejected", result.error);
    }
    return ok({ commentId: result.data?.commentId ?? null }, 201);
  });
}
