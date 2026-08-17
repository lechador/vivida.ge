"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDiscoverable, updateProfileFields } from "@/actions/profile";
import { suggestUsername, USERNAME_PATTERN } from "@/lib/profile-utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function VisibilityCard({
  initial,
  defaultName,
  locale = "ka",
}: {
  initial: {
    username: string | null;
    displayName: string | null;
    bio: string | null;
    discoverable: boolean;
  };
  /** Current user's name from auth — used as a starter for displayName */
  defaultName: string | null;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const [username, setUsername] = useState(
    initial.username ?? suggestUsername(defaultName)
  );
  const [displayName, setDisplayName] = useState(
    initial.displayName ?? defaultName ?? ""
  );
  const [bio, setBio] = useState(initial.bio ?? "");
  const [discoverable, setDiscoverableState] = useState(initial.discoverable);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();

  // Instant-save toggle (independent from the Save button) — optimistic,
  // reverts on failure.
  const onToggleDiscoverable = () => {
    const next = !discoverable;
    setDiscoverableState(next);
    startToggleTransition(async () => {
      try {
        await setDiscoverable(next);
      } catch {
        setDiscoverableState(!next);
      }
    });
  };

  const usernameInvalid =
    username.length > 0 && !USERNAME_PATTERN.test(username);

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateProfileFields({
        username,
        displayName: displayName || null,
        bio: bio || null,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSavedAt(Date.now());
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-5">
        <h2 className="text-lg font-semibold">{am ? "Հանրային պրոֆիլ" : en ? "Public profile" : "საჯარო პროფილი"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {en
            ? "Choose a username, display name and bio. Other people can see your big three and your shared compatibility."
            : "აირჩიე მომხმარებლის სახელი, ნაჩვენები სახელი და ბიო — სხვები ნახავენ შენს დიდ სამეულს და თქვენი თავსებადობა გამოჩნდება."}
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">{am ? "Օգտանուն" : en ? "Username" : "მომხმარებლის სახელი"}</Label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-input/40 transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring">
            <span className="flex select-none items-center bg-card/60 px-3 text-sm text-muted-foreground">
              vivida.ge/u/
            </span>
            <input
              id="username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
              }
              placeholder="anna_2003"
              maxLength={24}
              className="flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          {usernameInvalid ? (
            <p className="text-xs text-destructive">
              {am ? "3–24 նիշ; օգտագործել միայն a–z, 0–9 և _" : en ? "3–24 characters; use only a–z, 0–9 and _" : "3-24 სიმბოლო, მხოლოდ a-z, 0-9 და _"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {am ? "Միայն a–z, 0–9 և _ (3–24 նիշ)" : en ? "Only a–z, 0–9 and _ (3–24 characters)" : "მხოლოდ a-z, 0-9 და _ (3-24 სიმბოლო)"}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="display-name">{am ? "Ցուցադրվող անուն" : en ? "Display name" : "ნაჩვენები სახელი"}</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            placeholder={am ? "Աննա" : en ? "Anna" : "ანა"}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">{am ? "Կենսագրություն" : en ? "Bio" : "ბიო"}</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 280))}
            rows={3}
            placeholder={am ? "Մի կարճ նախադասություն ձեր մասին…" : en ? "A short sentence about you…" : "მოკლე ერთი ფრაზა შენზე…"}
            className="w-full rounded-lg border border-border bg-input/40 px-4 py-2 text-base ring-offset-background backdrop-blur-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <div className="text-right text-xs text-muted-foreground">
            {bio.length}/280
          </div>
        </div>

        {/* Discovery opt-out — saves instantly, no Save button needed */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-card/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">{am ? "Հայտնաբերելիություն" : am ? "Հայտնաբերելիություն" : en ? "Discoverability" : "აღმოჩენადობა"}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {en
                ? "Appear in People, search and suggestions. When disabled, your profile remains available only through its direct link."
                : "გამოჩნდე „ხალხის“ გვერდზე, ძიებასა და შემოთავაზებებში. გამორთვის შემთხვევაში შენი პროფილი მხოლოდ პირდაპირი ბმულით იქნება ხელმისაწვდომი."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={discoverable}
            aria-label={en ? "Discoverability" : "აღმოჩენადობა"}
            onClick={onToggleDiscoverable}
            disabled={isTogglePending}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
              discoverable
                ? "bg-[var(--vivida-violet)]"
                : "bg-foreground/15"
            } ${isTogglePending ? "opacity-60" : ""}`}
          >
            <span
              aria-hidden
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${
                discoverable ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {savedAt && !isPending && (am ? "Պահպանված է ✓" : en ? "Saved ✓" : "შენახულია ✓")}
        </div>
        <div className="flex items-center gap-2">
          {initial.username && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/u/${initial.username}`}>
                <ExternalLink className="size-3.5" />
                {am ? "Դիտել պրոֆիլը" : en ? "View profile" : "ნახე პროფილი"}
              </Link>
            </Button>
          )}
          <Button
            type="button"
            onClick={onSave}
            disabled={isPending || !username || usernameInvalid}
            size="sm"
          >
            {isPending ? (am ? "Պահպանվում է…" : en ? "Saving…" : "ინახება…") : (am ? "Պահպանել" : en ? "Save" : "შენახვა")}
          </Button>
        </div>
      </div>
    </div>
  );
}
