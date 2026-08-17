"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Share2,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateDate } from "@/components/onboarding/step-date";
import { validateTime } from "@/components/onboarding/step-time";
import { ChartWheel } from "@/components/dashboard/chart-wheel";
import { AspectCards } from "@/components/dashboard/aspect-cards";
import {
  PositionsTable,
  HousesTable,
} from "@/components/report/positions-table";
import { signByIndex, signColor, formatDegree } from "@/lib/zodiac";
import { slugByLabelKa } from "@/lib/seo/zodiac-content";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { GeocodeResult } from "@/lib/geocoding";
import type { NatalChartJson, PointJson } from "@/db/schema";
import { savePendingNatalProfile } from "@/lib/pending-natal-profile";
import { localeHref } from "@/lib/i18n/armenian-routes";

const ERRORS: Record<string, string> = {
  invalid_date: "შეამოწმე დაბადების თარიღი.",
  invalid_time: "შეამოწმე დაბადების დრო.",
  invalid_location: "აირჩიე დაბადების ქალაქი სიიდან.",
  invalid_timezone: "აირჩიე დაბადების ქალაქი სიიდან.",
  rate_limited: "ბევრი მოთხოვნა მცირე დროში. სცადე ცოტა ხანში.",
  compute_failed: "გამოთვლა ვერ მოხერხდა. სცადე ხელახლა.",
};
const ERRORS_EN: Record<string, string> = {
  invalid_date: "Check your birth date.",
  invalid_time: "Check your birth time.",
  invalid_location: "Choose your birth city from the list.",
  invalid_timezone: "Choose your birth city from the list.",
  rate_limited: "Too many requests in a short time. Please try again soon.",
  compute_failed: "We couldn't calculate the chart. Please try again.",
};
const ERRORS_AM: Record<string, string> = {
  invalid_date: "Ստուգեք ձեր ծննդյան ամսաթիվը:",
  invalid_time: "Ստուգեք ձեր ծննդյան ժամը:",
  invalid_location: "Ընտրեք ձեր ծննդավայր քաղաքը ցանկից:",
  invalid_timezone: "Ընտրեք ձեր ծննդավայր քաղաքը ցանկից:",
  rate_limited: "Չափազանց շատ հարցումներ: Խնդրում ենք փորձել մի փոքր ուշ:",
  compute_failed: "Չհաջողվեց հաշվարկել քարտեզը: Խնդրում ենք փորձել կրկին:",
};

const CALCULATOR_ONBOARDING_PATH = "/onboarding?next=/report";

