"use client";

import { useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reportContent } from "@/actions/moderation";
import type { ReportTargetType } from "@/db/schema";

/**
 * Controlled report dialog with an optional free-text reason. Reusable across
 * profiles, feed posts, and chat threads — the trigger lives in the parent
 * (a menu item or button) and just flips `open`.
 */
export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Reset after the close animation so the form doesn't flicker.
      setTimeout(() => {
        setReason("");
        setDone(false);
      }, 200);
    }
  }

  function submit() {
    start(async () => {
      await reportContent({
        targetType,
        targetId,
        reason: reason.trim() || undefined,
      });
      setDone(true);
    });
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {done ? "მადლობა — საჩივარი მიღებულია" : "საჩივრის გაგზავნა"}
          </DialogTitle>
          <DialogDescription>
            {done
              ? "ჩვენი გუნდი გადახედავს. ასევე შეგიძლია დაბლოკო ეს მომხმარებელი."
              : "მოგვწერე, რა მოხდა (არასავალდებულო). ცრუ საჩივრები აისახება შენს ანგარიშზე."}
          </DialogDescription>
        </DialogHeader>

        {!done && (
          <>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="აღწერე პრობლემა…"
              className="w-full resize-none rounded-lg border border-border bg-card/60 p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => close(false)}>
                გაუქმება
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? "იგზავნება…" : "გაგზავნა"}
              </Button>
            </div>
          </>
        )}

        {done && (
          <div className="flex justify-end">
            <Button onClick={() => close(false)}>დახურვა</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
