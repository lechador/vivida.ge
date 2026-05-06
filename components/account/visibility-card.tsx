"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVisibility } from "@/actions/profile";
import { suggestUsername, USERNAME_PATTERN } from "@/lib/profile-utils";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/pricing";

export function VisibilityCard({
  initial,
  defaultName,
  plan,
}: {
  initial: {
    isPublic: boolean;
    username: string | null;
    displayName: string | null;
    bio: string | null;
  };
  /** Current user's name from auth — used as a starter for displayName */
  defaultName: string | null;
  /** Effective plan — "free" disables the public→private toggle. */
  plan: PlanId;
}) {
  const [isPublic, setIsPublic] = useState(initial.isPublic);
  // Free users can't switch a public profile to private. Legacy already-
  // private profiles (from a past Pro period) keep the toggle so they
  // can opt back into public if they want.
  const canMakePrivate = plan === "pro" || !initial.isPublic;
  const [username, setUsername] = useState(initial.username ?? "");
  const [displayName, setDisplayName] = useState(
    initial.displayName ?? defaultName ?? ""
  );
  const [bio, setBio] = useState(initial.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const usernameInvalid =
    isPublic && username.length > 0 && !USERNAME_PATTERN.test(username);

  const onTogglePublic = () => {
    const next = !isPublic;
    if (!next && !canMakePrivate) {
      // Public → private is Pro-only. Surface the lock inline rather than
      // letting them flip and then have the server reject.
      setError(
        "პირადი პროფილი მხოლოდ Pro გეგმაშია ხელმისაწვდომი."
      );
      return;
    }
    setIsPublic(next);
    if (next && !username) {
      setUsername(suggestUsername(defaultName));
    }
    setError(null);
  };

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateVisibility({
        isPublic,
        username: username || null,
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
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">საჯარო პროფილი</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ჩართე საჯარო პროფილი, რომ სხვებმა ნახონ შენი დიდი სამეული, და
            ვინც გესტუმრება — დაინახოს თქვენი თავსებადობა.
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isPublic
              ? "border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]"
              : "border-border bg-card/60 text-muted-foreground"
          )}
        >
          {isPublic ? "საჯარო" : "პირადი"}
        </span>
      </header>

      <button
        type="button"
        onClick={onTogglePublic}
        className={cn(
          "group relative flex w-full items-center justify-between gap-3 rounded-xl border p-4 transition-all",
          isPublic
            ? "border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/12"
            : "border-border bg-card/40 hover:bg-card/60"
        )}
      >
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Eye className="size-5 text-[var(--vivida-cyan)]" />
          ) : (
            <EyeOff className="size-5 text-muted-foreground" />
          )}
          <div className="text-left">
            <div className="text-base font-medium">
              {isPublic ? "პროფილი ხილვადია" : "პროფილი დამალულია"}
            </div>
            <div className="text-xs text-muted-foreground">
              {isPublic
                ? "ვინც ბმულს მიიღებს, ნახავს შენს ცის რუკას და გითავსდებით"
                : "შენ ხარ ერთადერთი, ვინც ხედავს შენს მონაცემებს"}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!canMakePrivate && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-pink)]"
              title="პირადი პროფილი მხოლოდ Pro გეგმაშია"
            >
              <Sparkles className="size-3" />
              Pro
            </span>
          )}
          <div
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isPublic
                ? "bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))]"
                : "bg-card/80",
              !canMakePrivate && "opacity-60"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-background shadow-md transition-all",
                isPublic ? "left-5" : "left-0.5"
              )}
            />
          </div>
        </div>
      </button>

      {isPublic && (
        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">მომხმარებლის სახელი</Label>
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
                3-24 სიმბოლო, მხოლოდ a-z, 0-9 და _
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                მხოლოდ a-z, 0-9 და _ (3-24 სიმბოლო)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="display-name">ნაჩვენები სახელი</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              placeholder="ანა"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">ბიო</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="მოკლე ერთი ფრაზა შენზე…"
              className="w-full rounded-lg border border-border bg-input/40 px-4 py-2 text-base ring-offset-background backdrop-blur-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <div className="text-right text-xs text-muted-foreground">
              {bio.length}/280
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {savedAt && !isPending && "შენახულია ✓"}
        </div>
        <div className="flex items-center gap-2">
          {isPublic && initial.username && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/u/${initial.username}`}>
                <ExternalLink className="size-3.5" />
                ნახე პროფილი
              </Link>
            </Button>
          )}
          <Button
            type="button"
            onClick={onSave}
            disabled={isPending || (isPublic && (!username || usernameInvalid))}
            size="sm"
          >
            {isPending ? "ინახება…" : "შენახვა"}
          </Button>
        </div>
      </div>
    </div>
  );
}
