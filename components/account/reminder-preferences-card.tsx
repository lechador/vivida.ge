"use client";

import { useMemo, useState, useTransition } from "react";
import {
  BellRing,
  CalendarDays,
  Check,
  Copy,
  Heart,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  regenerateReminderCalendar,
  updateReminderPreferences,
} from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { ReminderPreferences } from "@/lib/reminder-config";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import { useExperiment } from "@/lib/use-experiment";
import { cn } from "@/lib/utils";

const WEEKDAYS = {
  ka: [
    "კვირა",
    "ორშაბათი",
    "სამშაბათი",
    "ოთხშაბათი",
    "ხუთშაბათი",
    "პარასკევი",
    "შაბათი",
  ],
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  am: [
    "Կիրակի",
    "Երկուշաբթի",
    "Երեքշաբթի",
    "Չորեքշաբթի",
    "Հինգշաբթի",
    "Ուրբաթ",
    "Շաբաթ",
  ],
};

export function ReminderPreferencesCard({
  initial,
  initialCalendarToken,
  locale,
}: {
  initial: ReminderPreferences;
  initialCalendarToken: string | null;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [prefs, setPrefs] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [calendarToken, setCalendarToken] = useState(initialCalendarToken);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dirty = JSON.stringify(prefs) !== JSON.stringify(baseline);
  const calendarPath = calendarToken ? `/api/calendar/${calendarToken}` : null;
  const promptVariant = useExperiment(
    EXPERIMENTS.reminderPrompt,
    "account_reminder_settings",
  );

  const topics = useMemo(
    () => [
      {
        key: "transit" as const,
        icon: Sparkles,
        title: en ? "Important transits" : "მნიშვნელოვანი ტრანზიტები",
        subtitle: en
          ? "Meaningful timing windows in your personal chart."
          : "შენი რუკის მნიშვნელოვანი დროითი ფანჯრები.",
        pushKey: "transitPush" as const,
        emailKey: "transitEmail" as const,
      },
      {
        key: "forecast" as const,
        icon: CalendarDays,
        title: en ? "Weekly forecast" : "ყოველკვირეული პროგნოზი",
        subtitle: en
          ? "A personal prompt for planning the week ahead."
          : "პერსონალური მინიშნება მომდევნო კვირის დასაგეგმად.",
        pushKey: "forecastPush" as const,
        emailKey: "forecastEmail" as const,
      },
      {
        key: "relationship" as const,
        icon: Heart,
        title: en ? "Relationship updates" : "ურთიერთობის განახლებები",
        subtitle: en
          ? "Only for relationships you enable on their own page."
          : "მხოლოდ იმ ურთიერთობებისთვის, რომლებსაც ცალკე ჩართავ.",
        pushKey: "relationshipPush" as const,
        emailKey: "relationshipEmail" as const,
      },
    ],
    [en],
  );

  const save = () =>
    startTransition(async () => {
      const result = await updateReminderPreferences(prefs);
      setPrefs(result.preferences);
      setBaseline(result.preferences);
      setCalendarToken(result.calendarToken);
      setSaved(true);
    });

  const regenerate = () =>
    startTransition(async () => {
      const result = await regenerateReminderCalendar();
      setCalendarToken(result.calendarToken);
      setPrefs((current) => ({ ...current, calendarEnabled: true }));
      setBaseline((current) => ({ ...current, calendarEnabled: true }));
      setSaved(true);
    });

  const copyCalendar = async () => {
    if (!calendarPath) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}${calendarPath}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-5 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-violet)]/12 text-[var(--vivida-violet)]">
          <BellRing className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {en ? "Personal reminders" : "პერსონალური შეხსენებები"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {promptVariant === "benefit_first"
              ? en
                ? "Receive the moments that matter in your chart, at the time and channel you choose."
                : "მიიღე შენი რუკის მნიშვნელოვანი მომენტები სწორ დროს, შენს არჩეულ არხში."
              : en
                ? "Choose the topic, channel and your local delivery time."
                : "აირჩიე თემა, არხი და შენს ადგილობრივ დროზე მიწოდების საათი."}
          </p>
        </div>
      </header>

      <div className="space-y-3">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <div
              key={topic.key}
              className="rounded-xl border border-border/70 bg-background/25 p-4"
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-[var(--vivida-cyan)]" />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium">{topic.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {topic.subtitle}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ChannelButton
                  icon={BellRing}
                  label="Push"
                  checked={prefs[topic.pushKey]}
                  onClick={() =>
                    setPrefs((current) => ({
                      ...current,
                      [topic.pushKey]: !current[topic.pushKey],
                    }))
                  }
                />
                <ChannelButton
                  icon={Mail}
                  label={en ? "Email" : "ელფოსტა"}
                  checked={prefs[topic.emailKey]}
                  onClick={() =>
                    setPrefs((current) => ({
                      ...current,
                      [topic.emailKey]: !current[topic.emailKey],
                    }))
                  }
                />
              </div>
              {topic.key === "transit" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{en ? "Frequency" : "სიხშირე"}</span>
                  <select
                    value={prefs.transitCadence}
                    onChange={(event) =>
                      setPrefs((current) => ({
                        ...current,
                        transitCadence:
                          event.target.value === "daily" ? "daily" : "weekly",
                      }))
                    }
                    className="h-9 rounded-lg border border-border bg-background px-2 text-foreground"
                  >
                    <option value="weekly">
                      {en ? "Weekly" : "კვირაში ერთხელ"}
                    </option>
                    <option value="daily">
                      {en ? "Daily when relevant" : "ყოველდღე, როცა აქტუალურია"}
                    </option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          <span className="mb-1.5 block">
            {en ? "Delivery hour" : "მიწოდების საათი"}
          </span>
          <select
            value={prefs.localHour}
            onChange={(event) =>
              setPrefs((current) => ({
                ...current,
                localHour: Number(event.target.value),
              }))
            }
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          <span className="mb-1.5 block">
            {en ? "Weekly reminder day" : "კვირეული შეხსენების დღე"}
          </span>
          <select
            value={prefs.weeklyDay}
            onChange={(event) =>
              setPrefs((current) => ({
                ...current,
                weeklyDay: Number(event.target.value),
              }))
            }
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            {WEEKDAYS[locale].map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/6 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4 text-[var(--vivida-cyan)]" />
              {en ? "Calendar sync" : "კალენდართან სინქრონიზაცია"}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {en
                ? "A private calendar link with your notable 90-day transits. Add it to Apple, Google or Outlook Calendar."
                : "პირადი კალენდრის ბმული მომდევნო 90 დღის მნიშვნელოვანი ტრანზიტებით — Apple, Google ან Outlook Calendar-ისთვის."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.calendarEnabled}
            onClick={() =>
              setPrefs((current) => ({
                ...current,
                calendarEnabled: !current.calendarEnabled,
              }))
            }
            className={cn(
              "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
              prefs.calendarEnabled ? "bg-[var(--vivida-cyan)]" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform",
                prefs.calendarEnabled ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
        {prefs.calendarEnabled && calendarPath && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copyCalendar}
            >
              {copied ? <Check /> : <Copy />}
              {copied
                ? en
                  ? "Copied"
                  : "დაკოპირდა"
                : en
                  ? "Copy private link"
                  : "პირადი ბმულის კოპირება"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={regenerate}
              disabled={isPending}
            >
              <RefreshCw />
              {en ? "Reset link" : "ბმულის განახლება"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {saved && !dirty && (en ? "Saved ✓" : "შენახულია ✓")}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!dirty || isPending}
        >
          {isPending && <Loader2 className="animate-spin" />}
          {en ? "Save reminders" : "შეხსენებების შენახვა"}
        </Button>
      </div>
    </section>
  );
}

function ChannelButton({
  icon: Icon,
  label,
  checked,
  onClick,
}: {
  icon: typeof BellRing;
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
        checked
          ? "border-[var(--vivida-violet)]/45 bg-[var(--vivida-violet)]/12 text-foreground"
          : "border-border bg-background/35 text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {label}
      {checked && <Check className="size-3.5" />}
    </button>
  );
}
