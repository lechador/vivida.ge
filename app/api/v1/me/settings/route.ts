import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { updateAccountSettingsCore } from "@/lib/profile-core";
import { setTestVisibility, type TestKind } from "@/lib/test-results";
import { invalidateProfileForUser } from "@/lib/header-cache";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  discoverable: z.boolean().optional(),
  gender: z.enum(["male", "female"]).optional(),
  testVisibility: z
    .object({
      mbti: z.boolean().optional(),
      iq: z.boolean().optional(),
      eq: z.boolean().optional(),
      "big-five": z.boolean().optional(),
    })
    .optional(),
});

/**
 * PATCH /api/v1/me/settings
 *   { discoverable?, gender?, testVisibility?: { mbti?, iq?, eq?, "big-five"? } }
 *
 * Account/privacy settings the website exposes on /account: discovery opt-out,
 * self-reported gender, and per-test result visibility on the public profile.
 * Every field is optional; only provided ones are written. Shares
 * updateAccountSettingsCore + setTestVisibility with the web Server Actions.
 */
export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, Body);

    await updateAccountSettingsCore(user.id, {
      discoverable: input.discoverable,
      gender: input.gender,
    });

    if (input.testVisibility) {
      for (const [kind, visible] of Object.entries(input.testVisibility)) {
        if (typeof visible === "boolean") {
          await setTestVisibility(user.id, kind as TestKind, visible);
        }
      }
    }

    invalidateProfileForUser(user.id);
    return ok({ ok: true });
  });
}
