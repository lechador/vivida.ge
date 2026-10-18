import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { experimentAssignments, users } from "@/db/schema";
import { recordVisit, shouldRecordVisit } from "@/lib/activity";
import {
  isSignupCreditVariant,
  SIGNUP_CREDITS_EXPERIMENT,
} from "@/lib/signup-credit-experiment-config";

/**
 * Server-side helper for protected pages.
 * Returns the session user or redirects to "/" if not signed in. Also
 * verifies the session's userId still exists in the DB, a JWT cookie
 * can outlive its users row (admin deletes the account, Neon gets
 * reset), and any subsequent insert FK-violates against users.id. When
 * we detect a stale session we redirect to /api/auth/signout so the
 * cookie gets cleared properly (Server Components can't mutate cookies
 * directly, so calling signOut() here would throw).
 *
 * Side effect: schedules a deferred `recordVisit()` write for admin activity
 * reporting.
 */
export async function requireUser(loginDestination?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      loginDestination
        ? `/login?next=${encodeURIComponent(loginDestination)}`
        : "/",
    );
  }
  const userId = session.user.id;

  const [row] = await db
    .select({
      id: users.id,
      experimentVariant: experimentAssignments.variant,
      experimentAssignedAt: experimentAssignments.assignedAt,
      experimentCompletedAt: experimentAssignments.completedAt,
    })
    .from(users)
    .leftJoin(
      experimentAssignments,
      and(
        eq(experimentAssignments.userId, users.id),
        eq(experimentAssignments.experiment, SIGNUP_CREDITS_EXPERIMENT),
      ),
    )
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) {
    console.warn(
      "[requireUser] stale session, userId not in DB, redirecting to signout",
      { userId }
    );
    redirect("/api/auth/signout?callbackUrl=/");
  }

  const pendingSignupCredits =
    !row.experimentCompletedAt &&
    row.experimentAssignedAt &&
    row.experimentVariant &&
    isSignupCreditVariant(row.experimentVariant)
      ? {
          variant: row.experimentVariant,
          assignedAt: row.experimentAssignedAt,
        }
      : undefined;
  if (shouldRecordVisit(userId)) {
    after(() => recordVisit(userId, pendingSignupCredits));
  }
  return { ...session.user, id: userId };
}
