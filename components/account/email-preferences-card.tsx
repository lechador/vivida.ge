"use client";

import { useState, useTransition } from "react";
import { Mail, Sparkles, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateEmailPreferences } from "@/actions/email-preferences";
import { cn } from "@/lib/utils";

type Prefs = { daily: boolean; marketing: boolean; nudges: boolean };

export function EmailPreferencesCard({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    prefs.daily !== initial.daily ||
    prefs.marketing !== initial.marketing ||
    prefs.nudges !== initial.nudges;

  const onSave = () => {
    startTransition(async () => {
      await updateEmailPreferences(prefs);
      setSavedAt(Date.now());
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-5">
        <h2 className="text-lg font-semibold">ელფოსტის შეტყობინებები</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          აირჩიე, რა ტიპის წერილები გინდა მიიღო vivida.ge-დან.
        </p>
      </header>

      <div className="space-y-3">
        <ToggleRow
          icon={<Sparkles className="size-5" />}
          title="ყოველდღიური ჰოროსკოპი"
          subtitle="დილით — შენი დღევანდელი მცირე ანალიზი ელფოსტაზე."
          on={prefs.daily}
          onChange={(v) => setPrefs((p) => ({ ...p, daily: v }))}
        />
        <ToggleRow
          icon={<UserPlus className="size-5" />}
          title="შეხსენებები"
          subtitle="თუ შენი დაბადების მონაცემები არ შეგივსია — გეტყვი, რომ გააქტიურო."
          on={prefs.nudges}
          onChange={(v) => setPrefs((p) => ({ ...p, nudges: v }))}
        />
        <ToggleRow
          icon={<Mail className="size-5" />}
          title="სიახლეები და სარეკლამო წერილები"
          subtitle="ახალი ფუნქციები, აქციები და მოსაწვევები."
          on={prefs.marketing}
          onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {savedAt && !isPending && !dirty && "შენახულია ✓"}
        </div>
        <Button
          type="button"
          onClick={onSave}
          disabled={isPending || !dirty}
          size="sm"
        >
          {isPending ? "ინახება…" : "შენახვა"}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all",
        on
          ? "border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/10 to-[var(--vivida-cyan)]/10"
          : "border-border bg-card/40 hover:bg-card/60"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "shrink-0 rounded-lg p-2",
            on
              ? "bg-[var(--vivida-cyan)]/15 text-[var(--vivida-cyan)]"
              : "bg-card/80 text-muted-foreground"
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <div
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on
            ? "bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))]"
            : "bg-card/80"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-background shadow-md transition-all",
            on ? "left-5" : "left-0.5"
          )}
        />
      </div>
    </button>
  );
}
