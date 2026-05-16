"use server";

import { requireUser } from "@/lib/auth-helpers";
import { listPeople, type PersonRow } from "@/lib/people";

/**
 * Server action used by the /people directory's "more" button. Same
 * shape as `listPeople` but wrapped so the client component can call
 * it directly without a fetch handler. Auth-gated like the rest of
 * the social surface.
 */
export async function fetchMorePeople(
  cursor: string | null,
  q: string | null
): Promise<{ rows: PersonRow[]; nextCursor: string | null }> {
  const viewer = await requireUser();
  return listPeople(viewer.id, {
    cursor: cursor ?? undefined,
    q: q ?? undefined,
  });
}
