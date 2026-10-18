"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Crown,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/actions/auth";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  featuredPremiumPlanForCountry,
  formatBillingAmount,
  shouldShowPurchasePromotion,
} from "@/lib/billing-config";

export function UserMenu({
  name,
  email,
  image,
  username,
  balance,
  isPremium = false,
  countryCode,
  locale = "ka",
}: {
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  balance?: number;
  isPremium?: boolean;
  countryCode?: string | null;
  locale?: UserLocale;
}) {
  const [isPending, startTransition] = useTransition();
  const en = locale !== "ka";
  const featuredPro = featuredPremiumPlanForCountry(countryCode);
  const proMonths = featuredPro.intervalCount ?? 1;
  const showProEntry =
    isPremium ||
    shouldShowPurchasePromotion({
      isPremium,
      balance: balance ?? 0,
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={en ? "User menu" : "მენიუ"}
          className="relative grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card text-foreground/85 transition-colors hover:border-primary/60 hover:bg-secondary"
        >
          <Image
            src={image || DEFAULT_AVATAR}
            alt=""
            width={36}
            height={36}
            referrerPolicy="no-referrer"
            className="size-8 rounded-sm object-cover"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-md border-border bg-card p-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <Image
            src={image || DEFAULT_AVATAR}
            alt=""
            width={36}
            height={36}
            referrerPolicy="no-referrer"
            className="size-9 shrink-0 rounded-sm border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {name ?? (en ? "You" : "შენ")}
            </div>
            {email && (
              <div className="truncate text-xs text-muted-foreground">
                {email}
              </div>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {username && (
          <DropdownMenuItem asChild>
            <Link href={`/u/${username}`} className="cursor-pointer">
              <User className="size-4 text-muted-foreground" />
              {en ? "Public profile" : "საჯარო პროფილი"}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/credits" className="cursor-pointer">
            <Sparkles className="size-4 text-primary" />
            {en ? "Credits" : "კრედიტები"}
            {typeof balance === "number" && (
              <span className="ml-auto font-mono text-xs font-medium tabular-nums text-primary">
                {balance}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/library" className="cursor-pointer">
            <BookOpen className="size-4 text-muted-foreground" />
            {en ? "My library" : "ჩემი ბიბლიოთეკა"}
          </Link>
        </DropdownMenuItem>
        {showProEntry && (
          <DropdownMenuItem asChild>
            <Link href="/subscription" className="cursor-pointer">
              <Crown className="size-4 text-primary" />
              {isPremium
                ? en
                  ? "Manage PRO"
                  : "PRO-ს მართვა"
                : proMonths > 1
                  ? en
                    ? `${proMonths} months of PRO`
                    : `${proMonths} თვე PRO`
                  : en
                    ? "Get PRO"
                    : "გახდი PRO"}
              {!isPremium && (
                <span className="ml-auto font-mono text-xs font-medium tabular-nums text-primary">
                  {formatBillingAmount(
                    featuredPro.amountMinor,
                    featuredPro.currency,
                    locale,
                  )}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <Settings className="size-4 text-muted-foreground" />
            {en ? "Account" : "ანგარიში"}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            startTransition(() => signOutAction());
          }}
          disabled={isPending}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {isPending
            ? en
              ? "Signing out…"
              : "გასვლა…"
            : en
              ? "Sign out"
              : "გასვლა"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
