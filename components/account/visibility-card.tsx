"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileFields } from "@/actions/profile";
import { suggestUsername, USERNAME_PATTERN } from "@/lib/profile-utils";

export function VisibilityCard({
  initial,
  defaultName,
}: {
  initial: {
    username: string | null;
    displayName: string | null;
    bio: string | null;
  };
  /** Current user's name from auth — used as a starter for displayName */
  defaultName: string | null;
}) {
  const [username, setUsername] = useState(
    initial.username ?? suggestUsername(defaultName)
  );
  const [displayName, setDisplayName] = useState(
    initial.displayName ?? defaultName ?? ""
  );
  const [bio, setBio] = useState(initial.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

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
        <h2 className="text-lg font-semibold">საჯარო პროფილი</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          აირჩიე მომხმარებლის სახელი, ნაჩვენები სახელი და ბიო — სხვები
          ნახავენ შენს დიდ სამეულს და თქვენი თავსებადობა გამოჩნდება.
        </p>
      </header>

      <div className="space-y-4">
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
          {initial.username && (
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
            disabled={isPending || !username || usernameInvalid}
            size="sm"
          >
            {isPending ? "ინახება…" : "შენახვა"}
          </Button>
        </div>
      </div>
    </div>
  );
}
