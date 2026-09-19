import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { fail, ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { enforceRateLimit } from "@/lib/rate-limit";
import { performReading } from "@/lib/tarot/reading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  question: z.string().trim().min(3).max(300),
  locale: z.enum(["ka", "en"]).default("ka"),
});

/**
 * Bearer-token twin of the website tarot endpoint. Web and mobile deliberately
 * share performReading(), so both use the same free allowance, credits,
 * resilient AI fallback, and library archive.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { question, locale } = await parseBody(req, Body);

    try {
      await enforceRateLimit({
        bucket: "tarot_reading_user_day",
        identifier: user.id,
        limit: 20,
        windowMs: 24 * 60 * 60 * 1000,
      });
    } catch {
      return fail(429, "rate_limited", "Daily tarot limit reached");
    }

    const result = await performReading(user.id, question, locale);
    if (!result.ok) {
      if (result.error === "insufficient") {
        return fail(402, "insufficient_credits", "Not enough credits");
      }
      return fail(422, "validation_error", "Question is too short");
    }

    return ok(result.reading);
  });
}
