"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhoneGiftForm } from "@/components/phone-gift/phone-gift-form";
import { dismissPhoneGiftPopup } from "@/actions/phone";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * One-time dashboard gift popup. The dashboard renders this only while the
 * viewer is eligible (no verified phone, not PRO, not dismissed) — any close
 * path either records the dismissal so the popup never returns, or (after a
 * successful claim) refreshes so the dashboard drops the stale state. The
 * offer itself stays claimable from the credits page.
 */
export function PhoneGiftPopup({ locale }: { locale: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const claimedRef = useRef(false);
  const closedRef = useRef(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setOpen(true);
      return;
    }
    setOpen(false);
    if (closedRef.current) return;
    closedRef.current = true;
    if (claimedRef.current) {
      // The number is verified now — a refresh removes this popup from the
      // dashboard and updates the balance.
      router.refresh();
      return;
    }
    trackEvent(ANALYTICS_EVENT.phoneGiftDismissed, {
      surface: "dashboard_popup",
    });
    void dismissPhoneGiftPopup();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5 shrink-0 text-[var(--vivida-cyan)]" />
            {en
              ? "Verify your number and get 20 credits"
              : "დაადასტურე ნომერი და მიიღე 20 კრედიტი"}
          </DialogTitle>
          <DialogDescription>
            {en
              ? "Add your mobile number and verify it with an SMS code. Verification gives you 10 credits; opting in to promotional SMS makes it 20."
              : "შეიყვანე მობილურის ნომერი და დაადასტურე SMS კოდით. ნომრის დადასტურება გაძლევს 10 კრედიტს, მარკეტინგულ SMS-ებზე თანხმობა კი სულ 20 კრედიტს."}
          </DialogDescription>
        </DialogHeader>

        <PhoneGiftForm
          locale={locale}
          surface="dashboard_popup"
          onClaimed={() => {
            claimedRef.current = true;
          }}
          onDone={() => handleOpenChange(false)}
        />

        <p className="text-xs text-muted-foreground">
          {en
            ? "You can also claim this offer later from the Credits page."
            : "ეს შეთავაზება კრედიტების გვერდზე ყოველთვის ხელმისაწვდომია."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
