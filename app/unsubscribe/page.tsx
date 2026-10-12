import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import {
  applyUnsubscribe,
  isUnsubscribeType,
  type UnsubscribeType,
} from "@/lib/unsubscribe";
import { unsubscribeLeadByToken } from "@/lib/horoscope-leads";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      (await getRequestLocale()) !== "ka"
        ? "Unsubscribe"
        : "გამოწერის გაუქმება",
  };
}
export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  daily: "ყოველდღიური ჰოროსკოპის წერილები",
  marketing: "სიახლეები და სარეკლამო წერილები",
  nudges: "შეხსენებები",
  all: "ყველა მარკეტინგული წერილი",
  lead: "დღიური ჰოროსკოპის წერილები",
};

const LABELS_EN: Record<string, string> = {
  daily: "daily horoscope emails",
  marketing: "news and promotional emails",
  nudges: "reminders",
  all: "all marketing emails",
  lead: "daily horoscope emails",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; type?: string }>;
}) {
  const { token, type: rawType } = await searchParams;
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  // Anonymous horoscope-email leads use their own token space + opt-out path.
  const isLead = rawType === "lead";
  const type = isLead
    ? "lead"
    : rawType && isUnsubscribeType(rawType)
      ? rawType
      : "all";

  let status: "missing" | "not_found" | "ok" = "missing";
  let email: string | null = null;
  if (token) {
    const r = isLead
      ? await unsubscribeLeadByToken(token)
      : await applyUnsubscribe(token, type as UnsubscribeType);
    if (r) {
      status = "ok";
      email = r.email;
    } else {
      status = "not_found";
    }
  }

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.4),transparent_70%)]"
      />
      <Starfield count={60} />

      <section className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="rounded-2xl border border-border bg-card/65 p-8 ring-1 ring-foreground/5 backdrop-blur-xl">
          {status === "ok" ? (
            <>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight">
                {en ? "You’re unsubscribed" : "გამოწერა გაუქმდა"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {email ? <>{email}, </> : null}
                <span className="text-foreground">
                  {en ? LABELS_EN[type] : LABELS[type]}
                </span>{" "}
                {en
                  ? "have been turned off. You may still receive an email that was already being sent before this change."
                  : "გამორთულია. შესაძლოა რამდენიმე წუთში მაინც მიიღო წერილი, რომელიც უკვე იგზავნებოდა გაუქმებამდე."}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {en
                  ? "You can update your email preferences at any time from your account."
                  : "შენი არჩევანი ნებისმიერ დროს შეგიძლია შეცვალო ანგარიშის გვერდზე."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild>
                  <Link href="/account">{en ? "Account" : "ანგარიში"}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">{en ? "Home" : "მთავარი"}</Link>
                </Button>
              </div>
            </>
          ) : status === "not_found" ? (
            <>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight">
                {en ? "This link is no longer valid" : "ბმული აღარ მოქმედებს"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {en
                  ? "This unsubscribe link is unknown. It may already have been used, or the account may have been deleted. You can manage subscriptions from your account."
                  : "ეს გამოწერის ბმული უცნობია, შესაძლოა უკვე გამოყენებულია ან ანგარიში წაიშალა. გამოწერების მართვა შეგიძლია ანგარიშის გვერდზე."}
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild>
                  <Link href="/account">
                    {en ? "Go to account" : "ანგარიშში გადასვლა"}
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight">
                {en ? "Invalid unsubscribe link" : "გამოწერის ბმული არასწორია"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {en
                  ? "The link is missing its token. You can manage subscriptions from your account."
                  : "ბმულს აკლია token. გამოწერების მართვა შეგიძლია ანგარიშის გვერდზე."}
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild>
                  <Link href="/account">
                    {en ? "Go to account" : "ანგარიშში გადასვლა"}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
