"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";

import {
  addComment,
  COMMENT_BODY_MAX,
  deleteComment,
  listComments,
  type FeedComment,
} from "@/actions/feed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { feedTimeAgo } from "./time-ago";

/**
 * Comments live behind a "X comments" button. Click expands, fetches
 * once (no SSR cost for posts the user doesn't open), and shows the
 * inline composer at the bottom.
 */
export function CommentSection({
  postId,
  initialCount,
  viewerId,
  viewerIsAdmin,
  postAuthorId,
}: {
  postId: string;
  initialCount: number;
  viewerId: string;
  /** Whether the viewer is in the admin allow-list. Hides the delete
   *  button from non-admins-non-owners-non-post-authors. */
  viewerIsAdmin: boolean;
  postAuthorId: string;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [comments, setComments] = useState<FeedComment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || comments !== null) return;
    setLoading(true);
    listComments(postId)
      .then((list) => {
        setComments(list);
        setCount(list.length);
      })
      .finally(() => setLoading(false));
  }, [open, comments, postId]);

  useEffect(() => {
    if (open) {
      // Focus the input when the panel expands so users can just start typing.
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    setError(null);
    startTransition(async () => {
      const res = await addComment(postId, trimmed);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setBody("");
      // Refetch comments to pick up the new row (and any concurrent
      // adds we may have missed).
      const fresh = await listComments(postId);
      setComments(fresh);
      setCount(fresh.length);
      router.refresh();
    });
  }

  function removeComment(commentId: string) {
    startTransition(async () => {
      const res = await deleteComment(commentId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setComments((prev) =>
        prev ? prev.filter((c) => c.id !== commentId) : prev
      );
      setCount((c) => Math.max(0, c - 1));
      router.refresh();
    });
  }

  const remaining = COMMENT_BODY_MAX - body.length;
  const overflow = remaining < 0;
  const submitDisabled = isPending || body.trim().length === 0 || overflow;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/30 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-foreground/20 hover:bg-card/60 hover:text-foreground",
          open && "text-foreground"
        )}
        aria-expanded={open}
      >
        <MessageCircle className="size-3.5" />
        {count > 0 ? `${count} კომენტარი` : "კომენტარი"}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {comments && comments.length > 0 && (
            <ul className="space-y-2.5">
              {comments.map((c) => {
                const canDelete =
                  c.author.id === viewerId ||
                  postAuthorId === viewerId ||
                  viewerIsAdmin;
                const display =
                  c.author.displayName ??
                  c.author.name?.split(" ")[0] ??
                  c.author.username ??
                  "ვარსკვლავო";
                const initial = display[0]?.toUpperCase() ?? "?";
                const profileHref = c.author.username
                  ? `/u/${c.author.username}`
                  : null;
                return (
                  <li
                    key={c.id}
                    className="flex gap-2.5 rounded-xl border border-border/40 bg-card/30 p-3"
                  >
                    {c.author.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.author.image}
                        alt=""
                        className="size-8 shrink-0 rounded-full border border-border/60 object-cover"
                      />
                    ) : (
                      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-xs text-muted-foreground">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        {profileHref ? (
                          <Link
                            href={profileHref}
                            className="truncate text-sm font-medium text-foreground hover:text-[var(--vivida-violet)]"
                          >
                            {display}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-medium text-foreground">
                            {display}
                          </span>
                        )}
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {feedTimeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground/85">
                        {c.body}
                      </p>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => removeComment(c.id)}
                        aria-label="წაშლა"
                        className="shrink-0 self-start text-muted-foreground/60 transition-colors hover:text-[var(--vivida-pink)]"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {comments && comments.length === 0 && !loading && (
            <p className="px-1 text-xs text-muted-foreground/80">
              ჯერ კომენტარი არ არის — დაიწყე საუბარი.
            </p>
          )}

          <div className="rounded-xl border border-border/60 bg-background/30 p-2.5">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              placeholder="დაწერე კომენტარი..."
              rows={2}
              maxLength={COMMENT_BODY_MAX + 20}
              className="block w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              disabled={isPending}
            />
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span
                className={`text-[10px] tabular-nums ${
                  overflow
                    ? "text-[var(--vivida-pink)]"
                    : "text-muted-foreground/70"
                }`}
              >
                {remaining}
              </span>
              <div className="flex items-center gap-2">
                {error && (
                  <span className="text-[11px] text-[var(--vivida-pink)]">
                    {error}
                  </span>
                )}
                <Button
                  onClick={submit}
                  disabled={submitDisabled}
                  variant="mystic"
                  size="sm"
                >
                  {isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                  დამატება
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
