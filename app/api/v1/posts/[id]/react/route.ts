import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { reactToPostCore } from "@/lib/feed-write-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  kind: z.enum(["like", "dislike", "funny", "sad"]),
});

/**
 * POST /api/v1/posts/<id>/react  { kind }
 *
 * Toggle the viewer's reaction on a post (none → set, same → clear, different
 * → switch). Shares reactToPostCore() with the web action. Returns the now-
 * active reaction kind (or null when toggled off) so the client can update
 * its optimistic state authoritatively.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;
    const { kind } = await parseBody(req, Body);

    const result = await reactToPostCore(user.id, id, kind);
    if (!result.ok) {
      return fail(422, "reaction_rejected", result.error);
    }
    return ok({ active: result.data?.active ?? null });
  });
}
