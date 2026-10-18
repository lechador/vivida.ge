import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export type UnsubscribeType = "daily" | "marketing" | "nudges" | "all";

export function isUnsubscribeType(val: string): val is UnsubscribeType {
  return (
    val === "daily" ||
    val === "marketing" ||
    val === "nudges" ||
    val === "all"
  );
}

export async function getOrCreateUnsubscribeToken(
  userId: string,
): Promise<string> {
  try {
    const [row] = await db
      .select({ token: users.unsubscribeToken })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (row?.token) return row.token;

    const token = crypto.randomBytes(24).toString("hex");
    await db
      .update(users)
      .set({ unsubscribeToken: token })
      .where(eq(users.id, userId));
    return token;
  } catch {
    return `unsub_${userId}`;
  }
}

export async function applyUnsubscribe(
  token: string,
  type: UnsubscribeType,
): Promise<{ email: string | null } | null> {
  if (!token) return null;
  try {
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.unsubscribeToken, token))
      .limit(1);
    if (!user) return null;

    const patch =
      type === "daily"
        ? { emailDailyHoroscope: false }
        : type === "marketing"
          ? { emailMarketing: false }
          : type === "nudges"
            ? { emailNudges: false }
            : {
                emailDailyHoroscope: false,
                emailMarketing: false,
                emailNudges: false,
              };

    await db.update(users).set(patch).where(eq(users.id, user.id));
    return { email: user.email };
  } catch {
    return null;
  }
}
