import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import {
  countUnreadNotifications,
  listRecentNotifications,
} from "@/lib/notifications";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/**
 * GET /api/v1/notifications?limit=<n>
 *
 * The user's recent notifications plus the unread count for the bell badge.
 * Shares listRecentNotifications / countUnreadNotifications with the website.
 * Each notification's JSONB payload carries the actor details, so no extra
 * lookups are needed to render the row.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const { searchParams } = new URL(req.url);
    const { limit } = Query.parse({ limit: searchParams.get("limit") ?? undefined });

    const [notifications, unreadCount] = await Promise.all([
      listRecentNotifications(user.id, limit ?? 15),
      countUnreadNotifications(user.id),
    ]);

    return ok({ notifications, unreadCount });
  });
}
