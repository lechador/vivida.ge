import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import {
  getEmailPreferences,
  updateEmailPreferencesCore,
} from "@/lib/account-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  daily: z.boolean(),
  marketing: z.boolean(),
  nudges: z.boolean(),
});

/**
 * GET /api/v1/me/email-preferences
 *
 * The user's current email opt-ins (daily horoscope, marketing, nudges).
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const preferences = await getEmailPreferences(user.id);
    return ok({ preferences });
  });
}

/**
 * PATCH /api/v1/me/email-preferences  { daily, marketing, nudges }
 *
 * Update the user's email opt-ins. Shares updateEmailPreferencesCore() with
 * the website's account settings.
 */
export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, Body);
    await updateEmailPreferencesCore(user.id, input);
    return ok({ ok: true });
  });
}
