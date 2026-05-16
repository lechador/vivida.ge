import Link from "next/link";
import React from "react";

import { extractMentionTokens } from "@/lib/mentions";

/**
 * Renders post / comment bodies with `@username` segments turned into
 * clickable profile links. Whitespace and newlines are preserved via
 * `whitespace-pre-wrap` on the wrapping element (set by the parent).
 *
 * We do the matching at render time rather than persisting a parsed
 * tree — keeps the DB rows plain text, lets users edit and re-render
 * naturally, and lets us change link routing without a backfill.
 *
 * `validHandles` is an optional allow-list of usernames that should
 * actually become links — passed in when the caller has already
 * resolved who exists (e.g. inside `MentionsContext`). If omitted,
 * every shape-valid handle becomes a link (cheap UX win — even if a
 * user mistyped, the link will route to a 404 page).
 */
export function MentionText({
  body,
  validHandles,
}: {
  body: string;
  validHandles?: Set<string>;
}) {
  const handles = extractMentionTokens(body);
  if (handles.length === 0) return <>{body}</>;

  // Build a single regex with all known handles for one-pass replacement.
  // Sort longest-first so "@aliceblue" doesn't get partially matched as
  // "@alice" when both exist.
  const sorted = [...handles].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(^|[^a-zA-Z0-9_@])@(${sorted
      .map((h) => h.replace(/[-_]/g, "\\$&"))
      .join("|")})\\b`,
    "g"
  );

  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of body.matchAll(pattern)) {
    const idx = match.index ?? 0;
    const prefix = match[1] ?? "";
    const handle = match[2]?.toLowerCase();
    if (!handle) continue;
    if (validHandles && !validHandles.has(handle)) continue;
    // Push the text between the previous match and this one, plus the
    // non-@ prefix character (so "hi @bob" keeps the space).
    out.push(body.slice(lastIndex, idx) + prefix);
    out.push(
      <Link
        key={`m-${key++}`}
        href={`/u/${handle}`}
        className="font-medium text-[var(--vivida-violet)] hover:underline"
      >
        @{handle}
      </Link>
    );
    lastIndex = idx + match[0].length;
  }
  out.push(body.slice(lastIndex));
  return <>{out}</>;
}
