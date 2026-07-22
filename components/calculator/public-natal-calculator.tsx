"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Lock, Mail, MapPin, Share2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateDate } from "@/components/onboarding/step-date";
import { validateTime } from "@/components/onboarding/step-time";
import { ChartWheel } from "@/components/dashboard/chart-wheel";
import { AspectCards } from "@/components/dashboard/aspect-cards";
import { PositionsTable, HousesTable } from "@/components/report/positions-table";
import { signByIndex, signColor, formatDegree } from "@/lib/zodiac";
import { slugByLabelKa } from "@/lib/seo/zodiac-content";
import { trackEvent } from "@/lib/analytics";
import type { GeocodeResult } from "@/lib/geocoding";
import type { NatalChartJson, PointJson } from "@/db/schema";

const ERRORS: Record<string, string> = {
  invalid_date: "შეამოწმე დაბადების თარიღი.",
  invalid_time: "შეამოწმე დაბადების დრო.",
  invalid_location: "აირჩიე დაბადების ქალაქი სიიდან.",
  invalid_timezone: "აირჩიე დაბადების ქალაქი სიიდან.",
  rate_limited: "ბევრი მოთხოვნა მცირე დროში. სცადე ცოტა ხანში.",
  compute_failed: "გამოთვლა ვერ მოხერხდა. სცადე ხელახლა.",
};

