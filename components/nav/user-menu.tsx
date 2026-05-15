"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/actions/auth";

export function UserMenu({
  name,
  email,
  image,
  username,
}: {
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const display = name?.split(" ")[0] ?? "ვარსკვლავო";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="მენიუ"
          className="relative grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card/50 text-foreground/80 transition-all hover:border-foreground/30 hover:bg-card/80"
        >
          {image ? (
            <Image
              src={image}
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          ) : (
            <span className="text-base font-medium">
              {display[0]?.toUpperCase()}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="flex items-center gap-3 px-2 py-2">
          {image && (
            <Image
              src={image}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full border border-border/60 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{name ?? "შენ"}</div>
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
              საჯარო პროფილი
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <Settings className="size-4" />
            ანგარიში
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
          {isPending ? "გასვლა…" : "გასვლა"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
