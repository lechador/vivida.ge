import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  enabled: z.boolean().optional(),
  messages: z.boolean().optional(),
  horoscope: z.boolean().optional(),
  comments: z.boolean().optional(),
  reactions: z.boolean().optional(),
});

const selection = {
  enabled: users.pushEnabled,
  messages: users.pushMessages,
  horoscope: users.pushHoroscope,
  comments: users.pushComments,
  reactions: users.pushReactions,
};

/** Native mobile push preferences used by the Flutter settings screen. */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const [preferences] = await db
      .select(selection)
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    return ok({ preferences });
  });
}

/** Patch only the supplied switches; omitted categories keep their value. */
export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, Body);
    const updates = {
      pushEnabled: input.enabled,
      pushMessages: input.messages,
      pushHoroscope: input.horoscope,
      pushComments: input.comments,
      pushReactions: input.reactions,
    };
    const values = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );
    const [preferences] = Object.keys(values).length
      ? await db
          .update(users)
          .set(values)
          .where(eq(users.id, user.id))
          .returning(selection)
      : await db
          .select(selection)
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
    return ok({ preferences });
  });
}
