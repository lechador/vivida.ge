"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { USERNAME_PATTERN, suggestUsername } from "@/lib/profile-utils";
import type { VisibilityValue } from "./types";

export function StepVisibility({
  value,
  onChange,
  defaultName,
}: {
  value: VisibilityValue;
  onChange: (next: VisibilityValue) => void;
  defaultName: string | null;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          საჯარო პროფილი?
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          საჯარო პროფილით სხვებიც დაინახავენ შენს დიდ სამეულს და ვინც
          გესტუმრება — ნახავს თქვენი თავსებადობას. შეცვლა ნებისმიერ დროს
          შეიძლება ანგარიშის გვერდიდან.
        </p>
      </header>

      <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              isPublic: false,
            })
          }
          className={cn(
            "group flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-all",
            !value.isPublic
              ? "border-[var(--vivida-violet)]/50 bg-gradient-to-br from-[var(--vivida-violet)]/15 to-transparent ring-1 ring-foreground/10"
              : "border-border bg-card/40 hover:bg-card/60"
          )}
        >
          <EyeOff
            className={cn(
              "size-7",
              !value.isPublic
                ? "text-[var(--vivida-violet)]"
                : "text-muted-foreground"
            )}
          />
          <div className="text-base font-medium">პირადი</div>
          <div className="text-xs text-muted-foreground">მხოლოდ შენ ხედავ</div>
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              isPublic: true,
              username: value.username || suggestUsername(defaultName),
            })
          }
          className={cn(
            "group flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-all",
            value.isPublic
              ? "border-[var(--vivida-cyan)]/50 bg-gradient-to-br from-[var(--vivida-cyan)]/15 to-[var(--vivida-violet)]/15 ring-1 ring-foreground/10"
              : "border-border bg-card/40 hover:bg-card/60"
          )}
        >
          <Eye
            className={cn(
              "size-7",
              value.isPublic
                ? "text-[var(--vivida-cyan)]"
                : "text-muted-foreground"
            )}
          />
          <div className="text-base font-medium">საჯარო</div>
          <div className="text-xs text-muted-foreground">
            ხილვადი მეგობრებისთვის
          </div>
        </button>
      </div>

      {value.isPublic && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-md space-y-2"
        >
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
                  ...value,
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
        </motion.div>
      )}
    </div>
  );
}

export function validateVisibility(value: VisibilityValue): boolean {
  if (!value.isPublic) return true;
  return USERNAME_PATTERN.test(value.username);
}
