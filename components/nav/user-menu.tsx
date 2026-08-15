"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings, Sparkles, User } from "lucide-react";

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

export function UserMenu({
  name,
  email,
  image,
  username,
  balance,
  isPremium = false,
  locale = "ka",
}: {
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  balance?: number;
  isPremium?: boolean;
  locale?: UserLocale;
}) {
  const [isPending, startTransition] = useTransition();
  const en = locale === "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={en ? "User menu" : "მენიუ"}
          className="relative grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card/50 text-foreground/80 transition-all hover:border-foreground/30 hover:bg-card/80"
        >
          <Image
            src={image || DEFAULT_AVATAR}
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <Image
            src={image || DEFAULT_AVATAR}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full border border-border/60 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{name ?? (en ? "You" : "შენ")}</div>
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
              <User className="size-4" />
              {en ? "Public profile" : "საჯარო პროფილი"}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/credits" className="cursor-pointer">
            <Sparkles className="size-4 text-[var(--vivida-cyan)]" />
            {en ? "Credits" : "კრედიტები"}
            {typeof balance === "number" && (
              <span className="ml-auto rounded-full bg-[var(--vivida-cyan)]/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-[var(--vivida-cyan)]">
                {balance}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        {isPremium && (
          <DropdownMenuItem asChild>
            <Link href="/subscription" className="cursor-pointer">
              <Sparkles className="size-4 text-[var(--vivida-gold)]" />
              PRO
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <Settings className="size-4" />
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
          {isPending ? (en ? "Signing out…" : "გასვლა…") : (en ? "Sign out" : "გასვლა")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
