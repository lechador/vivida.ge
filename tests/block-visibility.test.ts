import { describe, expect, it } from "vitest";

import { filterBlockedCommentThreads } from "@/lib/block-visibility";

type Row = { id: string; parentId: string | null; authorId: string; body: string };

const rows: Row[] = [
  { id: "root-visible", parentId: null, authorId: "alice", body: "visible" },
  { id: "reply-blocked", parentId: "root-visible", authorId: "blocked", body: "hidden reply" },
  { id: "root-blocked", parentId: null, authorId: "blocked", body: "hidden root" },
  { id: "reply-orphan", parentId: "root-blocked", authorId: "carol", body: "hidden with thread" },
  { id: "reply-visible", parentId: "root-visible", authorId: "carol", body: "visible reply" },
];

describe("filterBlockedCommentThreads", () => {
  it("hides blocked comments and the replies attached to a hidden parent", () => {
    expect(filterBlockedCommentThreads(rows, ["blocked"]).map((row) => row.id)).toEqual([
      "root-visible",
      "reply-visible",
    ]);
  });

  it("preserves the complete thread when no author is blocked", () => {
    expect(filterBlockedCommentThreads(rows, []).map((row) => row.id)).toEqual(
      rows.map((row) => row.id),
    );
  });
});
