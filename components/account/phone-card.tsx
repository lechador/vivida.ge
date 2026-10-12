"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhoneVerify } from "@/components/auth/phone-verify";
import { SmsMarketingToggle } from "@/components/auth/sms-marketing-toggle";
import { updateSmsMarketingConsent } from "@/actions/sms-marketing";
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
  initialPhoneLoginReady,
  initialSmsMarketing,
  locale,
}: {
  initialPhone: string | null;
  initialPhoneLoginReady: boolean;
  initialSmsMarketing: boolean;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [phoneLoginReady, setPhoneLoginReady] = useState(
    initialPhoneLoginReady,
  );
  const [changing, setChanging] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(initialSmsMarketing);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsSaved, setSmsSaved] = useState(false);
  const [smsPending, startSmsTransition] = useTransition();

  function changeSmsMarketing(enabled: boolean) {
    if (!phone || !phoneLoginReady) return;
    setSmsError(null);
    setSmsSaved(false);
    startSmsTransition(async () => {
      try {
        const result = await updateSmsMarketingConsent({ phone, enabled });
        if (!result.ok) {
          setSmsError(
            result.reason === "verification_required"
              ? en
                ? "Verify this number again before enabling promotional SMS."
                : "მარკეტინგული SMS-ის ჩასართავად ნომერი ხელახლა დაადასტურე."
              : result.reason === "unavailable"
                ? en
                  ? "Promotional SMS is only available on vivida.ge."
                  : "მარკეტინგული SMS მხოლოდ vivida.ge-ზეა ხელმისაწვდომი."
                : en
                  ? "The number changed. Refresh this page and try again."
                  : "ნომერი შეიცვალა. განაახლე გვერდი და სცადე ხელახლა.",
          );
          return;
        }
        setSmsMarketing(enabled);
        setSmsSaved(true);
        router.refresh();
      } catch {
        setSmsError(
          en
            ? "Could not save your SMS preference. Please try again."
            : "SMS-ის პარამეტრი ვერ შეინახა. სცადე ხელახლა.",
        );
      }
    });
  }

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
            {phone && !phoneLoginReady
              ? en
                ? "Verify this number again to enable phone sign-in and promotional SMS preferences."
                : "ნომრით შესვლისა და მარკეტინგული SMS-ის ასარჩევად ეს ნომერი ხელახლა დაადასტურე."
              : phone
                ? en
                  ? "You can sign in with this number using a one-time SMS code."
                  : "ამ ნომრით შესვლა შესაძლებელია ერთჯერადი SMS კოდით."
                : en
                  ? "Add your number and verify it with an SMS code, after that you can also sign in with it."
                  : "დაამატე ნომერი და დაადასტურე SMS კოდით, ამის შემდეგ მისით შესვლაც შეძლებ."}
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
                {phoneLoginReady
                  ? en
                    ? "verified"
                    : "დადასტურებული"
                  : en
                    ? "verification required"
                    : "ხელახლა დასადასტურებელი"}
              </span>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setChanging(true)}
          >
            {phoneLoginReady
              ? en
                ? "Change number"
                : "ნომრის შეცვლა"
              : en
                ? "Verify again"
                : "ხელახლა დადასტურება"}
          </Button>
          <div className="space-y-1.5">
            <SmsMarketingToggle
              locale={locale}
              checked={phoneLoginReady && smsMarketing}
              onChange={changeSmsMarketing}
              disabled={smsPending || !phoneLoginReady}
            />
            <p className="text-xs text-muted-foreground">
              {en
                ? "Verification codes are sent regardless of this setting. You can turn promotional SMS off at any time."
                : "დადასტურების კოდი ამ პარამეტრზე არ არის დამოკიდებული. მარკეტინგული SMS-ების გამორთვა ნებისმიერ დროს შეგიძლია."}
            </p>
            {smsError && (
              <p role="alert" className="text-xs text-destructive">
                {smsError}
              </p>
            )}
            {smsSaved && !smsPending && (
              <p role="status" className="text-xs text-[var(--vivida-cyan)]">
                {en ? "Saved" : "შენახულია"}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <PhoneVerify
            locale={locale}
            purpose="account"
            onVerified={({ phone: verifiedPhone }) => {
              if (verifiedPhone !== phone) setSmsMarketing(false);
              setPhone(verifiedPhone);
              setPhoneLoginReady(true);
              setChanging(false);
              setSmsError(null);
              setSmsSaved(false);
              router.refresh();
            }}
          />
          {!phone && (
            <SmsMarketingToggle
              locale={locale}
              checked={false}
              onChange={() => {}}
              disabled
            />
          )}
        </div>
      )}
    </section>
  );
}
