import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function ensureUsername(
  userId: string,
  preferredName?: string | null,
): Promise<string> {
  const base = (preferredName ?? "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 16);
  const candidate = `${base || "user"}_${userId.replace(/-/g, "").slice(0, 6)}`;

  try {
    const [existing] = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (existing?.username) return existing.username;

    await db
      .insert(profiles)
      .values({
        userId,
        username: candidate,
        displayName: preferredName ?? null,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { username: candidate },
      });
  } catch {
    // Best-effort in preview/offline mode
  }

  return candidate;
}
