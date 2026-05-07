import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { recordVisit } from "@/lib/activity";

/**
 * Server-side helper for protected pages.
 * Returns the session user or redirects to "/" if not signed in. Also
 * verifies the session's userId still exists in the DB — a JWT cookie
 * can outlive the user row (admin deletes the account, Neon gets reset,
 * etc), and any subsequent insert FK-violates against `users.id`. When
 * we detect a stale session we force sign-out and redirect home so the
 * user gets a clean state instead of a wedged onboarding page.
 *
 * Side effect: schedules a deferred `recordVisit()` write so the admin
 * panel knows which days each user came back. The write happens after
 * the response streams, so it can't add any latency to the page.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  const userId = session.user.id;

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) {
    console.warn(
      "[requireUser] stale session — userId not in DB, signing out",
      { userId }
    );
    await signOut({ redirect: false });
    redirect("/");
  }

  after(() => recordVisit(userId));
  return session.user;
}
