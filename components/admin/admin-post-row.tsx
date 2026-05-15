"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";

import { deletePost } from "@/actions/feed";
import { feedTimeAgo } from "@/components/feed/time-ago";

export type AdminPostRowData = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  authorEmail: string | null;
  authorName: string | null;
  authorUsername: string | null;
};

export function AdminPostRow({ post }: { post: AdminPostRowData }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onDelete() {
    if (!confirm(`წავშალო ეს პოსტი?\n\n"${post.body.slice(0, 80)}…"`)) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
            <span className="font-medium text-foreground">
              {post.authorName ?? "—"}
            </span>
            {post.authorUsername && (
              <Link
                href={`/u/${post.authorUsername}`}
                className="text-muted-foreground hover:text-foreground"
              >
                @{post.authorUsername}
              </Link>
            )}
            <span className="text-muted-foreground">
              · {post.authorEmail}
            </span>
            <span className="text-muted-foreground/70">
              · {feedTimeAgo(post.createdAt)}
            </span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-foreground/90">
            {post.body}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          aria-label="წაშლა"
          className="shrink-0 rounded-md border border-border/60 bg-card/40 p-1.5 text-muted-foreground transition-colors hover:border-[var(--vivida-pink)]/50 hover:text-[var(--vivida-pink)] disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>
    </li>
  );
}
