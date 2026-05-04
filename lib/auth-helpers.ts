import { redirect } from "next/navigation";

import { auth } from "@/auth";

/**
 * Server-side helper for protected pages.
 * Returns the session user or redirects to "/" if not signed in.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  return session.user;
}
