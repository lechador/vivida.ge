import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getDiscoveryFeed } from "@/lib/discover";
import { SOCIAL_FEATURES } from "@/lib/social-flags";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/discover
 *
 * The "people you may know" swipe deck — candidates the viewer hasn't
 * connected with, grouped by elemental compatibility (tribe / magic / other)
 * with a spotlight top match. Shares getDiscoveryFeed() with the website's
 * /discover so cards and compatibility scores stay identical.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    if (!SOCIAL_FEATURES.swipeDeck) {
      throw new ApiError(404, "feature_disabled", "Discover is not available");
    }
    const feed = await getDiscoveryFeed(user.id);
    return ok(feed);
  });
}
