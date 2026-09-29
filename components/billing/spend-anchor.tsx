import Link from "next/link";
import { Crown } from "lucide-react";

import { formatBillingAmount } from "@/lib/billing-config";
import { proAnchorFor } from "@/lib/pro-anchor";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Personalized PRO anchor for the credits hub: "your last-30-day spend was
 * worth ≈₾X — PRO would have been ₾Y". Renders nothing for premium users
 * (the caller gates) or light spenders with nothing to anchor against.
 * Spend is a value signal, not a cash total — copy says "worth", never
 * "you paid", since free-allowance spend rides the same ledger.
 */
export function SpendAnchor({
  spend,
  countryCode,
  locale,
}: {
  spend: number;
  countryCode?: string | null;
  locale: UserLocale;
}) {
  const anchor = proAnchorFor(spend, countryCode);
  if (!anchor) return null;
  const en = locale !== "ka";
  const cash = formatBillingAmount(
    anchor.spendCashMinor,
    anchor.currency,
    locale,
  );
  const pro = formatBillingAmount(
    anchor.proMonthlyMinor,
    anchor.currency,
    locale,
  );
  const save = formatBillingAmount(anchor.saveMinor, anchor.currency, locale);

  return (
    <p className="flex items-start gap-2.5 rounded-2xl border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/8 px-4 py-3 text-sm leading-relaxed">
      <Crown
        className="mt-0.5 size-4 shrink-0 text-[var(--vivida-gold)]"
        aria-hidden
      />
      <span>
        {en ? (
          <>
            You used{" "}
            <strong className="font-semibold tabular-nums">
              {anchor.spendCredits}
            </strong>{" "}
            credits (≈{cash} in value) in the last 30 days.{" "}
            {anchor.kind === "saves" ? (
              <>
                <Link
                  href="#pro-plan"
                  className="font-semibold text-[var(--vivida-gold)] underline-offset-4 hover:underline"
                >
                  PRO ({pro}/mo)
                </Link>{" "}
                would have been cheaper — saving you {save}.
              </>
            ) : (
              <>
                In active months,{" "}
                <Link
                  href="#pro-plan"
                  className="font-semibold text-[var(--vivida-gold)] underline-offset-4 hover:underline"
                >
                  PRO ({pro}/mo)
                </Link>{" "}
                makes everything unlimited.
              </>
            )}
          </>
        ) : (
          <>
            ბოლო 30 დღეში{" "}
            <strong className="font-semibold tabular-nums">
              {anchor.spendCredits}
            </strong>{" "}
            კრედიტი გამოიყენე (≈{cash} ღირებულების).{" "}
            {anchor.kind === "saves" ? (
              <>
                <Link
                  href="#pro-plan"
                  className="font-semibold text-[var(--vivida-gold)] underline-offset-4 hover:underline"
                >
                  PRO ({pro}/თვეში)
                </Link>{" "}
                იაფი დაგიჯდებოდა — დაზოგავდი {save}.
              </>
            ) : (
              <>
                აქტიურ თვეებში{" "}
                <Link
                  href="#pro-plan"
                  className="font-semibold text-[var(--vivida-gold)] underline-offset-4 hover:underline"
                >
                  PRO ({pro}/თვეში)
                </Link>{" "}
                ყველაფერს ულიმიტოს ხდის.
              </>
            )}
          </>
        )}
      </span>
    </p>
  );
}
