"use client";

import { useState, useTransition } from "react";
import { BellRing, CalendarDays, Check, Copy, Link2, Loader2 } from "lucide-react";

import {
  createRelationshipInvite,
  updateRelationshipSubscription,
} from "@/actions/relationships";
import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { RelationshipSubscription } from "@/lib/relationship-core";
import { cn } from "@/lib/utils";

export function RelationshipControls({
  partnerId,
  partnerName,
  isOwner,
  connected,
  initialSubscription,
  locale,
}: {
  partnerId: string;
  partnerName: string;
  isOwner: boolean;
  connected: boolean;
  initialSubscription: RelationshipSubscription;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [subscription, setSubscription] = useState(initialSubscription);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const createInvite = () => startTransition(async () => {
    setMessage(null);
    const result = await createRelationshipInvite(partnerId);
    if (!result.ok) return setMessage(result.error);
    const url = `${window.location.origin}${result.path}`;
    setInviteUrl(url);
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  });

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const toggle = (key: keyof RelationshipSubscription) => {
    const next = { ...subscription, [key]: !subscription[key] };
    setSubscription(next);
    startTransition(async () => {
      const result = await updateRelationshipSubscription(partnerId, next);
      if (!result.ok) {
        setSubscription(subscription);
        setMessage(result.error);
      } else {
        setMessage(null);
      }
    });
  };

  return (
    <section className="mb-8 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-2xl border border-border/70 bg-card/65 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-pink)]/10 text-[var(--vivida-pink)]">
            <Link2 className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              {connected
                ? en ? "Partner connected" : "პარტნიორი დაკავშირებულია"
                : en ? "Experience it together" : "გამოიარეთ ერთად"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {connected
                ? en ? `You and ${partnerName} can answer the weekly questions together.` : `შენ და ${partnerName} ყოველკვირეულ კითხვებს ერთად უპასუხებთ.`
                : en ? `Invite ${partnerName} with a private link. They will not pay for this unlocked relationship.` : `მოიწვიე ${partnerName} პირადი ბმულით, ამ უკვე გახსნილ ურთიერთობაზე კრედიტს აღარ გადაიხდის.`}
            </p>
            {isOwner && !connected && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="mystic" onClick={inviteUrl ? copyInvite : createInvite} disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : copied ? <Check /> : inviteUrl ? <Copy /> : <Link2 />}
                  {copied ? (en ? "Copied" : "დაკოპირდა") : inviteUrl ? (en ? "Copy invite" : "მოწვევის კოპირება") : (en ? "Invite partner" : "პარტნიორის მოწვევა")}
                </Button>
                {inviteUrl && (
                  <input
                    readOnly
                    value={inviteUrl}
                    aria-label={en ? "Private invitation link" : "პირადი მოწვევის ბმული"}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-3 text-xs text-muted-foreground"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/65 p-4 backdrop-blur-xl sm:p-5">
        <h2 className="font-semibold">{en ? "Relationship notifications" : "ურთიერთობის შეტყობინებები"}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {en ? "Off by default. These settings only apply to you." : "თავიდან გამორთულია და მხოლოდ შენს ანგარიშზე მოქმედებს."}
        </p>
        <div className="mt-3 space-y-2">
          <NotificationToggle
            icon={CalendarDays}
            label={en ? "New weekly update" : "ახალი ყოველკვირეული განახლება"}
            checked={subscription.weeklyEnabled}
            disabled={isPending}
            onClick={() => toggle("weeklyEnabled")}
          />
          <NotificationToggle
            icon={BellRing}
            label={en ? "Important relationship transits" : "ურთიერთობის მნიშვნელოვანი ტრანზიტები"}
            checked={subscription.transitEnabled}
            disabled={isPending}
            onClick={() => toggle("transitEnabled")}
          />
        </div>
      </div>
      {message && <p className="text-sm text-destructive lg:col-span-2">{message}</p>}
    </section>
  );
}

function NotificationToggle({
  icon: Icon,
  label,
  checked,
  disabled,
  onClick,
}: {
  icon: typeof CalendarDays;
  label: string;
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/35 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/10 disabled:opacity-60"
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1">{label}</span>
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-[var(--vivida-violet)]" : "bg-muted")}>
        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
