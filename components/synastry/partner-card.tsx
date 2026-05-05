"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { softDeletePartner } from "@/actions/partners";
import { cn } from "@/lib/utils";

/**
 * Saved-partner row on /synastry. Click → /synastry/[id]; trash → soft delete.
 * Soft delete is intentional — the row stays in the DB so the monthly
 * creation cap remains non-gameable, but the user sees the partner gone.
 */
export function PartnerCard({
  id,
  name,
  cityName,
  dateOfBirth,
}: {
  id: string;
  name: string;
  cityName: string;
  dateOfBirth: string;
}) {
  const [isPending, startTransition] = useTransition();

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`წავშალოთ ${name}?`)) return;
    startTransition(async () => {
      await softDeletePartner(id);
    });
  };

  return (
    <Link
      href={`/synastry/${id}`}
      className={cn(
        "group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:border-foreground/15 hover:bg-card/80",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-32 rounded-full bg-[radial-gradient(circle,var(--vivida-pink)_0%,transparent_70%)] opacity-25 blur-2xl transition-opacity group-hover:opacity-40"
      />
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--vivida-violet)]/30 to-[var(--vivida-pink)]/30 text-base font-semibold text-foreground/90 ring-1 ring-foreground/10">
        {name.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold tracking-tight">
          {name}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {dateOfBirth} · {cityName}
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="relative grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label={`წაშლა — ${name}`}
        title="წაშლა"
      >
        <Trash2 className="size-4" />
      </button>
    </Link>
  );
}
