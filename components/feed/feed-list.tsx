"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { listFeed, type FeedPost } from "@/actions/feed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PostCard } from "./post-card";

const PAGE_SIZE = 20;

/**
 * Client-side wrapper around the feed list. Receives the first page from
 * the server, then "load more" pages via the `listFeed` server action
 * with a createdAt cursor. Sign filter is JS-side — the data is already
 * fetched and the visible set is small, so an O(n) filter is fine.
 */
export function FeedList({
  initial,
  viewerId,
  viewerIsAdmin,
  viewerSunSign,
  disablePagination = false,
}: {
  initial: FeedPost[];
  viewerId: string;
  viewerIsAdmin: boolean;
  /** Null when the viewer hasn't entered a birth date. The "ჩემი ნიშნით"
   *  filter is disabled in that case. */
  viewerSunSign: number | null;
  /** When true, hide the sign filter chips and the "load more" button.
   *  Used on the profile page where we render a fixed-size "recent posts"
   *  preview rather than the full paginated feed. */
  disablePagination?: boolean;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initial);
  const [hasMore, setHasMore] = useState(
    !disablePagination && initial.length >= PAGE_SIZE
  );
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "sign">("all");

  // Keep state in sync if the server passes a fresh `initial` after a
  // router.refresh() (e.g., after createPost). Without this, the local
  // list silently lags the server state.
  useEffect(() => {
    setPosts(initial);
    setHasMore(!disablePagination && initial.length >= PAGE_SIZE);
  }, [initial, disablePagination]);

  const visible = useMemo(() => {
    if (filter === "all" || viewerSunSign === null) return posts;
    return posts.filter((p) => p.authorSunSign === viewerSunSign);
  }, [posts, filter, viewerSunSign]);

  function loadMore() {
    const last = posts[posts.length - 1];
    if (!last) return;
    startTransition(async () => {
      const next = await listFeed({
        cursor: new Date(last.createdAt).toISOString(),
        limit: PAGE_SIZE,
      });
      setPosts((prev) => [...prev, ...next]);
      if (next.length < PAGE_SIZE) setHasMore(false);
    });
  }

  return (
    <>
      {viewerSunSign !== null && !disablePagination && (
        <div className="mb-4 flex items-center gap-1.5">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            ყველა
          </FilterChip>
          <FilterChip
            active={filter === "sign"}
            onClick={() => setFilter("sign")}
          >
            ჩემი ნიშნით
          </FilterChip>
        </div>
      )}

      {visible.length === 0 ? (
        filter === "sign" ? (
          <SignEmptyState />
        ) : (
          <EmptyState />
        )
      ) : (
        <ul className="space-y-4">
          {visible.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                viewerId={viewerId}
                viewerIsAdmin={viewerIsAdmin}
              />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
            size="lg"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            მეტი პოსტი
          </Button>
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-all",
        active
          ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/12 text-foreground"
          : "border-border bg-card/40 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Sparkles className="mx-auto mb-3 size-8 text-[var(--vivida-violet)]" />
      <h2 className="text-lg font-semibold">ფიდი ჯერ ცარიელია</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        იყავი პირველი — დაწერე რასაც ფიქრობ, კითხვა, ციტატა, ან უბრალოდ
        როგორ ხარ.
      </p>
    </div>
  );
}

function SignEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        ჯერ შენი ნიშნით არავის დაუპოსტავს — შენ თუ პირველი იქნები?
      </p>
      <Link
        href="/feed"
        className="mt-2 inline-block text-xs text-[var(--vivida-violet)] hover:underline"
      >
        ნახე ყველა
      </Link>
    </div>
  );
}
