"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import type { UserLocale } from "@/lib/i18n/user-locale";

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

  // Debounced fetch — only when the trimmed query is long enough.
  // Stale results from a longer prior query stay in state but the dropdown
  // is gated below by `hasQuery`, so they never render.
  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;
  useEffect(() => {
    if (!hasQuery) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      // Spinner shown only after debounce fires — avoids a flash on every
      // keystroke and satisfies the "no synchronous setState in effect" rule.
      setLoading(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: Result[] };
        setResults(data.results ?? []);
        setHighlight(0);
        setOpen(true);
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
  }, [trimmed, hasQuery]);

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
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={en ? "Name or @" : "სახელი ან @"}
          className="h-12 w-full rounded-full border border-border bg-card/50 pl-11 pr-10 text-base outline-none ring-offset-background backdrop-blur transition-colors placeholder:text-muted-foreground/60 focus:border-transparent focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && results[highlight]) {
              e.preventDefault();
              router.push(`/u/${results[highlight].username}`);
              setOpen(false);
              setQuery("");
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="button"
            aria-label={en ? "Go" : "გადასვლა"}
            tabIndex={-1}
            onClick={() => {
              const target = results[highlight];
              if (target) {
                router.push(`/u/${target.username}`);
                setOpen(false);
                setQuery("");
              } else {
                inputRef.current?.focus();
              }
            }}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-card/60 text-foreground/80 ring-1 ring-foreground/10 transition-colors hover:bg-card hover:text-foreground"
          >
            <CornerDownLeft className="size-[16px]" />
          </button>
        )}
      </div>

      {open && hasQuery && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-80 overflow-auto rounded-xl border border-border bg-popover/95 p-1 shadow-2xl backdrop-blur-md">
          {results.map((r, i) => (
            <li key={r.userId}>
              <Link
                href={`/u/${r.username}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors",
                  i === highlight
                    ? "bg-accent/15"
                    : "hover:bg-accent/10"
                )}
              >
                <Image
                  src={r.image || DEFAULT_AVATAR}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-full border border-border/60 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {r.displayName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    @{r.username}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && hasQuery && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-xl border border-border bg-popover/95 p-4 text-center text-sm text-muted-foreground shadow-2xl backdrop-blur-md">
          {en ? "No public profiles found" : "არცერთი საჯარო პროფილი არ მოიძებნა"}
        </div>
      )}
    </div>
  );
}
