"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CornerDownRight,
  Loader2,
  Reply,
  Send,
  Trash2,
} from "lucide-react";

import {
  addComment,
  deleteComment,
  listComments,
  type FeedComment,
} from "@/actions/feed";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { COMMENT_BODY_MAX } from "@/lib/feed-config";
import { cn } from "@/lib/utils";

import { MentionInput } from "./mention-input";
import { MentionText } from "./mention-text";
import { feedTimeAgo } from "./time-ago";

/**
 * Comment thread + composer. Renders only when `open` is true so the
 * post card stays light; loading is lazy on first open. Controlled
 * by the parent so the action-bar's "კომენტარი" button can toggle
 * the same panel.
 *
 * Visual hierarchy:
 *   - Top-level comment row: avatar + byline + body inline
 *   - Replies sit underneath with a left rail and slight indent
 *   - "უპასუხე" button shown on top-level rows only (one-level cap)
 *   - Inline reply composer opens directly under the replied-to row
 */
export function CommentSection({
  postId,
  viewerId,
  viewerIsAdmin,
  postAuthorId,
  open,
}: {
  postId: string;
  viewerId: string;
  /** Whether the viewer is in the admin allow-list. */
  viewerIsAdmin: boolean;
  postAuthorId: string;
  /** Controlled open state — parent decides when the panel renders.
   *  Rendering returns null when `false`. */
  open: boolean;
}) {
  const [comments, setComments] = useState<FeedComment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const replyRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || comments !== null) return;
    setLoading(true);
    listComments(postId)
      .then((list) => {
        setComments(list);
      })
      .finally(() => setLoading(false));
  }, [open, comments, postId]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (replyParentId) {
      requestAnimationFrame(() => replyRef.current?.focus());
    }
  }, [replyParentId]);

  // Group children by parent id so we can render replies right under
  // their parent. Memoised so we don't recompute on every keystroke.
  const repliesByParent = useMemo(() => {
    const map = new Map<string, FeedComment[]>();
    if (!comments) return map;
    for (const c of comments) {
      if (c.parentId) {
        const list = map.get(c.parentId) ?? [];
        list.push(c);
        map.set(c.parentId, list);
      }
    }
    return map;
  }, [comments]);

  const topLevel = useMemo(
    () => (comments ?? []).filter((c) => !c.parentId),
    [comments]
  );

  function refreshComments() {
    return listComments(postId).then((list) => {
      setComments(list);
    });
  }

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
      await refreshComments();
      router.refresh();
    });
  }

  function submitReply() {
    const trimmed = replyBody.trim();
    if (!trimmed || !replyParentId || isPending) return;
    setError(null);
    startTransition(async () => {
      const res = await addComment(postId, trimmed, replyParentId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReplyBody("");
      setReplyParentId(null);
      await refreshComments();
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
      await refreshComments();
      router.refresh();
    });
  }

  const remaining = COMMENT_BODY_MAX - body.length;
  const overflow = remaining < 0;
  const submitDisabled = isPending || body.trim().length === 0 || overflow;

  if (!open) return null;

  return (
    <div className="w-full">
      <div className="mt-3 space-y-4">
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {topLevel.length > 0 && (
            <ul className="space-y-3">
              {topLevel.map((c) => {
                const replies = repliesByParent.get(c.id) ?? [];
                return (
                  <li key={c.id} className="space-y-2">
                    <CommentRow
                      comment={c}
                      viewerId={viewerId}
                      viewerIsAdmin={viewerIsAdmin}
                      postAuthorId={postAuthorId}
                      isReply={false}
                      isPending={isPending}
                      onDelete={removeComment}
                      onReply={() => {
                        setReplyParentId(c.id);
                        setReplyBody("");
                      }}
                    />

                    {(replies.length > 0 || replyParentId === c.id) && (
                      <div className="relative ml-5 space-y-2 border-l border-border/50 pl-4">
                        {replies.map((r) => (
                          <CommentRow
                            key={r.id}
                            comment={r}
                            viewerId={viewerId}
                            viewerIsAdmin={viewerIsAdmin}
                            postAuthorId={postAuthorId}
                            isReply
                            isPending={isPending}
                            onDelete={removeComment}
                          />
                        ))}

                        {replyParentId === c.id && (
                          <ReplyComposer
                            ref={replyRef}
                            value={replyBody}
                            onChange={setReplyBody}
                            onSubmit={submitReply}
                            onCancel={() => {
                              setReplyParentId(null);
                              setReplyBody("");
                            }}
                            isPending={isPending}
                            error={error}
                          />
                        )}
                      </div>
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

          {/* Top-level composer */}
          <div className="rounded-2xl border border-border/60 bg-background/40 p-2.5">
            <MentionInput
              textareaRef={textareaRef}
              value={body}
              onChange={setBody}
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
                className={cn(
                  "text-[10px] tabular-nums",
                  overflow
                    ? "text-[var(--vivida-pink)]"
                    : "text-muted-foreground/70"
                )}
              >
                {remaining}
              </span>
              <div className="flex items-center gap-2">
                {error && !replyParentId && (
                  <span className="text-[11px] text-[var(--vivida-pink)]">
                    {error}
                  </span>
                )}
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitDisabled}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-3 py-1.5 text-xs font-medium text-background shadow-[0_8px_20px_-8px_oklch(0.72_0.22_350/0.55)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                  დამატება
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

/** Single comment row — used for both top-level entries and their
 *  replies. Reply variant gets a tiny CornerDownRight glyph and a
 *  smaller avatar so the eye sees "this is nested" before reading. */
function CommentRow({
  comment,
  viewerId,
  viewerIsAdmin,
  postAuthorId,
  isReply,
  isPending,
  onDelete,
  onReply,
}: {
  comment: FeedComment;
  viewerId: string;
  viewerIsAdmin: boolean;
  postAuthorId: string;
  isReply: boolean;
  isPending: boolean;
  onDelete: (commentId: string) => void;
  onReply?: () => void;
}) {
  const canDelete =
    comment.author.id === viewerId ||
    postAuthorId === viewerId ||
    viewerIsAdmin;
  const display =
    comment.author.displayName ??
    comment.author.name?.split(" ")[0] ??
    comment.author.username ??
    "ვარსკვლავო";
  const profileHref = comment.author.username
    ? `/u/${comment.author.username}`
    : null;

  const avatarSize = isReply ? "size-7" : "size-8";

  return (
    <div className="group flex items-start gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={comment.author.image || DEFAULT_AVATAR}
        alt=""
        className={cn(
          "shrink-0 rounded-full border border-border/80 object-cover",
          avatarSize
        )}
      />

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "rounded-2xl bg-card/45 px-3 py-2 ring-1 ring-foreground/5",
            isReply && "bg-card/30"
          )}
        >
          <div className="flex items-baseline gap-2">
            {isReply && (
              <CornerDownRight
                className="size-3 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
            )}
            {profileHref ? (
              <Link
                href={profileHref}
                className="truncate text-[13px] font-medium text-foreground hover:text-[var(--vivida-violet)]"
              >
                {display}
              </Link>
            ) : (
              <span className="truncate text-[13px] font-medium text-foreground">
                {display}
              </span>
            )}
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {feedTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-foreground/90">
            <MentionText body={comment.body} />
          </p>
        </div>

        {/* Sub-actions row — reply + delete. Sits below the body
            bubble so the bubble itself stays compact. */}
        {(!isReply || canDelete) && (
          <div className="mt-1 flex items-center gap-3 pl-2 text-[11px] text-muted-foreground/80">
            {!isReply && onReply && (
              <button
                type="button"
                onClick={onReply}
                disabled={isPending}
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <Reply className="size-3" />
                უპასუხე
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={isPending}
                aria-label="წაშლა"
                className="inline-flex items-center gap-1 transition-colors hover:text-[var(--vivida-pink)]"
              >
                <Trash2 className="size-3" />
                წაშლა
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Inline reply composer rendered under the comment being replied to.
 *  Uses a forwarded ref so the parent can focus the textarea when the
 *  composer first opens. */
type ReplyComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  error: string | null;
};

function ReplyComposer({
  ref,
  value,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  error,
}: ReplyComposerProps & {
  ref: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const remaining = COMMENT_BODY_MAX - value.length;
  const overflow = remaining < 0;
  const disabled = isPending || value.trim().length === 0 || overflow;

  return (
    <div className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-background/50 p-2.5">
      <MentionInput
        textareaRef={ref}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="დაწერე პასუხი..."
        rows={2}
        maxLength={COMMENT_BODY_MAX + 20}
        className="block w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        disabled={isPending}
      />
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[10px] tabular-nums",
            overflow
              ? "text-[var(--vivida-pink)]"
              : "text-muted-foreground/70"
          )}
        >
          {remaining}
        </span>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[11px] text-[var(--vivida-pink)]">
              {error}
            </span>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-3 py-1.5 text-xs font-medium text-background shadow-[0_8px_20px_-8px_oklch(0.72_0.22_350/0.55)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Send className="size-3" />
            )}
            პასუხი
          </button>
        </div>
      </div>
    </div>
  );
}
