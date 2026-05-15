"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MoreVertical, Trash2 } from "lucide-react";

import { deletePost, type FeedPost } from "@/actions/feed";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CommentSection } from "./comment-section";
import { ReactionBar } from "./reaction-bar";
import { feedTimeAgo } from "./time-ago";

/**
 * One post card. Composed of byline (avatar + name + @handle + age),
 * body text, reaction bar, and an expandable comment section. The
 * three-dot menu is shown only when the viewer can delete (owner or
 * admin) — keeping the post chrome quiet for everyone else.
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
  const isOwner = post.author.id === viewerId;
  const canDelete = isOwner || viewerIsAdmin;

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

  const avatar = post.author.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.author.image}
      alt=""
      className="size-10 shrink-0 rounded-full border border-border/80 object-cover"
    />
  ) : (
    <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-sm text-muted-foreground">
      {initial}
    </div>
  );

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5"
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
            {post.author.username && (
              <Link
                href={`/u/${post.author.username}`}
                className="truncate text-xs text-muted-foreground hover:text-foreground"
              >
                @{post.author.username}
              </Link>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            {feedTimeAgo(post.createdAt)}
          </p>
        </div>
        {canDelete && (
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground/90">
        {post.body}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ReactionBar
          postId={post.id}
          initialCounts={post.reactions}
          initialMine={post.myReaction}
        />
        <CommentSection
          postId={post.id}
          initialCount={post.commentCount}
          viewerId={viewerId}
          viewerIsAdmin={viewerIsAdmin}
          postAuthorId={post.author.id}
        />
      </div>
    </article>
  );
}
