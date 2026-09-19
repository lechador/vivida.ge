"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";

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
 * Mobile-only search trigger (icon button) + full-screen dialog with input
 * and live results. Shown md:hidden so the desktop SearchBar still owns
 * larger viewports.
 */
export function MobileSearch({ locale = "ka" }: { locale?: UserLocale }) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={locale !== "ka" ? "Search" : "ძებნა"}
          className="grid size-11 shrink-0 place-items-center rounded-full text-foreground/85 transition-colors hover:bg-card/60 hover:text-foreground md:hidden"
        >
          <Search className="size-5" />
        </button>
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-x-2 top-2 z-50 flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-xl"
              >
                <DialogPrimitive.Title className="sr-only">
                  {locale !== "ka" ? "Search" : "ძებნა"}
                </DialogPrimitive.Title>
                <SearchPanel onClose={() => setOpen(false)} locale={locale} />
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function SearchPanel({
  onClose,
  locale,
}: {
  onClose: () => void;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Autofocus on mount — main reason to use a dedicated mobile component
  // is that the user expects the keyboard to appear immediately.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Debounced fetch — only when the trimmed query is long enough.
  // When the query becomes too short, we don't fetch but also don't clear
  // here (rendering uses `hasQuery` to decide what to show, so stale results
  // are simply hidden until a new fetch resolves).
  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;
  useEffect(() => {
    if (!hasQuery) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      // Showing the spinner only after debounce fires avoids a flash on
      // every keystroke and also satisfies the "no synchronous setState
      // inside effect" rule.
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

  const navigate = (username: string) => {
    onClose();
    setQuery("");
    router.push(`/u/${username}`);
  };

  return (
    <>
      <header className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <Search className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={en ? "Name or @" : "სახელი ან @"}
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && results[highlight]) {
              e.preventDefault();
              navigate(results[highlight].username);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="size-[18px] shrink-0 animate-spin text-muted-foreground" />
        ) : hasQuery && results[highlight] ? (
          <button
            type="button"
            aria-label={en ? "Go" : "გადასვლა"}
            onClick={() => navigate(results[highlight].username)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-card/60 text-foreground/80 ring-1 ring-foreground/10 transition-colors hover:bg-card hover:text-foreground"
          >
            <CornerDownLeft className="size-4" />
          </button>
        ) : (
          <DialogPrimitive.Close
            aria-label={en ? "Close" : "დახურვა"}
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {hasQuery && results.length > 0 ? (
          <ul className="p-1.5">
            {results.map((r, i) => (
              <li key={r.userId}>
                <Link
                  href={`/u/${r.username}`}
                  onClick={() => {
                    onClose();
                    setQuery("");
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    i === highlight ? "bg-accent/15" : "hover:bg-accent/10",
                  )}
                >
                  <Image
                    src={r.image || DEFAULT_AVATAR}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full border border-border/60 object-cover"
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
        ) : hasQuery && !loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {en
              ? "No public profiles found"
              : "არცერთი საჯარო პროფილი არ მოიძებნა"}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground/70">
            {en
              ? "Search by name or @username"
              : "მოძებნე სახელით ან @username-ით"}
          </div>
        )}
      </div>
    </>
  );
}
