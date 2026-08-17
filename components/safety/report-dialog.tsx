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
import type { UserLocale } from "@/lib/i18n/user-locale";

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
  locale = "ka",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
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
            {done
              ? am ? "Շնորհակալություն, ձեր զեկույցն ստացվել է" : en ? "Thank you—your report was received" : "მადლობა — საჩივარი მიღებულია"
              : am ? "Ներկայացնել զեկույց" : en ? "Submit a report" : "საჩივრის გაგზავნა"}
          </DialogTitle>
          <DialogDescription>
            {done
              ? am ? "Մեր թիմը կվերանայի այն։ Կարող եք նաև արգելափակել այս օգտատիրոջը։" : en ? "Our team will review it. You can also block this user." : "ჩვენი გუნდი გადახედავს. ასევე შეგიძლია დაბლოკო ეს მომხმარებელი."
              : am ? "Պատմեք, թե ինչ է պատահել (ըստ ցանկության)։ Կեղծ զեկույցները կարող են ազդել ձեր հաշվի վրա։" : en ? "Tell us what happened (optional). False reports may affect your account." : "მოგვწერე, რა მოხდა (არასავალდებულო). ცრუ საჩივრები აისახება შენს ანგარიშზე."}
          </DialogDescription>
        </DialogHeader>

        {!done && (
          <>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder={am ? "Նկարագրեք խնդիրը…" : en ? "Describe the issue…" : "აღწერე პრობლემა…"}
              className="w-full resize-none rounded-lg border border-border bg-card/60 p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => close(false)}>
                {am ? "Չեղարկել" : en ? "Cancel" : "გაუქმება"}
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? (am ? "Ուղարկվում է…" : en ? "Sending…" : "იგზავნება…") : (am ? "Ներկայացնել" : en ? "Submit" : "გაგზავნა")}
              </Button>
            </div>
          </>
        )}

        {done && (
          <div className="flex justify-end">
            <Button onClick={() => close(false)}>{am ? "Փակել" : en ? "Close" : "დახურვა"}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
