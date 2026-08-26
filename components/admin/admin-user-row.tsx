"use client";

import Link from "next/link";
import { BadgeCheck, Gift, Loader2, MailWarning, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  grantVerifiedBadge,
  revokeVerifiedBadge,
} from "@/actions/admin-users";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { Button } from "@/components/ui/button";

export type AdminUserRowData = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  createdAt: Date;
  verifiedBadgeGrantedAt: Date | null;
  verifiedBadgeGrantedBy: string | null;
  verifiedBadgeEmailSentAt: Date | null;
};

export function AdminUserRow({
  user,
  premiumActive,
}: {
  user: AdminUserRowData;
  premiumActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const manual = Boolean(user.verifiedBadgeGrantedAt);

  function grant() {
    startTransition(async () => {
      const result = await grantVerifiedBadge(user.id);
      alert(result.ok ? result.message : result.error);
      router.refresh();
    });
  }

  function revoke() {
    if (!confirm("მოვხსნა ამ მომხმარებლისთვის ხელით მინიჭებული Verified Badge?")) return;
    startTransition(async () => {
      const result = await revokeVerifiedBadge(user.id);
      alert(result.ok ? result.message : result.error);
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{user.name ?? "უსახელო"}</span>
            {(manual || premiumActive) && <VerifiedBadge />}
            {user.username && (
              <Link
                href={`/u/${user.username}`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                @{user.username}
              </Link>
            )}
          </div>
          <div className="mt-1 break-all text-xs text-muted-foreground">
            {user.email ?? "ელფოსტის გარეშე"}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {premiumActive && (
              <span className="rounded-full bg-[var(--vivida-violet)]/15 px-2 py-1 text-[var(--vivida-violet)]">
                Premium badge
              </span>
            )}
            {manual && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--vivida-cyan)]/12 px-2 py-1 text-[var(--vivida-cyan)]">
                <BadgeCheck className="size-3" /> ხელით მინიჭებული
              </span>
            )}
            {manual && user.verifiedBadgeEmailSentAt && (
              <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-emerald-400">
                მეილი გაგზავნილია
              </span>
            )}
            {manual && !user.verifiedBadgeEmailSentAt && user.email && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-1 text-amber-300">
                <MailWarning className="size-3" /> მეილი გასაგზავნია
              </span>
            )}
          </div>
          {manual && user.verifiedBadgeGrantedAt && (
            <div className="mt-2 text-[10px] text-muted-foreground/70">
              {user.verifiedBadgeGrantedAt.toLocaleString("ka-GE")} · {user.verifiedBadgeGrantedBy ?? "admin"}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!manual ? (
            <Button type="button" size="sm" variant="mystic" onClick={grant} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Gift />}
              {premiumActive ? "მუდმივად აჩუქე" : "აჩუქე badge"}
            </Button>
          ) : !user.verifiedBadgeEmailSentAt && user.email ? (
            <Button type="button" size="sm" variant="outline" onClick={grant} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
              მეილის გამეორება
            </Button>
          ) : null}
          {manual && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={revoke}
              disabled={pending}
              aria-label="ხელით მინიჭებული badge-ის მოხსნა"
              className="text-muted-foreground hover:text-destructive"
            >
              {pending ? <Loader2 className="animate-spin" /> : <X />}
              მოხსნა
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
