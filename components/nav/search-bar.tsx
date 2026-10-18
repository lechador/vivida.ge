"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";

type Result = {
  userId: string;
  username: string;
  displayName: string;
  image: string | null;
  bio: string | null;
};

/**
 * Header search input. Debounced fetch to /api/users/search, keyboard nav
 * with arrow keys + Enter to navigate to the highlighted result.
 */
export function SearchBar({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // W04 search funnel, fire search_opened once per mount, and no_result at
  // most once per distinct query (debounced fetches would otherwise spam).
  const openedTracked = useRef(false);
  const noResultTracked = useRef<Set<string>>(new Set());

  function trackResultSelected(username: string) {
    trackEvent(ANALYTICS_EVENT.searchResultSelected, {
      ...productEventBase("search", "authed_header", locale),
      result_type: "people",
      // selection rate per surface is what the funnel needs.
      outcome: "selected",
    });
    router.push(`/u/${username}`);
    setOpen(false);
    setQuery("");
  }

  // Debounced fetch, only when the trimmed query is long enough.
  // Stale results from a longer prior query stay in state but the dropdown
  // is gated below by `hasQuery`, so they never render.
  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;
  useEffect(() => {
    if (!hasQuery) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      // Spinner shown only after debounce fires, avoids a flash on every
      // keystroke and satisfies the "no synchronous setState in effect" rule.
      setLoading(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: Result[] };
        setResults(data.results ?? []);
        setHighlight(0);
        setOpen(true);
        if (!openedTracked.current) {
          openedTracked.current = true;
          trackEvent(ANALYTICS_EVENT.searchOpened, {
            ...productEventBase("search", "authed_header", locale),
            result_type: "people",
          });
        }
        if (
          (data.results ?? []).length === 0 &&
          trimmed.length >= 3 &&
          !noResultTracked.current.has(trimmed) &&
          noResultTracked.current.size < 50
        ) {
          noResultTracked.current.add(trimmed);
          trackEvent(ANALYTICS_EVENT.searchNoResult, {
            ...productEventBase("search", "authed_header", locale),
            result_type: "people",
          });
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [trimmed, hasQuery, locale]);

  // Click outside closes
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cmd/Ctrl + K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={en ? "Search profiles (@username)…" : "ძებნა სახელით ან @…"}
          className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/70"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && results[highlight]) {
              e.preventDefault();
              trackResultSelected(results[highlight].username);
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="button"
            aria-label={en ? "Go" : "გადასვლა"}
            tabIndex={-1}
            onClick={() => {
              const target = results[highlight];
              if (target) {
                trackResultSelected(target.username);
              } else {
                inputRef.current?.focus();
              }
            }}
            className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <CornerDownLeft className="size-3.5" />
          </button>
        )}
      </div>

      {open && hasQuery && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-80 overflow-auto rounded-md border border-border bg-card p-1 shadow-xl">
          {results.map((r, i) => (
            <li key={r.userId}>
              <Link
                href={`/u/${r.username}`}
                onClick={() => {
                  trackEvent(ANALYTICS_EVENT.searchResultSelected, {
                    ...productEventBase("search", "authed_header", locale),
                    result_type: "people",
                    outcome: "selected",
                  });
                  setOpen(false);
                  setQuery("");
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-2.5 py-2 transition-colors",
                  i === highlight ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <Image
                  src={r.image || DEFAULT_AVATAR}
                  alt=""
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                  className="size-8 shrink-0 rounded-sm border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {r.displayName}
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    @{r.username}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && hasQuery && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-md border border-border bg-card p-4 text-center text-xs text-muted-foreground shadow-xl">
          {en
            ? "No public profiles found"
            : "არცერთი საჯარო პროფილი არ მოიძებნა"}
        </div>
      )}
    </div>
  );
}
