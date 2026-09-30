"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhoneVerify } from "@/components/auth/phone-verify";
import { formatGeorgianMobile } from "@/lib/phone";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Account card: add or change the mobile number with SMS verification. The
 * number is bound server-side the moment the code verifies (see
 * actions/phone.ts verifyAccountPhone), so this card only owns display
 * state and refreshes the page data after a successful change.
 */
export function PhoneCard({
  initialPhone,
  locale,
}: {
  initialPhone: string | null;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [changing, setChanging] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]">
          <Phone className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">
            {en ? "Mobile number" : "მობილურის ნომერი"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {phone
              ? en
                ? "You can sign in with this number using a one-time SMS code."
                : "ამ ნომრით შესვლა შესაძლებელია ერთჯერადი SMS კოდით."
              : en
                ? "Add your number and verify it with an SMS code — after that you can also sign in with it."
                : "დაამატე ნომერი და დაადასტურე SMS კოდით — ამის შემდეგ მისით შესვლაც შეძლებ."}
          </p>
        </div>
      </header>

      {phone && !changing ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-[var(--vivida-cyan)]">
              <CheckCircle2 className="size-4 shrink-0" />
              {formatGeorgianMobile(phone)}
              <span className="text-xs opacity-80">
                {en ? "verified" : "დადასტურებული"}
              </span>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setChanging(true)}
          >
            {en ? "Change number" : "ნომრის შეცვლა"}
          </Button>
        </div>
      ) : (
        <PhoneVerify
          locale={locale}
          purpose="account"
          onVerified={({ phone: verifiedPhone }) => {
            setPhone(verifiedPhone);
            setChanging(false);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
