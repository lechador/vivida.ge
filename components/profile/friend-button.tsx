"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Clock,
  UserCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "@/actions/friendship";
import type { FriendshipStatus } from "@/lib/friendship";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function FriendButton({
  targetUserId,
  targetUsername,
  initialStatus,
  locale = "ka",
}: {
  targetUserId: string;
  targetUsername: string | null;
  initialStatus: FriendshipStatus;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const [status, setStatus] = useState<FriendshipStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    nextStatus: FriendshipStatus
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        setStatus(nextStatus);
      } else {
        setError(result.error ?? (en ? "Something went wrong" : "შეცდომა"));
      }
    });
  };

  if (status === "blocked") {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row">
      {status === "none" && (
        <Button
          variant="mystic"
          disabled={isPending}
          onClick={() =>
            run(
              () => sendFriendRequest(targetUserId, targetUsername),
              "pending_outgoing"
            )
          }
        >
          <UserPlus className="size-4" />
          {isPending ? (en ? "Sending…" : "იგზავნება…") : (en ? "Add friend" : "მეგობრობის თხოვნა")}
        </Button>
      )}

      {status === "pending_outgoing" && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            run(
              () => cancelFriendRequest(targetUserId, targetUsername),
              "none"
            )
          }
        >
          <Clock className="size-4" />
          {isPending ? (en ? "Cancelling…" : "უქმდება…") : (en ? "Request sent" : "მოთხოვნა გაგზავნილია")}
        </Button>
      )}

      {status === "pending_incoming" && (
        <>
          <Button
            variant="mystic"
            disabled={isPending}
            onClick={() =>
              run(
                () => acceptFriendRequest(targetUserId, targetUsername),
                "friends"
              )
            }
          >
            <Check className="size-4" />
            {en ? "Accept" : "მიიღე"}
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(
                () => declineFriendRequest(targetUserId, targetUsername),
                "none"
              )
            }
          >
            <X className="size-4" />
            {en ? "Decline" : "უარი"}
          </Button>
        </>
      )}

      {status === "friends" && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => {
            const sure = window.confirm(en ? "Are you sure?" : "დარწმუნებული ხარ?");
            if (!sure) return;
            run(
              () => removeFriend(targetUserId, targetUsername),
              "none"
            );
          }}
          className="group"
        >
          <UserCheck className="size-4 group-hover:hidden" />
          <UserMinus className="hidden size-4 group-hover:inline" />
          <span className="group-hover:hidden">{en ? "Friend" : "მეგობარი"}</span>
          <span className="hidden group-hover:inline">{en ? "Remove" : "წაშლა"}</span>
        </Button>
      )}

      {error && (
        <p className="text-xs text-destructive sm:absolute sm:-bottom-6">
          {error}
        </p>
      )}
    </div>
  );
}
