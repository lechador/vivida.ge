import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
} from "@/lib/friendship";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/friends
 *
 * Everything the website's /friends tabs render in one call: accepted
 * friends, incoming requests (sent to me), and outgoing requests (I sent).
 * Shares listFriends / listIncomingRequests / listOutgoingRequests with the
 * web page so the rows (avatar, username, since) stay identical. Friend
 * actions (request/accept/decline/cancel/remove) go through the existing
 * POST /api/v1/friends/<userId>.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const [friends, incoming, outgoing] = await Promise.all([
      listFriends(user.id),
      listIncomingRequests(user.id),
      listOutgoingRequests(user.id),
    ]);

    return ok({ friends, incoming, outgoing });
  });
}
