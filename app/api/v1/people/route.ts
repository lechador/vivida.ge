import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listPeople } from "@/lib/people";
import { SOCIAL_FEATURES } from "@/lib/social-flags";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  cursor: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
});

/**
 * GET /api/v1/people?cursor=<opaque>&q=<search>&limit=<n>
 *
 * One page of the public user directory, mirroring the website's /people
 * list. Shares listPeople() with the web Server Action so the row shape
 * (handle, display name, bio, avatar, friendship state) stays identical,
 * including its country-first ordering.
 *
 * `nextCursor` is an OPAQUE token — echo it back verbatim, never parse it.
 * It encodes the residence-country bucket alongside the `createdAt`
 * boundary, so its format is not a date and is free to change.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    if (!SOCIAL_FEATURES.peopleDirectory) {
      throw new ApiError(404, "feature_disabled", "People directory is not available");
    }

    const { searchParams } = new URL(req.url);
    const { cursor, q, limit } = Query.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const { rows, nextCursor } = await listPeople(user.id, {
      cursor,
      q,
      limit,
    });

    return ok({ people: rows, nextCursor });
  });
}
