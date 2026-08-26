/**
 * Remove comments authored by blocked users and replies whose parent became
 * hidden. Keeping the thread rule pure makes the privacy behavior easy to
 * regression-test without a database.
 */
export function filterBlockedCommentThreads<
  T extends { id: string; parentId: string | null; authorId: string },
>(rows: T[], blockedIds: Iterable<string>): T[] {
  const blocked = new Set(blockedIds);
  const visibleRoots = new Set(
    rows
      .filter((row) => row.parentId === null && !blocked.has(row.authorId))
      .map((row) => row.id),
  );

  return rows.filter((row) => {
    if (blocked.has(row.authorId)) return false;
    return row.parentId === null || visibleRoots.has(row.parentId);
  });
}