export function PublicNatalCalculator({
  locale = "ka",
  acquisitionMode = false,
}: {
  locale?: UserLocale;
  acquisitionMode?: boolean;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const onboardingPath = acquisitionMode
    ? "/onboarding?fast=1&next=/report?offer=uk"
    : CALCULATOR_ONBOARDING_PATH;
  const signupHref = `/signup?next=${encodeURIComponent(onboardingPath)}`;
  const loginHref = `/login?next=${encodeURIComponent(onboardingPath)}`;
  const errors = am ? ERRORS_AM : en ? ERRORS_EN : ERRORS;
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
    const url = `${window.location.origin}${am ? "/am" : ""}/nataluri-ruka?big=${sun}.${moon}.${asc}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: am
            ? "Իմ ծննդյան քարտեզը"
            : en
              ? "My birth chart"
              : "ჩემი ნატალური რუკა",
          url,
        });
        trackEvent(ANALYTICS_EVENT.natalChartShared, { method: "native" });
      } else {
        await navigator.clipboard.writeText(url);
        trackEvent(ANALYTICS_EVENT.natalChartShared, {
          method: "clipboard",
        });
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
      setError(errors.invalid_date);
      return;
    }
    const t = validateTime({ hour, minute, unknown: unknownTime });
    if (!t.ok) {
      setError(errors.invalid_time);
      return;
    }
    if (!place) {
      setError(errors.invalid_location);
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
        setError(
          errors[data.error] ??
            (am
              ? "Ինչ-որ բան սխալ ստացվեց: Խնդրում ենք կրկին փորձել:"
              : en
                ? "Something went wrong. Please try again."
                : "რაღაც ვერ მოხერხდა. სცადე ხელახლა."),
        );
        return;
      }
      setChart(data.chart as NatalChartJson);
      savePendingNatalProfile({
        dateOfBirth: date,
        timeOfBirth: t.time,
        place,
      });
      trackEvent(ANALYTICS_EVENT.natalChartComputed, {
        widget: "natal_calculator",
        exact_time: t.time ? 1 : 0,
      });
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        80,
      );
    } catch {
      setError(
        am
          ? "Ցանցային սխալ: Խնդրում ենք կրկին փորձել:"
          : en
            ? "Network error. Please try again."
            : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
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
            <Label>
              {am ? "Ծննդյան ամսաթիվ" : en ? "Birth date" : "დაბადების თარიღი"}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <NumField
                value={day}
                onChange={setDay}
                max={2}
                placeholder={am ? "Օր" : en ? "Day" : "დღე"}
                aria={am ? "Օր" : en ? "Day" : "დღე"}
              />
              <NumField
                value={month}
                onChange={setMonth}
                max={2}
                placeholder={am ? "Ամիս" : en ? "Month" : "თვე"}
                aria={am ? "Ամիս" : en ? "Month" : "თვე"}
              />
              <NumField
                value={year}
                onChange={setYear}
                max={4}
                placeholder={am ? "Տարի" : en ? "Year" : "წელი"}
                aria={am ? "Տարի" : en ? "Year" : "წელი"}
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {am ? "Ծննդյան ժամ" : en ? "Birth time" : "დაბადების დრო"}
              </Label>
              <button
                type="button"
                onClick={() => setUnknownTime((v) => !v)}
                className={`text-xs transition-colors ${
                  unknownTime
                    ? "text-[var(--vivida-cyan)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {unknownTime ? "✓ " : ""}
                {am
                  ? "Չգիտեմ ճշգրիտ ժամը"
                  : en
                    ? "I don't know the exact time"
                    : "არ ვიცი ზუსტი დრო"}
              </button>
            </div>
            <div
              className={`grid grid-cols-2 gap-3 ${unknownTime ? "opacity-40" : ""}`}
            >
              <NumField
                value={hour}
                onChange={setHour}
                max={2}
                placeholder={am ? "Ժամ" : en ? "Hour" : "საათი"}
                aria={am ? "Ժամ" : en ? "Hour" : "საათი"}
                disabled={unknownTime}
              />
              <NumField
                value={minute}
                onChange={setMinute}
                max={2}
                placeholder={am ? "Րոպե" : en ? "Minute" : "წუთი"}
                aria={am ? "Րոպե" : en ? "Minute" : "წუთი"}
                disabled={unknownTime}
              />
            </div>
            {unknownTime && (
              <p className="text-xs text-muted-foreground">
                {am
                  ? "Կօգտագործենք կեսօրվա 12:00-ը: Մոլորակների նշանների մեծ մասը ճշգրիտ կմնա, սակայն Ասցենդենտն ու տները կարող են տարբերվել:"
                  : en
                    ? "We'll use 12:00 noon. Most planetary signs will remain accurate, but the rising sign and houses may not be."
                    : "დროს 12:00-ად ჩავთვლით — მზე და პლანეტები ზუსტი იქნება, ამომავალი და სახლები შესაძლოა არა."}
              </p>
            )}
          </div>

          {/* Place */}
          <PlacePicker value={place} onChange={setPlace} locale={locale} />

          {error && (
            <p className="text-sm text-[var(--vivida-pink)]">{error}</p>
          )}

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
            {chart
              ? am
                ? "Կրկին հաշվարկել"
                : en
                  ? "Calculate again"
                  : "ხელახლა გამოთვლა"
              : am
                ? "Հաշվել իմ քարտեզը"
                : en
                  ? "Calculate my chart"
                  : "გამოთვალე ჩემი რუკა"}
          </Button>
        </form>
      </div>

      {/* Results */}
      {chart && (
        <div ref={resultRef} className="mt-10 scroll-mt-24 space-y-8">
          <BigThree chart={chart} locale={locale} />

          <div className="flex justify-center">
            <Button type="button" variant="outline" size="lg" onClick={share}>
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Share2 className="size-4" />
              )}
              {copied
                ? am
                  ? "Հղումը պատճենված է"
                  : en
                    ? "Link copied"
                    : "ბმული დაკოპირდა"
                : am
                  ? "Կիսվել իմ քարտեզով"
                  : en
                    ? "Share my chart"
                    : "გააზიარე ჩემი რუკა"}
            </Button>
          </div>

          <div className="mx-auto max-w-xl">
            <ChartWheel chart={chart} locale={locale} />
          </div>

          {acquisitionMode && (
            <div className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/35 bg-gradient-to-br from-[var(--vivida-violet)]/16 via-card/70 to-[var(--vivida-gold)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-9">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
                <Lock className="size-5" />
              </div>
              <h3 className="text-balance text-2xl font-semibold sm:text-3xl">
                Save your chart & unlock personal readings
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Create a free account to reveal what every placement means for
                you, then choose PRO unlimited or pay-as-you-go credits.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button asChild variant="mystic" size="lg">
                  <Link
                    href={signupHref}
                    onClick={() =>
                      trackEvent(ANALYTICS_EVENT.registerClick, {
                        widget: "uk_landing_chart",
                      })
                    }
                  >
                    Save my chart free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={loginHref}>Log in</Link>
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Free account · No card required
              </p>
            </div>
          )}

          <section>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">
              {am
                ? "Մոլորակների դիրքերը"
                : en
                  ? "Planet positions"
                  : "პლანეტების პოზიციები"}
            </h3>
            <PositionsTable chart={chart} locale={locale} />
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">
              {am ? "12 տները" : en ? "12 houses" : "12 სახლი"}
            </h3>
            <div className="rounded-2xl border border-border bg-card/50 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-xl sm:px-5">
              <HousesTable chart={chart} locale={locale} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">
              {am ? "Ասպեկտներ" : en ? "Aspects" : "ასპექტები"}
            </h3>
            <AspectCards chart={chart} locale={locale} />
          </section>

          {/* Unlock CTA */}
          {!acquisitionMode && (
            <div className="relative overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/14 via-card/65 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
                <Lock className="size-5" />
              </div>
              <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {am
                  ? "Ի՞նչ է սա նշանակում ձեզ համար:"
                  : en
                    ? "What does this mean for you?"
                    : "რას ნიშნავს ეს შენთვის?"}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-pretty text-base text-muted-foreground">
                {am
                  ? "Սրանք ձեր քարտեզի ճշգրիտ դիրքերն են: Ստեղծեք անվճար հաշիվ՝ յուրաքանչյուր մոլորակի, տան և ասպեկտի անհատական մեկնաբանությունները, AI վերլուծությունն ու ամբողջական PDF զեկույցը բացելու համար:"
                  : en
                    ? "These are the precise placements in your chart. Create a free account to unlock personal interpretations for every planet, house, and aspect, plus AI insights and a complete PDF report."
                    : "ეს არის შენი რუკის სუფთა მონაცემები. დარეგისტრირდი უფასოდ და ნახე თითოეული პლანეტის, სახლისა და ასპექტის პერსონალური ინტერპრეტაცია, AI ანალიზი და სრული PDF ანგარიში."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild variant="mystic" size="lg">
                  <Link
                    href={signupHref}
                    onClick={() =>
                      trackEvent(ANALYTICS_EVENT.registerClick, {
                        widget: "natal_calculator",
                      })
                    }
                  >
                    {am
                      ? "Ստեղծել անվճար հաշիվ"
                      : en
                        ? "Create free account"
                        : "უფასო რეგისტრაცია"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={loginHref}>
                    {am ? "Մուտք գործել" : en ? "Log in" : "შესვლა"}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Lower-friction return hook — get the daily horoscope by email
              without a full signup (the biggest lever on "nobody returns"). */}
          <HoroscopeEmailCapture
            sunSign={sunIdx}
            big={bigParam}
            locale={locale}
          />

          {/* Second-action rail — a free next step so a visitor who isn't ready
              to register still takes a 2nd action (a 2nd pageview is an engaged,
              non-bounce session) and discovers a reason to return. Personalized
              to their sun sign for relevance. */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {am
                ? "Կամ շարունակեք անվճար ուսումնասիրել"
                : en
                  ? "Or keep exploring for free"
                  : "ან განაგრძე უფასოდ"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {sunSlug && sunSign && (
                <Link
                  href={localeHref(`/zodiac/${sunSlug}`, locale)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span aria-hidden>{sunSign.symbol}</span>
                  {am
                    ? sunSign.labelAm
                    : en
                      ? sunSign.labelEn
                      : sunSign.labelKa}{" "}
                  — {am ? "ձեր նշանը" : en ? "your sign" : "შენი ნიშანი"}
                </Link>
              )}
              <Link
                href={localeHref("/horoskopi", locale)}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                {am
                  ? "Օրվա հորոսկոպ"
                  : en
                    ? "Daily horoscope"
                    : "დღის ჰოროსკოპი"}
              </Link>
              <Link
                href={localeHref("/zodiac/tavsebadoba", locale)}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                {am
                  ? "Համատեղելիություն"
                  : en
                    ? "Compatibility"
                    : "თავსებადობა"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HoroscopeEmailCapture({
  sunSign,
  big,
  locale,
}: {
  sunSign: number | undefined;
  big: string | null;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
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
            ? am
              ? "Չափազանց շատ հարցումներ: Փորձեք մի փոքր ուշ:"
              : en
                ? "Too many requests. Please try again soon."
                : "ბევრი მოთხოვნა. სცადე ცოტა ხანში."
            : (typeof data.error === "string" && data.error) ||
                (am
                  ? "Չհաջողվեց: Փորձեք կրկին:"
                  : en
                    ? "It didn't work. Please try again."
                    : "ვერ მოხერხდა. სცადე ხელახლა."),
        );
        return;
      }
      setStatus("done");
      trackEvent(ANALYTICS_EVENT.horoscopeEmailSubscribed, {
        sun_sign: sunSign,
      });
    } catch {
      setStatus("error");
      setMsg(
        am
          ? "Ցանցային սխալ: Փորձեք կրկին:"
          : en
            ? "Network error. Please try again."
            : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/8 px-5 py-4 text-center text-sm text-foreground/90 ring-1 ring-foreground/5">
        <Check className="size-4 shrink-0 text-[var(--vivida-cyan)]" />
        {am
          ? "Բաժանորդագրված եք: Առաջին հորոսկոպն ուղարկվում է ձեր էլ. հասցեին:"
          : en
            ? "Subscribed! Your first horoscope is on its way."
            : "გამოწერილია! პირველი ჰოროსკოპი უკვე იგზავნება ელფოსტაზე."}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="rounded-3xl border border-border/80 bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Mail className="size-4 text-[var(--vivida-violet)]" />
        <span>
          {am
            ? "Ստացեք օրական հորոսկոպը ձեր էլ. փոստին"
            : en
              ? "Get your daily horoscope in your inbox"
              : "მიიღე ყოველდღიური ჰოროსკოპი მეილზე"}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {am
          ? "Անվճար: Առանց սպամի: Կարող եք դադարեցնել ցանկացած պահի:"
          : en
            ? "Free forever · No spam · One-click unsubscribe."
            : "უფასოა · სპამის გარეშე · გაუქმება ნებისმიერ დროს."}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder={
            am ? "Ձեր էլ. հասցեն" : en ? "Your email address" : "შენი ელფოსტა"
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="flex-1 text-sm"
        />
        <Button
          type="submit"
          variant="mystic"
          size="default"
          disabled={status === "loading"}
          className="shrink-0"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {am ? "Բաժանորդագրվել" : en ? "Subscribe" : "გამოწერა"}
        </Button>
      </div>
      {msg && (
        <p
          className={`mt-2 text-xs ${
            status === "error"
              ? "text-[var(--vivida-pink)]"
              : "text-muted-foreground"
          }`}
        >
          {msg}
        </p>
      )}
    </form>
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
      onChange={(e) =>
        onChange(e.target.value.replace(/\D/g, "").slice(0, max))
      }
      className="text-center text-base tabular-nums"
    />
  );
}

function BigThree({
  chart,
  locale,
}: {
  chart: NatalChartJson;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const items: {
    label: string;
    glyph: string;
    point: PointJson | undefined;
  }[] = [
    {
      label: am ? "Արև" : en ? "Sun" : "მზე",
      glyph: "☉",
      point: chart.bodies.sun,
    },
    {
      label: am ? "Լուսին" : en ? "Moon" : "მთვარე",
      glyph: "☽",
      point: chart.bodies.moon,
    },
    {
      label: am ? "Ասցենդենտ" : en ? "Rising" : "ამომავალი",
      glyph: "AC",
      point: chart.ascendant,
    },
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
                {am ? sign.labelAm : en ? sign.labelEn : sign.labelKa}
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
  locale,
}: {
  value: GeocodeResult | null;
  onChange: (v: GeocodeResult | null) => void;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const am = locale === "am";
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
        const res = await fetch(
          `/api/public/geocode?q=${encodeURIComponent(trimmed)}`,
          {
            signal: ctrl.signal,
          },
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
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="space-y-2" ref={wrapRef}>
      <Label htmlFor="calc-place">
        {am ? "Ծննդավայր քաղաք" : en ? "Birth city" : "დაბადების ქალაქი"}
      </Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="calc-place"
          placeholder={
            am
              ? "Երևան, Գյումրի, Վանաձոր…"
              : en
                ? "London, Paris, New York…"
                : "თბილისი, ბათუმი, ქუთაისი…"
          }
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
            aria-label={am ? "Մաքրել" : en ? "Clear" : "წაშლა"}
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
