"use client";

import { Label } from "@/components/ui/label";
import { USERNAME_PATTERN } from "@/lib/profile-utils";
import type { VisibilityValue } from "./types";

export function StepVisibility({
  value,
  onChange,
}: {
  value: VisibilityValue;
  onChange: (next: VisibilityValue) => void;
  defaultName: string | null;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          აირჩიე სახელი
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          ეს სახელი იქნება შენი პროფილის ბმული — vivida.ge/u/{value.username || "you"}.
          მის გარეშე სხვები ვერ აღმოგაჩენენ.
        </p>
      </header>

      <div className="mx-auto max-w-md space-y-2">
        <Label htmlFor="onb-username">მომხმარებლის სახელი</Label>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-input/40 transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring">
          <span className="flex select-none items-center bg-card/60 px-3 text-sm text-muted-foreground">
            vivida.ge/u/
          </span>
          <input
            id="onb-username"
            value={value.username}
            onChange={(e) =>
              onChange({
                username: e.target.value
                  .toLowerCase()
                  .replace(/\s/g, ""),
              })
            }
            maxLength={24}
            autoComplete="off"
            className="flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3-24 სიმბოლო — მხოლოდ a-z, 0-9 და _
        </p>
      </div>
    </div>
  );
}

export function validateVisibility(value: VisibilityValue): boolean {
  return USERNAME_PATTERN.test(value.username);
}
