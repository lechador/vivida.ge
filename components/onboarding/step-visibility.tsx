"use client";

import { Label } from "@/components/ui/label";
import { USERNAME_PATTERN } from "@/lib/profile-utils";
import type { VisibilityValue } from "./types";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function StepVisibility({
  value,
  onChange,
  locale = "ka",
}: {
  value: VisibilityValue;
  onChange: (next: VisibilityValue) => void;
  defaultName: string | null;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {am ? "Ընտրեք օգտանուն" : en ? "Choose a username" : "აირჩიე სახელი"}
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {en
            ? `This becomes your profile link—vividaastro.com/u/${value.username || "you"}. It helps other people find you.`
            : `ეს სახელი იქნება შენი პროფილის ბმული — vivida.ge/u/${value.username || "you"}. მის გარეშე სხვები ვერ აღმოგაჩენენ.`}
        </p>
      </header>

      <div className="mx-auto max-w-md space-y-2">
        <Label htmlFor="onb-username">{am ? "Օգտանուն" : en ? "Username" : "მომხმარებლის სახელი"}</Label>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-input/40 transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring">
          <span className="flex select-none items-center bg-card/60 px-3 text-sm text-muted-foreground">
            {en ? "vividaastro.com/u/" : "vivida.ge/u/"}
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
          {am ? "3–24 նիշ՝ միայն a–z, 0–9 և _" : en ? "3–24 characters—only a–z, 0–9 and _" : "3-24 სიმბოლო — მხოლოდ a-z, 0-9 და _"}
        </p>
      </div>
    </div>
  );
}

export function validateVisibility(value: VisibilityValue): boolean {
  return USERNAME_PATTERN.test(value.username);
}
