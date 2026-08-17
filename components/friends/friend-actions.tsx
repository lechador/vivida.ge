"use client";

import { useState, useTransition } from "react";
import { Check, X, Clock, UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "@/actions/friendship";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Inline action buttons used inside friend / request cards on /friends.
 * One transition per row so each card has its own pending state.
 */
export function FriendActions({
  variant,
  otherUserId,
  otherUsername,
  locale = "ka",
}: {
  variant: "incoming" | "outgoing" | "friends";
  otherUserId: string;
  otherUsername: string | null;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  if (removed) {
    return (
      <span className="text-xs text-muted-foreground">{am ? "Հեռացված է" : en ? "Removed" : "წაიშალა"}</span>
    );
  }

  return (
    <div className={cn("flex shrink-0 gap-2", isPending && "opacity-60")}>
      {variant === "incoming" && (
        <>
          <Button
            size="sm"
            variant="mystic"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await acceptFriendRequest(otherUserId, otherUsername);
              })
            }
          >
            <Check className="size-3.5" />
            {am ? "Ընդունել" : en ? "Accept" : "მიიღე"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await declineFriendRequest(otherUserId, otherUsername);
                setRemoved(true);
              })
            }
          >
            <X className="size-3.5" />
            {am ? "Մերժել" : en ? "Decline" : "უარი"}
          </Button>
        </>
      )}
      {variant === "outgoing" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await cancelFriendRequest(otherUserId, otherUsername);
              setRemoved(true);
            })
          }
        >
          <Clock className="size-3.5" />
          {am ? "Չեղարկել" : en ? "Cancel" : "გაუქმება"}
        </Button>
      )}
      {variant === "friends" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            const sure = window.confirm(am ? "Հեռացնե՞լ այս ընկերոջը" : en ? "Remove this friend?" : "მართლა წავშალოთ?");
            if (!sure) return;
            startTransition(async () => {
              await removeFriend(otherUserId, otherUsername);
              setRemoved(true);
            });
          }}
        >
          <UserMinus className="size-3.5" />
          {am ? "Հեռացնել" : en ? "Remove" : "წაშლა"}
        </Button>
      )}
    </div>
  );
}
