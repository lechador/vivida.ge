"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/geocoding";
import type { PlaceValue } from "./types";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function StepPlace({
  value,
  onChange,
  locale = "ka",
}: {
  value: PlaceValue;
  onChange: (next: PlaceValue) => void;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const [query, setQuery] = useState(value?.displayName ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // "empty" / "error" drive the visible panels below
  const [status, setStatus] = useState<"idle" | "ok" | "empty" | "error">(
    "idle"
  );
  const [retryKey, setRetryKey] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;
  const isSelected = !!value && query === value.displayName;
  const shouldFetch = hasQuery && !isSelected;
  useEffect(() => {
    if (!shouldFetch) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error("geocode failed");
        const data = (await res.json()) as { results: GeocodeResult[] };
        const list = data.results ?? [];
        setResults(list);
        setStatus(list.length > 0 ? "ok" : "empty");
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([]);
          setStatus("error");
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [trimmed, shouldFetch, retryKey]);

  // Click-outside to close dropdown
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const headingText = am
    ? "Որտե՞ղ եք ծնվել:"
    : en
    ? "Where were you born?"
    : "სად დაიბადე?";
  const descText = am
    ? "Ձեր ծննդավայրը կապում է ձեր քարտեզը տվյալ պահի երկնքի հետ:"
    : en
    ? "Your birthplace connects your chart to the sky at that exact moment."
    : "დაბადების ადგილი შენს რუკას იმ მომენტის ცასთან აკავშირებს.";
  const labelText = am
    ? "Ծննդավայր քաղաք"
    : en
    ? "Birth city"
    : "დაბადების ქალაქი";
  const placeholderText = am
    ? "Երևան, Գյումրի, Վանաձոր…"
    : en
    ? "London, New York, Tokyo…"
    : "თბილისი, ნიუ-იორკი, ტოკიო…";
  const clearAriaLabel = am ? "Մաքրել" : en ? "Clear" : "წაშლა";
  const notFoundText = am
    ? "Քաղաքը չգտնվեց"
    : en
    ? "No place found"
    : "ვერაფერი მოიძებნა";
  const notFoundHint = am
    ? "Փորձեք այլ տարբերակ կամ ընտրեք մոտակա խոշոր քաղաքը:"
    : en
    ? "Try a different spelling, or pick the nearest larger city — it does not change your chart."
    : "სცადე სხვა დაწერილობა ან აირჩიე უახლოესი დიდი ქალაქი — რუკას ეს არ ცვლის.";
  const errorText = am
    ? "Չհաջողվեց կապվել որոնման ծառայության հետ:"
    : en
    ? "Could not reach the search service."
    : "საძიებო სერვისს ვერ დავუკავშირდით.";
  const retryText = am ? "Փորձել կրկին" : en ? "Try again" : "სცადე ხელახლა";

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {headingText}
        </h2>
        <p className="text-muted-foreground">{descText}</p>
      </header>

      <div className="mx-auto max-w-md space-y-2" ref={wrapperRef}>
        <Label htmlFor="place">{labelText}</Label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="place"
            placeholder={placeholderText}
            className="pl-9 pr-10 text-base"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setStatus("idle");
              if (value) onChange(null);
            }}
            onFocus={() =>
              (results.length > 0 || status === "empty" || status === "error") &&
              setOpen(true)
            }
            autoComplete="off"
            autoFocus
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : value ? (
            <button
              type="button"
              aria-label={clearAriaLabel}
              onClick={() => {
                onChange(null);
                setQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}

          <AnimatePresence>
            {open && shouldFetch && results.length > 0 && (
              <motion.ul
                key="results"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-auto rounded-lg border border-border bg-popover/95 p-1 shadow-2xl backdrop-blur-md"
              >
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(r);
                        setQuery(r.displayName);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-accent/15"
                      )}
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">
                          {r.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {[r.admin1, r.country].filter(Boolean).join(", ")}
                          <span className="ml-2 text-muted-foreground/60">
                            {r.timezone}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}

            {open && shouldFetch && !loading && status === "empty" && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-lg border border-border bg-popover/95 px-3 py-2.5 text-sm shadow-2xl backdrop-blur-md"
              >
                <p className="text-foreground">{notFoundText}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {notFoundHint}
                </p>
              </motion.div>
            )}

            {open && shouldFetch && !loading && status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-lg border border-border bg-popover/95 px-3 py-2.5 text-sm shadow-2xl backdrop-blur-md"
              >
                <p className="text-foreground">{errorText}</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setRetryKey((k) => k + 1);
                  }}
                  className="mt-2 rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent/15"
                >
                  {retryText}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {value && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/5 px-4 py-2 text-xs text-muted-foreground"
          >
            <span>
              <span className="font-medium text-foreground">
                {value.latitude.toFixed(3)}°, {value.longitude.toFixed(3)}°
              </span>{" "}
              · {value.timezone}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
