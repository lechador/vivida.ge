import { z } from "zod";

import { requireMobileUserId } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { fail, ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { nextIqItem } from "@/lib/tests-mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  /** itemId → chosen option index, or -1 for a skip. */
  answers: z.record(z.string(), z.number().int()),
});

/**
 * POST /api/v1/tests/iq/next — serve the next adaptive IQ item.
 *
 * The website runs item selection in the browser because its bank (answer key
 * included) ships in the JS bundle. Mobile keeps the key server-side instead,
 * so the app posts what it has answered so far and the server re-derives
 * correctness, re-estimates ability and picks the most informative next item —
 * identical selection, one fewer secret on the wire. `item: null` means the
 * fixed administered length is complete and the app should submit.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(async () => {
    await requireMobileUserId(req);
    const { slug } = await ctx.params;
    if (slug !== "iq") {
      return fail(404, "not_found", "This test is not adaptive");
    }
    const { answers } = await parseBody(req, Body);
    return ok(nextIqItem(answers));
  });
}
