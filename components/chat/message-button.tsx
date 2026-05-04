"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Opens the chat panel directly to a conversation with `partnerId`.
 *
 * Implementation: dispatches the `vivida:open-chat` CustomEvent. The
 * globally-mounted ChatLauncher listens for it (see chat-launcher.tsx)
 * and handles opening the panel + selecting the partner. We use an
 * event instead of context/prop drilling because the chat launcher
 * lives in `app/layout.tsx` (the global ChatShell) — there's no shared
 * React tree to thread state through.
 *
 * Visual variants:
 *   - "default": full button with label (used inline next to FriendButton)
 *   - "icon": square icon-only (used in dense lists like /friends)
 */
export function MessageButton({
  partnerId,
  variant = "default",
  className,
}: {
  partnerId: string;
  variant?: "default" | "icon";
  className?: string;
}) {
  const open = () => {
    window.dispatchEvent(
      new CustomEvent("vivida:open-chat", { detail: { partnerId } })
    );
  };

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={open}
        aria-label="წერილი"
        className={cn("shrink-0", className)}
      >
        <MessageCircle className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={open}
      className={cn("shrink-0", className)}
    >
      <MessageCircle className="size-4" />
      წერილი
    </Button>
  );
}
