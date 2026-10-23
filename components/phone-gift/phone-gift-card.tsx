"use client";

import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";

import { PhoneGiftForm } from "@/components/phone-gift/phone-gift-form";
import { PHONE_VERIFY_GIFT, SMS_CONSENT_GIFT } from "@/lib/credits-config";
import type { UserLocale } from "@/lib/i18n/user-locale";

const TOTAL_PHONE_GIFT = PHONE_VERIFY_GIFT + SMS_CONSENT_GIFT;

/**
 * Credits-page surface of the phone-gift campaign: the same offer as the
 * one-time dashboard popup, kept here so dismissing the popup never costs
 * the user the gift. The page renders it only while the viewer is eligible.
 */
export function PhoneGiftCard({ locale }: { locale: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();

  return (
    <section className="rounded-3xl border border-[var(--vivida-cyan)]/30 bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]">
          <Gift className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {en
              ? `Verify your number and get ${TOTAL_PHONE_GIFT} credits`
              : `დაადასტურე ნომერი და მიიღე ${TOTAL_PHONE_GIFT} კრედიტი`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? `Add your mobile number and verify it with an SMS code. Verification gives you ${PHONE_VERIFY_GIFT} credits; opting in to promotional SMS makes it ${TOTAL_PHONE_GIFT}.`
              : `შეიყვანე მობილურის ნომერი და დაადასტურე SMS კოდით. ნომრის დადასტურება გაძლევს ${PHONE_VERIFY_GIFT} კრედიტს, მარკეტინგულ SMS-ებზე თანხმობა კი სულ ${TOTAL_PHONE_GIFT} კრედიტს.`}
          </p>
        </div>
      </div>
      <PhoneGiftForm
        locale={locale}
        surface="credits_card"
        onDone={() => router.refresh()}
      />
    </section>
  );
}
