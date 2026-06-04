import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listFeedPage } from "@/lib/feed-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/**
 * GET /api/v1/feed?cursor=<ISO>&limit=<n>
 *
 * One page of the global feed, newest first. Cursor is the `createdAt` of
 * the last post from the previous page (ISO string); omit it for the first
 * page. Shares listFeedPage() with the website's feed Server Action, so web
 * and mobile always render identical data.
 *
 * The response includes `nextCursor` (null when the page wasn't full) so the
 * client can drive infinite scroll without inspecting timestamps itself.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const { searchParams } = new URL(req.url);
    const { cursor, limit } = Query.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const pageSize = limit ?? 20;
    const posts = await listFeedPage({
      viewerId: user.id,
      cursor,
      limit: pageSize,
    });

    // A short page means we've reached the end — no further cursor.
    const nextCursor =
      posts.length === pageSize
        ? posts[posts.length - 1]!.createdAt.toISOString()
        : null;

    return ok({ posts, nextCursor });
  });
}
