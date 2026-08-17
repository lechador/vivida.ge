"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { listFeed, type FeedPost } from "@/actions/feed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

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
  locale = "ka",
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
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const [posts, setPosts] = useState<FeedPost[]>(initial);
  const [hasMore, setHasMore] = useState(
    !disablePagination && initial.length >= PAGE_SIZE
  );
  const [source, setSource] = useState({ initial, disablePagination });
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "sign">("all");

  // React's supported "adjust state while rendering" pattern keeps local
  // pagination in sync after a server refresh without an extra effect render.
  if (
    source.initial !== initial ||
    source.disablePagination !== disablePagination
  ) {
    setSource({ initial, disablePagination });
    setPosts(initial);
    setHasMore(!disablePagination && initial.length >= PAGE_SIZE);
  }

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
            {am ? "Բոլորը" : en ? "All" : "ყველა"}
          </FilterChip>
          <FilterChip
            active={filter === "sign"}
            onClick={() => setFilter("sign")}
          >
            {am ? "Իմ նշանը" : en ? "My sign" : "ჩემი ნიშნით"}
          </FilterChip>
        </div>
      )}

      {visible.length === 0 ? (
        filter === "sign" ? (
          <SignEmptyState locale={locale} />
        ) : (
          <EmptyState locale={locale} />
        )
      ) : (
        <ul className="space-y-4">
          {visible.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                viewerId={viewerId}
                viewerIsAdmin={viewerIsAdmin}
                locale={locale}
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
            {am ? "Ավելի շատ գրառումներ" : en ? "More posts" : "მეტი პოსტი"}
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

function EmptyState({ locale }: { locale: UserLocale }) {
  const en = locale !== "ka";
  const am = locale === "am";
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Sparkles className="mx-auto mb-3 size-8 text-[var(--vivida-violet)]" />
      <h2 className="text-lg font-semibold">{am ? "Ժապավենը դատարկ է" : en ? "The feed is empty" : "ფიდი ჯერ ცარიელია"}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {en
          ? "Be the first to share a thought, question, quote, or simply how you feel."
          : "იყავი პირველი — დაწერე რასაც ფიქრობ, კითხვა, ციტატა, ან უბრალოდ როგორ ხარ."}
      </p>
    </div>
  );
}

function SignEmptyState({ locale }: { locale: UserLocale }) {
  const en = locale !== "ka";
  const am = locale === "am";
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        {am ? "Ձեր նշանով դեռ ոչ ոք գրառում չի արել. դուք կլինե՞ք առաջինը։" : en ? "No one with your sign has posted yet—will you be first?" : "ჯერ შენი ნიშნით არავის დაუპოსტავს — შენ თუ პირველი იქნები?"}
      </p>
      <Link
        href="/feed"
        className="mt-2 inline-block text-xs text-[var(--vivida-violet)] hover:underline"
      >
        {am ? "Դիտել բոլորը" : en ? "View all" : "ნახე ყველა"}
      </Link>
    </div>
  );
}
