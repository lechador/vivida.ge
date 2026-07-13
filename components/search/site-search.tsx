"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";

type PageHit = {
  title: string;
  sub: string;
  url: string;
  category: string;
  icon: string | null;
};
type UserHit = {
  username: string;
  displayName: string | null;
  name: string | null;
  image: string | null;
};
type Flat =
  | { kind: "page"; hit: PageHit; href: string }
  | { kind: "user"; hit: UserHit; href: string };

/**
 * Site-wide search for the public homepage. Debounced query to /api/search;
 * shows matching pages (zodiac, tests, tools, SEO clusters) and public
 * profiles. Full keyboard support (↑/↓/Enter/Esc). Navigating picks the page
 * or /u/<username>.
 */
export function SiteSearch({
  className,
  compact = false,
  placeholder = "ძებნა — ნიშანი, ტესტი, ჰოროსკოპი, ხალხი…",
}: {
  /** Root width/layout override (defaults to a hero-sized max width). */
  className?: string;
  /** Slimmer padding for navbar placement. */
  compact?: boolean;
  placeholder?: string;
} = {}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pages, setPages] = useState<PageHit[]>([]);
  const [users, setUsers] = useState<UserHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced fetch.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setPages([]);
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { pages: PageHit[]; users: UserHit[] };
        setPages(data.pages ?? []);
        setUsers(data.users ?? []);
        setActive(0);
      } catch {
        /* aborted or failed — keep prior results */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const flat = useMemo<Flat[]>(
    () => [
      ...pages.map((hit) => ({ kind: "page" as const, hit, href: hit.url })),
      ...users.map((hit) => ({
        kind: "user" as const,
        hit,
        href: `/u/${hit.username}`,
      })),
    ],
    [pages, users]
  );

  const showPanel = open && q.trim().length >= 2;

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showPanel || flat.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = flat[active];
      if (sel) go(sel.href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={boxRef}
      className={`relative text-left ${className ?? "w-full max-w-lg"}`}
    >
      <div className="relative">
        <Search
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${
            compact ? "left-3 size-4" : "left-4 size-5"
          }`}
        />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="ძებნა საიტზე"
          className={
            compact
              ? "w-full rounded-full border border-border bg-card/70 py-2 pl-9 pr-9 text-sm text-foreground outline-none backdrop-blur-xl transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--vivida-violet)]/60"
              : "w-full rounded-2xl border border-border bg-card/70 py-3.5 pl-12 pr-11 text-[15px] text-foreground shadow-lg outline-none backdrop-blur-xl transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--vivida-violet)]/60"
          }
        />
        {loading && (
          <Loader2
            className={`absolute top-1/2 -translate-y-1/2 animate-spin text-muted-foreground ${
              compact ? "right-3 size-3.5" : "right-4 size-4"
            }`}
          />
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-[oklch(0.18_0.04_285/0.97)] p-1.5 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-2xl">
          {flat.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {loading ? "ძებნა…" : "ვერაფერი მოიძებნა"}
            </div>
          ) : (
            <ul>
              {pages.length > 0 && (
                <SectionLabel>გვერდები</SectionLabel>
              )}
              {pages.map((hit, i) => (
                <Row
                  key={hit.url}
                  active={active === i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit.url)}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--vivida-violet)]/12 text-base">
                    {hit.icon ?? "✦"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {hit.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {hit.sub}
                    </span>
                  </span>
                </Row>
              ))}

              {users.length > 0 && <SectionLabel>ხალხი</SectionLabel>}
              {users.map((hit, i) => {
                const idx = pages.length + i;
                const display =
                  hit.displayName ?? hit.name?.split(" ")[0] ?? hit.username;
                return (
                  <Row
                    key={hit.username}
                    active={active === idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(`/u/${hit.username}`)}
                  >
                    {hit.image ? (
                      <Image
                        src={hit.image}
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 shrink-0 rounded-full border border-border/60 object-cover"
                      />
                    ) : (
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-xs text-muted-foreground">
                        {display[0]?.toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {display}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        @{hit.username}
                      </span>
                    </span>
                  </Row>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <li className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
      {children}
    </li>
  );
}

function Row({
  active,
  onClick,
  onMouseEnter,
  children,
}: {
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
          active ? "bg-[var(--vivida-violet)]/15" : "hover:bg-foreground/5"
        }`}
      >
        {children}
      </button>
    </li>
  );
}
