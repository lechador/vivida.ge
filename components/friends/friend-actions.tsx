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

/**
 * Inline action buttons used inside friend / request cards on /friends.
 * One transition per row so each card has its own pending state.
 */
export function FriendActions({
  variant,
  otherUserId,
  otherUsername,
}: {
  variant: "incoming" | "outgoing" | "friends";
  otherUserId: string;
  otherUsername: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  if (removed) {
    return (
      <span className="text-xs text-muted-foreground">წაიშალა</span>
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
            მიიღე
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
            უარი
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
          გაუქმება
        </Button>
      )}
      {variant === "friends" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            const sure = window.confirm("მართლა წავშალოთ?");
            if (!sure) return;
            startTransition(async () => {
              await removeFriend(otherUserId, otherUsername);
              setRemoved(true);
            });
          }}
        >
          <UserMinus className="size-3.5" />
          წაშლა
        </Button>
      )}
    </div>
  );
}
