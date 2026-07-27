import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Navigates to the messenger page with `partnerId` preselected. The page
 * picks the partner up from `?with=...` and auto-opens that conversation.
 *
 * Visual variants:
 *   - "default": full button with label (used inline next to FriendButton)
 *   - "icon": square icon-only (used in dense lists like /friends)
 */
export function MessageButton({
  partnerId,
  variant = "default",
  className,
  locale = "ka",
}: {
  partnerId: string;
  variant?: "default" | "icon";
  className?: string;
  locale?: UserLocale;
}) {
  const href = `/messages?with=${encodeURIComponent(partnerId)}`;

  if (variant === "icon") {
    return (
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn("shrink-0", className)}
      >
        <Link href={href} aria-label={locale === "en" ? "Message" : "წერილი"}>
          <MessageCircle className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" className={cn("shrink-0", className)}>
      <Link href={href}>
        <MessageCircle className="size-4" />
        {locale === "en" ? "Message" : "წერილი"}
      </Link>
    </Button>
  );
}
