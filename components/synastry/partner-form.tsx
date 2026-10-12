"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPartner } from "@/actions/partners";
import { validateDate } from "@/components/onboarding/step-date";
import { validateTime } from "@/components/onboarding/step-time";
import type {
  DateValue,
  PlaceValue,
  TimeValue,
} from "@/components/onboarding/types";
import type { GeocodeResult } from "@/lib/geocoding";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Single-page form for adding a synastry partner. Same input shape as the
 * onboarding wizard (date / time / place), but flat, partner data is
 * something the user types in once and forgets, so the slow-paced
 * multi-step ceremony isn't appropriate here.
 */
export function PartnerForm({ locale }: { locale: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState<DateValue>({ day: "", month: "", year: "" });
  const [time, setTime] = useState<TimeValue>({
    hour: "",
    minute: "",
    unknown: false,
  });
  const [place, setPlace] = useState<PlaceValue>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);

  const dateValid = validateDate(date) !== null;
  const timeRes = validateTime(time);
  const ready =
    name.trim().length > 0 && dateValid && timeRes.ok && place !== null;

  const submit = () => {
    setError(null);
    const dateStr = validateDate(date);
    if (!name.trim() || !dateStr || !timeRes.ok || !place) {
      setError(
        en ? "Please complete every field." : "გთხოვ, ყველა ველი შეავსო.",
      );
      return;
    }
    startTransition(async () => {
      const result = await createPartner({
        name: name.trim(),
        dateOfBirth: dateStr,
        timeOfBirth: timeRes.time,
        cityName: place.displayName,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/synastry/${result.id}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Name */}
      <Section label={en ? "Partner's name" : "პარტნიორის სახელი"}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          placeholder={en ? "e.g. Alex" : "მაგ. ნინო"}
          maxLength={60}
          autoFocus
        />
      </Section>

      {/* Date */}
      <Section
        label={en ? "Birth date" : "დაბადების თარიღი"}
        hint={
          en
            ? "Your Sun, Moon, and core chart patterns begin here."
            : "მზე, მთვარე და ძირითადი არქეტიპები, აქედან იწყება."
        }
      >
        <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-3">
          <Input
            inputMode="numeric"
            placeholder="DD"
            maxLength={2}
            value={date.day}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              setDate((d) => ({ ...d, day: v }));
              if (v.length === 2) monthRef.current?.focus();
            }}
            className="text-center text-lg tabular-nums"
          />
          <Input
            ref={monthRef}
            inputMode="numeric"
            placeholder="MM"
            maxLength={2}
            value={date.month}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              setDate((d) => ({ ...d, month: v }));
              if (v.length === 2) yearRef.current?.focus();
            }}
            className="text-center text-lg tabular-nums"
          />
          <Input
            ref={yearRef}
            inputMode="numeric"
            placeholder="YYYY"
            maxLength={4}
            value={date.year}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setDate((d) => ({ ...d, year: v }));
            }}
            className="text-center text-lg tabular-nums"
          />
        </div>
      </Section>

      {/* Time */}
      <Section
        label={en ? "Birth time" : "დაბადების დრო"}
        hint={
          en
            ? "Birth time determines the rising sign and houses. If you don't know it, we'll use noon."
            : "ამომავალი ნიშანი და სახლების განლაგება დროითაა განსაზღვრული. თუ არ ვიცი, გამოვიყენებთ შუადღეს."
        }
      >
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <Input
            inputMode="numeric"
            placeholder="HH"
            maxLength={2}
            value={time.hour}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              setTime((t) => ({ ...t, hour: v, unknown: false }));
              if (v.length === 2) minRef.current?.focus();
            }}
            disabled={time.unknown}
            className="text-center text-lg tabular-nums"
          />
          <Input
            ref={minRef}
            inputMode="numeric"
            placeholder="MM"
            maxLength={2}
            value={time.minute}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              setTime((t) => ({ ...t, minute: v, unknown: false }));
            }}
            disabled={time.unknown}
            className="text-center text-lg tabular-nums"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            setTime((t) => ({
              hour: t.unknown ? t.hour : "",
              minute: t.unknown ? t.minute : "",
              unknown: !t.unknown,
            }))
          }
          className={cn(
            "mt-3 flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all",
            time.unknown
              ? "border-[var(--vivida-cyan)]/60 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            className={cn(
              "size-3 rounded-full border-2 transition-colors",
              time.unknown
                ? "border-[var(--vivida-cyan)] bg-[var(--vivida-cyan)]"
                : "border-muted-foreground",
            )}
          />
          {en ? "I don't know the exact time" : "ზუსტი დრო არ ვიცი"}
        </button>
      </Section>

      {/* Place */}
      <Section
        label={en ? "Birthplace" : "დაბადების ადგილი"}
        hint={
          en
            ? "Search in any language."
            : "ქართულად ან ლათინურად, ყველანაირი ვარიანტი მუშაობს."
        }
      >
        <PlaceField value={place} onChange={setPlace} locale={locale} />
      </Section>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        variant="mystic"
        size="lg"
        onClick={submit}
        disabled={!ready || isPending}
        className="w-full"
      >
        <Sparkles />
        {isPending
          ? en
            ? "Calculating..."
            : "ვითვლით..."
          : en
            ? "Calculate compatibility"
            : "გამოთვალე თავსებადობა"}
      </Button>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-xl">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Inline place typeahead, mirrors components/onboarding/step-place.tsx. */
function PlaceField({
  value,
  onChange,
  locale,
}: {
  value: PlaceValue;
  onChange: (next: PlaceValue) => void;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [query, setQuery] = useState(value?.displayName ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
          { signal: ctrl.signal },
        );
        if (!res.ok) throw new Error("geocode failed");
        const data = (await res.json()) as { results: GeocodeResult[] };
        setResults(data.results ?? []);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [trimmed, shouldFetch]);

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

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
          }}
          placeholder={
            en ? "London, Paris, New York..." : "თბილისი, Tbilisi, ნიუ-იორკი..."
          }
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              onChange(null);
            }}
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            aria-label={en ? "Clear" : "გასუფთავება"}
          >
            <X className="size-3.5" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-9 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-background/95 p-1 shadow-2xl backdrop-blur-xl">
          {results.map((r, i) => (
            <li key={`${r.id}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setQuery(r.displayName);
                  setResults([]);
                  setOpen(false);
                  onChange(r);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-foreground/5",
                )}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-foreground">
                    {r.displayName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.country} · {r.timezone}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value && (
        <p className="mt-2 text-xs text-muted-foreground">
          ✓ {value.displayName} · {value.timezone}
        </p>
      )}
    </div>
  );
}
