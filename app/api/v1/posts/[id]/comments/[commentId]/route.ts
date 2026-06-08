import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { deleteCommentCore } from "@/lib/feed-write-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * DELETE /api/v1/posts/<id>/comments/<commentId>
 *
 * Delete a comment — comment author, post author, or admin. Shares
 * deleteCommentCore() with the website (same reputation revocation, cascades
 * to one level of replies).
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string; commentId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { commentId } = await ctx.params;

    const result = await deleteCommentCore(
      { id: user.id, email: user.email },
      commentId
    );
    if (!result.ok) {
      return fail(422, "comment_delete_rejected", result.error);
    }
    return ok({ ok: true });
  });
}