export function PublicNatalCalculator() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [place, setPlace] = useState<GeocodeResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chart, setChart] = useState<NatalChartJson | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function share() {
    if (!chart) return;
    const sun = chart.bodies.sun?.signIndex;
    const moon = chart.bodies.moon?.signIndex;
    const asc = chart.ascendant?.signIndex;
    if (sun == null || moon == null || asc == null) return;
    const url = `${window.location.origin}/nataluri-ruka?big=${sun}.${moon}.${asc}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ჩემი ნატალური რუკა", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share sheet dismissed — ignore */
    }
  }

  async function compute() {
    setError(null);
    const date = validateDate({ day, month, year });
    if (!date) {
      setError(ERRORS.invalid_date);
      return;
    }
    const t = validateTime({ hour, minute, unknown: unknownTime });
    if (!t.ok) {
      setError(ERRORS.invalid_time);
      return;
    }
    if (!place) {
      setError(ERRORS.invalid_location);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/natal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: t.time,
          latitude: place.latitude,
          longitude: place.longitude,
          timezone: place.timezone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.chart) {
        setError(ERRORS[data.error] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.");
        return;
      }
      setChart(data.chart as NatalChartJson);
      trackEvent("natal_chart_computed", { source: "natal_calculator" });
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80
      );
    } catch {
      setError("ქსელის შეცდომა. სცადე ხელახლა.");
    } finally {
      setLoading(false);
    }
  }

  // Personalize the "continue free" rail to the visitor's own sun sign — a
  // highly relevant next click (and a 2nd pageview = an engaged, non-bounce
  // session in GA).
  const sunIdx = chart?.bodies.sun?.signIndex;
  const sunSign = sunIdx != null ? signByIndex(sunIdx) : null;
  const sunSlug = sunSign ? slugByLabelKa(sunSign.labelKa) : null;
  const bigParam =
    chart?.bodies.sun && chart?.bodies.moon && chart?.ascendant
      ? `${chart.bodies.sun.signIndex}.${chart.bodies.moon.signIndex}.${chart.ascendant.signIndex}`
      : null;

  return (
    <div>
      {/* Form */}
      <div className="rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void compute();
          }}
          className="space-y-6"
        >
          {/* Date */}
          <div className="space-y-2">
            <Label>დაბადების თარიღი</Label>
            <div className="grid grid-cols-3 gap-3">
              <NumField value={day} onChange={setDay} max={2} placeholder="დღე" aria="დღე" />
              <NumField value={month} onChange={setMonth} max={2} placeholder="თვე" aria="თვე" />
              <NumField value={year} onChange={setYear} max={4} placeholder="წელი" aria="წელი" />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>დაბადების დრო</Label>
              <button
                type="button"
                onClick={() => setUnknownTime((v) => !v)}
                className={`text-xs transition-colors ${
                  unknownTime
                    ? "text-[var(--vivida-cyan)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {unknownTime ? "✓ " : ""}არ ვიცი ზუსტი დრო
              </button>
            </div>
            <div className={`grid grid-cols-2 gap-3 ${unknownTime ? "opacity-40" : ""}`}>
              <NumField
                value={hour}
                onChange={setHour}
                max={2}
                placeholder="საათი"
                aria="საათი"
                disabled={unknownTime}
              />
              <NumField
                value={minute}
                onChange={setMinute}
                max={2}
                placeholder="წუთი"
                aria="წუთი"
                disabled={unknownTime}
              />
            </div>
            {unknownTime && (
              <p className="text-xs text-muted-foreground">
                დროს 12:00-ად ჩავთვლით — მზე და პლანეტები ზუსტი იქნება, ამომავალი
                და სახლები შესაძლოა არა.
              </p>
            )}
          </div>

          {/* Place */}
          <PlacePicker value={place} onChange={setPlace} />

          {error && <p className="text-sm text-[var(--vivida-pink)]">{error}</p>}

          <Button
            type="submit"
            variant="mystic"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {chart ? "ხელახლა გამოთვლა" : "გამოთვალე ჩემი რუკა"}
          </Button>
        </form>
      </div>

      {/* Results */}
      {chart && (
        <div ref={resultRef} className="mt-10 scroll-mt-24 space-y-8">
          <BigThree chart={chart} />

          <div className="flex justify-center">
            <Button type="button" variant="outline" size="lg" onClick={share}>
              {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
              {copied ? "ბმული დაკოპირდა" : "გააზიარე ჩემი რუკა"}
            </Button>
          </div>

          <div className="mx-auto max-w-xl">
            <ChartWheel chart={chart} />
          </div>

          <section>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">
              პლანეტების პოზიციები
            </h3>
            <PositionsTable chart={chart} />
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">12 სახლი</h3>
            <div className="rounded-2xl border border-border bg-card/50 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-xl sm:px-5">
              <HousesTable chart={chart} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">ასპექტები</h3>
            <AspectCards chart={chart} />
          </section>

          {/* Unlock CTA */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/14 via-card/65 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
              <Lock className="size-5" />
            </div>
            <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              რას ნიშნავს ეს შენთვის?
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-pretty text-base text-muted-foreground">
              ეს არის შენი რუკის სუფთა მონაცემები. დარეგისტრირდი უფასოდ და ნახე
              თითოეული პლანეტის, სახლისა და ასპექტის პერსონალური ინტერპრეტაცია,
              AI ანალიზი და სრული PDF ანგარიში.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="mystic" size="lg">
                <Link
                  href="/signup"
                  onClick={() =>
                    trackEvent("register_click", { source: "natal_calculator" })
                  }
                >
                  უფასო რეგისტრაცია
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">შესვლა</Link>
              </Button>
            </div>
          </div>

          {/* Lower-friction return hook — get the daily horoscope by email
              without a full signup (the biggest lever on "nobody returns"). */}
          <HoroscopeEmailCapture sunSign={sunIdx} big={bigParam} />

          {/* Second-action rail — a free next step so a visitor who isn't ready
              to register still takes a 2nd action (a 2nd pageview is an engaged,
              non-bounce session) and discovers a reason to return. Personalized
              to their sun sign for relevance. */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              ან განაგრძე უფასოდ
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {sunSlug && sunSign && (
                <Link
                  href={`/zodiac/${sunSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span aria-hidden>{sunSign.symbol}</span>
                  {sunSign.labelKa} — შენი ნიშანი
                </Link>
              )}
              <Link
                href="/horoskopi"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                დღის ჰოროსკოპი
              </Link>
              <Link
                href="/zodiac/tavsebadoba"
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                თავსებადობა
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact "get the daily horoscope by email" capture shown on the free result.
 * A lower-friction alternative to full signup: posts the email + sun sign to
 * the public subscribe endpoint, which stores the lead and fires an immediate
 * welcome email. Returns null until a chart (hence a sun sign) exists.
 */
function HoroscopeEmailCapture({
  sunSign,
  big,
}: {
  sunSign: number | undefined;
  big: string | null;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState<string | null>(null);

  if (sunSign == null) return null;

  async function submit() {
    const value = email.trim();
    if (!value) return;
    setStatus("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/public/horoscope-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, sunSign, big }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMsg(
          data.error === "rate_limited"
            ? "ბევრი მოთხოვნა. სცადე ცოტა ხანში."
            : (typeof data.error === "string" && data.error) ||
                "ვერ მოხერხდა. სცადე ხელახლა."
        );
        return;
      }
      setStatus("done");
      trackEvent("horoscope_email_subscribed", { sun_sign: sunSign });
    } catch {
      setStatus("error");
      setMsg("ქსელის შეცდომა. სცადე ხელახლა.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/8 px-5 py-4 text-center text-sm text-foreground/90 ring-1 ring-foreground/5">
        <Check className="size-4 shrink-0 text-[var(--vivida-cyan)]" />
        გამოწერილია! პირველი ჰოროსკოპი უკვე იგზავნება ელფოსტაზე.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <Mail className="size-4 text-[var(--vivida-cyan)]" />
        მიიღე დღიური ჰოროსკოპი ელფოსტაზე — უფასოდ
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="შენი ელფოსტა"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 text-base"
        />
        <Button type="submit" variant="mystic" disabled={status === "loading"}>
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "გამოწერა"
          )}
        </Button>
      </form>
      {msg && (
        <p className="mt-2 text-center text-sm text-[var(--vivida-pink)]">{msg}</p>
      )}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        რეგისტრაცია არ სჭირდება. გაუქმება — ერთ დაწკაპუნებაზე.
      </p>
    </div>
  );
}

function NumField({
  value,
  onChange,
  max,
  placeholder,
  aria,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder: string;
  aria: string;
  disabled?: boolean;
}) {
  return (
    <Input
      inputMode="numeric"
      aria-label={aria}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, max))}
      className="text-center text-base tabular-nums"
    />
  );
}

function BigThree({ chart }: { chart: NatalChartJson }) {
  const items: { label: string; glyph: string; point: PointJson | undefined }[] = [
    { label: "მზე", glyph: "☉", point: chart.bodies.sun },
    { label: "მთვარე", glyph: "☽", point: chart.bodies.moon },
    { label: "ამომავალი", glyph: "AC", point: chart.ascendant },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ label, glyph, point }) => {
        if (!point) return null;
        const sign = signByIndex(point.signIndex);
        const color = signColor(sign);
        return (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl"
          >
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {glyph} {label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl" style={{ color }} aria-hidden>
                {sign.symbol}
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {sign.labelKa}
              </span>
            </div>
            <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              {formatDegree(point.signDegree)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlacePicker({
  value,
  onChange,
}: {
  value: GeocodeResult | null;
  onChange: (v: GeocodeResult | null) => void;
}) {
  const [query, setQuery] = useState(value?.displayName ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const isSelected = !!value && query === value.displayName;
  const shouldFetch = trimmed.length >= 2 && !isSelected;

  useEffect(() => {
    if (!shouldFetch) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/geocode?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal,
        });
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
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="space-y-2" ref={wrapRef}>
      <Label htmlFor="calc-place">დაბადების ქალაქი</Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="calc-place"
          placeholder="თბილისი, ბათუმი, ქუთაისი…"
          className="pl-9 pr-10 text-base"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            aria-label="წაშლა"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}

        {open && shouldFetch && results.length > 0 && (
          <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-auto rounded-lg border border-border bg-popover/95 p-1 shadow-2xl backdrop-blur-md">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(r);
                    setQuery(r.displayName);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent/15"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{r.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[r.admin1, r.country].filter(Boolean).join(", ")}
                      <span className="ml-2 text-muted-foreground/60">{r.timezone}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {value && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/5 px-4 py-2 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">
              {value.latitude.toFixed(3)}°, {value.longitude.toFixed(3)}°
            </span>{" "}
            · {value.timezone}
          </span>
        </div>
      )}
    </div>
  );
}
