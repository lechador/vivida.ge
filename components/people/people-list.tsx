"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";

import type { PersonRow } from "@/lib/people";
import { fetchMorePeople } from "@/actions/people";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PersonRowCard } from "./person-row";

/**
 * Client wrapper for the /people directory. Owns the search input
 * + the "load more" cursor state. The initial page is rendered on
 * the server; everything after is fetched via the `fetchMorePeople`
 * action.
 */
export function PeopleList({
  initial,
  initialCursor,
}: {
  initial: PersonRow[];
  initialCursor: string | null;
}) {
  const [people, setPeople] = useState<PersonRow[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search: debounce keystrokes 200ms, then refetch from page 1 with q.
  // Empty input falls back to the unfiltered directory.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < 2) return;
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await fetchMorePeople(null, trimmed || null);
        setPeople(res.rows);
        setCursor(res.nextCursor);
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const res = await fetchMorePeople(cursor, query.trim() || null);
      setPeople((prev) => [...prev, ...res.rows]);
      setCursor(res.nextCursor);
    });
  }

  return (
    <>
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="მოძებნე სახელით ან @username-ით"
          className="block w-full rounded-full border border-foreground/12 bg-[oklch(0.21_0.04_285/0.85)] py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-xl focus:border-[var(--vivida-violet)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vivida-violet)]/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="გასუფთავება"
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-card/80 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {query.trim().length >= 2
              ? "ვერავინ ვერ მოიძებნა — სცადე სხვა სიტყვით."
              : "ჯერ არავინ შემოსულა."}
          </p>
        </div>
      ) : (
        <ul className={cn("space-y-2", isPending && "opacity-70")}>
          {people.map((p) => (
            <PersonRowCard key={p.id} person={p} />
          ))}
        </ul>
      )}

      {cursor && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            მეტი ხალხი
          </Button>
        </div>
      )}
    </>
  );
}
