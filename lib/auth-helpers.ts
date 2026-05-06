import { redirect } from "next/navigation";
import { after } from "next/server";

import { auth } from "@/auth";
import { recordVisit } from "@/lib/activity";

/**
 * Server-side helper for protected pages.
 * Returns the session user or redirects to "/" if not signed in.
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
  after(() => recordVisit(userId));
  return session.user;
}
