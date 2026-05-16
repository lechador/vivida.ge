"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight `@username` autocomplete wrapper around a plain
 * `<textarea>`. Detects when the caret is inside an `@word` token and
 * pops a suggestion list anchored below the textarea (not under the
 * caret — much simpler than measuring caret pixel position, and at
 * mobile sizes it's actually preferable). Keyboard: ↑/↓ move
 * selection, Enter/Tab insert the highlighted handle, Esc closes the
 * popover.
 *
 * Suggestions are fetched from `/api/users/search` (the existing
 * directory endpoint) — it already returns the shape we need and is
 * auth-gated, so no new API surface.
 *
 * Behaviour matches `<textarea>`: caller controls `value` + `onChange`,
 * and any extra props passed via `textareaProps` (placeholder, rows,
 * maxLength, etc.) flow through.
 */
type MentionSuggestion = {
  userId: string;
  username: string;
  displayName: string | null;
  image: string | null;
};

const TRIGGER = /(?:^|\s)@([a-z0-9_-]{0,24})$/i;
const MIN_QUERY = 2;
const FETCH_DEBOUNCE_MS = 120;
const MAX_SUGGESTIONS = 6;

export function MentionInput({
  value,
  onChange,
  textareaRef,
  onKeyDown,
  className,
  disabled,
  ...textareaProps
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onChange: (next: string) => void;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? localRef;
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState<string | null>(null);
  const fetchSeq = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recompute the "current @token" whenever value or caret moves.
  const detectQuery = useCallback(() => {
    const ta = ref.current;
    if (!ta) return;
    const caret = ta.selectionStart ?? value.length;
    const upTo = value.slice(0, caret);
    const match = TRIGGER.exec(upTo);
    if (!match) {
      setQuery(null);
      return;
    }
    setQuery(match[1] ?? "");
  }, [ref, value]);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    // detect after onChange flushes — defer to microtask so caret index
    // reflects the new value, not the pre-change one.
    queueMicrotask(detectQuery);
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (query !== null && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        const pick = suggestions[active];
        if (pick) {
          e.preventDefault();
          insertMention(pick.username);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setQuery(null);
        return;
      }
    }
    onKeyDown?.(e);
  }

  function insertMention(handle: string) {
    const ta = ref.current;
    if (!ta) return;
    const caret = ta.selectionStart ?? value.length;
    const upTo = value.slice(0, caret);
    const after = value.slice(caret);
    const match = TRIGGER.exec(upTo);
    if (!match) return;
    const tokenStart = match.index + (match[0].startsWith("@") ? 0 : 1);
    const before = value.slice(0, tokenStart);
    const inserted = `@${handle} `;
    const next = `${before}${inserted}${after}`;
    onChange(next);
    setQuery(null);
    // Restore focus + caret after the inserted handle.
    queueMicrotask(() => {
      const t = ref.current;
      if (!t) return;
      const pos = before.length + inserted.length;
      t.focus();
      t.setSelectionRange(pos, pos);
    });
  }

  // Debounced fetch when the query changes. Suggestions are only used
  // when `open` is true (gated on query !== null and length > 0), so
  // we don't synchronously clear them on every keystroke — the
  // popover already hides itself in the gap.
  useEffect(() => {
    if (query === null || query.length < MIN_QUERY) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const seq = ++fetchSeq.current;
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          results?: MentionSuggestion[];
        };
        if (seq !== fetchSeq.current) return; // stale
        setSuggestions((data.results ?? []).slice(0, MAX_SUGGESTIONS));
        setActive(0);
      } catch {
        // network blip — silently swallow; user can keep typing.
      }
    }, FETCH_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const open =
    query !== null &&
    query.length >= MIN_QUERY &&
    suggestions.length > 0 &&
    !disabled;

  // Hide the popover when the textarea loses focus, but defer it so a
  // click on a suggestion row gets a chance to fire first.
  function handleBlur() {
    setTimeout(() => setQuery(null), 150);
  }

  const showHint = useMemo(
    () => query !== null && query.length < MIN_QUERY && !disabled,
    [query, disabled]
  );

  return (
    <div className="relative">
      <textarea
        {...textareaProps}
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKey}
        onBlur={handleBlur}
        onKeyUp={detectQuery}
        onClick={detectQuery}
        disabled={disabled}
        className={className}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-card/95 p-1 shadow-lg ring-1 ring-foreground/5 backdrop-blur-xl"
          // Prevent the textarea's blur from closing the popover before
          // the click registers.
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.map((s, i) => (
            <li key={s.userId}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onClick={() => insertMention(s.username)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  i === active
                    ? "bg-[var(--vivida-violet)]/14 text-foreground"
                    : "text-foreground/90 hover:bg-card/80"
                )}
              >
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image}
                    alt=""
                    className="size-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid size-6 shrink-0 place-items-center rounded-full bg-card/80 text-[10px] text-muted-foreground">
                    {(s.displayName ?? s.username)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {s.displayName ?? s.username}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    @{s.username}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {showHint && (
        <div className="pointer-events-none absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-border/60 bg-card/80 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-xl">
          ჩაწერე მინიმუმ 2 სიმბოლო მეგობრის მოსაძებნად…
        </div>
      )}
    </div>
  );
}
