import { after } from "next/server";
import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { CREDIT_REWARD, earnWeeklyFeedReward } from "@/lib/credits";
import { rewardWeekKey } from "@/lib/credit-economy";
import { createPostCore } from "@/lib/feed-write-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  body: z.string().min(1),
});

/**
 * POST /api/v1/posts  { body }
 *
 * Create a feed post. Shares createPostCore() with the website's createPost
 * Server Action — same character cap, per-user throttle, reputation award,
 * mention fan-out, and first-post-of-day credit reward. Returns the new post
 * id on success; a rejected write (empty, too long, throttled) comes back as
 * 422 with the Georgian message.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { body } = await parseBody(req, Body);

    const result = await createPostCore(user.id, body);
    if (!result.ok) {
      return fail(422, "post_rejected", result.error);
    }

    const userId = user.id;
    after(async () => {
      // Mirrors the web's one-per-week atomic reward.
      try {
        await earnWeeklyFeedReward(userId, CREDIT_REWARD.feedPost, rewardWeekKey());
      } catch (err) {
        console.warn(
          "[api/v1/posts] feed-post reward failed:",
          (err as Error).message
        );
      }
    });

    return ok({ postId: result.data?.postId ?? null }, 201);
  });
}
