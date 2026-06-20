import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { getPostForViewer } from "@/lib/feed-core";
import { deletePostCore, editPostCore } from "@/lib/feed-write-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const EditBody = z.object({
  body: z.string().min(1),
});

/**
 * GET /api/v1/posts/<id>
 *
 * One post in the same enriched shape as the feed (reactions, my reaction,
 * comment count, author byline). Shares getPostForViewer() with the feed.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    const post = await getPostForViewer(user.id, id);
    if (!post) {
      return fail(404, "post_not_found", "Post not found");
    }
    return ok({ post });
  });
}

/**
 * PATCH /api/v1/posts/<id>  { body }
 *
 * Edit a post within the 5-minute grace window (author only). Shares
 * editPostCore() with the website.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;
    const { body } = await parseBody(req, EditBody);

    const result = await editPostCore(user.id, id, body);
    if (!result.ok) {
      return fail(422, "post_rejected", result.error);
    }
    return ok({ ok: true });
  });
}

/**
 * DELETE /api/v1/posts/<id>
 *
 * Delete a post — author can delete their own, admins can delete any. Shares
 * deletePostCore() with the website (same reputation revocation).
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    const result = await deletePostCore({ id: user.id, email: user.email }, id);
    if (!result.ok) {
      return fail(422, "post_delete_rejected", result.error);
    }
    return ok({ ok: true });
  });
}
