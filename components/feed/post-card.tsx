"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  deletePost,
  editPost,
  type FeedPost,
} from "@/actions/feed";
import { POST_BODY_MAX, POST_EDIT_WINDOW_MS } from "@/lib/feed-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CommentSection } from "./comment-section";
import { PostActions } from "./post-actions";
import { TierBadge } from "./tier-badge";
import { feedTimeAgo } from "./time-ago";

/**
 * Facebook-style post card.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────┐
 *   │ avatar  Name [tier]              ⋯ menu     │
 *   │         @handle · 17h                       │
 *   │                                             │
 *   │ post body…                                  │
 *   │                                             │
 *   │ ❤👍 10                          2 comments   │
 *   │ ─────────────────────────────────────────── │
 *   │   ლაიქი    │  კომენტარი  │  გაზიარება        │
 *   └─────────────────────────────────────────────┘
 *
 * Reactions still use the 4 custom icons; hovering "ლაიქი" pops up
 * the picker, single-tap toggles `like` directly. The comment section
 * is controlled by this card — the "კომენტარი" button in the action
 * bar opens/closes the same panel that the count link in the summary
 * row toggles. Edit (within 5 min) and delete (owner/admin) live in
 * the three-dot menu.
 */
export function PostCard({
  post,
  viewerId,
  viewerIsAdmin,
}: {
  post: FeedPost;
  viewerId: string;
  viewerIsAdmin: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body);
  const [editError, setEditError] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isOwner = post.author.id === viewerId;
  const canDelete = isOwner || viewerIsAdmin;
  const withinEditWindow =
    isOwner &&
    Date.now() - new Date(post.createdAt).getTime() < POST_EDIT_WINDOW_MS;

  const display =
    post.author.displayName ??
    post.author.name?.split(" ")[0] ??
    post.author.username ??
    "ვარსკვლავო";
  const initial = display[0]?.toUpperCase() ?? "?";
  const profileHref = post.author.username ? `/u/${post.author.username}` : null;

  function handleDelete() {
    if (!confirm("წავშალო ეს პოსტი?")) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function startEdit() {
    setDraft(post.body);
    setEditError(null);
    setEditing(true);
  }

  function saveEdit() {
    if (draft.trim() === post.body.trim()) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await editPost(post.id, draft);
      if (!res.ok) {
        setEditError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  const avatar = post.author.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.author.image}
      alt=""
      className="size-11 shrink-0 rounded-full border border-border/80 object-cover"
    />
  ) : (
    <div className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-sm text-muted-foreground">
      {initial}
    </div>
  );

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/75 sm:p-5"
    >
      <header className="flex items-start gap-3">
        {profileHref ? (
          <Link href={profileHref} aria-label={`${display}-ის პროფილი`}>
            {avatar}
          </Link>
        ) : (
          avatar
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {profileHref ? (
              <Link
                href={profileHref}
                className="truncate text-[15px] font-semibold text-foreground hover:text-[var(--vivida-violet)]"
              >
                {display}
              </Link>
            ) : (
              <span className="truncate text-[15px] font-semibold text-foreground">
                {display}
              </span>
            )}
            <TierBadge total={post.authorReputation} variant="byline" />
          </div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[11px] text-muted-foreground/85">
            {post.author.username && (
              <Link
                href={`/u/${post.author.username}`}
                className="truncate hover:text-foreground"
              >
                @{post.author.username}
              </Link>
            )}
            {post.author.username && <span>·</span>}
            <span>{feedTimeAgo(post.createdAt)}</span>
            {post.edited && (
              <>
                <span>·</span>
                <span className="italic">რედაქტირებული</span>
              </>
            )}
          </div>
        </div>
        {(canDelete || withinEditWindow) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="მენიუ"
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MoreVertical className="size-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {withinEditWindow && !editing && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    startEdit();
                  }}
                  className="cursor-pointer"
                >
                  <Pencil className="size-4" />
                  რედაქტირება
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isPending}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {isOwner ? "წაშლა" : "მოდერაცია: წაშლა"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {editing ? (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={POST_BODY_MAX + 50}
            className="block w-full resize-y rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-[15px] leading-relaxed text-foreground focus:border-[var(--vivida-violet)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--vivida-violet)]/40"
            disabled={isPending}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-xs tabular-nums",
                draft.length > POST_BODY_MAX
                  ? "text-[var(--vivida-pink)]"
                  : "text-muted-foreground/70"
              )}
            >
              {POST_BODY_MAX - draft.length}
            </span>
            <div className="flex items-center gap-2">
              {editError && (
                <span className="text-xs text-[var(--vivida-pink)]">
                  {editError}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={isPending}
              >
                გაუქმება
              </Button>
              <Button
                variant="mystic"
                size="sm"
                onClick={saveEdit}
                disabled={
                  isPending ||
                  draft.trim().length === 0 ||
                  draft.length > POST_BODY_MAX
                }
              >
                {isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : null}
                შენახვა
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground/95">
          {post.body}
        </p>
      )}

      <PostActions
        postId={post.id}
        initialCounts={post.reactions}
        initialMine={post.myReaction}
        commentCount={post.commentCount}
        onToggleComments={() => setCommentsOpen((o) => !o)}
      />

      <CommentSection
        postId={post.id}
        viewerId={viewerId}
        viewerIsAdmin={viewerIsAdmin}
        postAuthorId={post.author.id}
        open={commentsOpen}
      />
    </article>
  );
}
