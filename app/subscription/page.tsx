import type { Metadata } from "next";
import { headers } from "next/headers";
import { CalendarDays, Crown, CreditCard } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { PremiumPlanCard } from "@/components/subscription/premium-plan-card";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";
import { formatBillingAmount, premiumPlanForCountry } from "@/lib/billing-config";
import { getBillingIdentity, getPremiumSubscription, isPremiumUser } from "@/lib/premium";
import { countryCodeFromHeaders, countryDisplayName, setResidenceCountryIfMissing } from "@/lib/residence";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getRequestLocale()) === "en";
  return { title: en ? "PRO subscription" : "PRO გამოწერა", robots: { index: false } };
}

export default async function SubscriptionPage() {
  const user = await requireUser();
  const locale = await getRequestLocale();
  const en = locale === "en";
  let identity = await getBillingIdentity(user.id);
  if (!identity) throw new Error("Billing identity not found");
  if (!identity?.countryCode) {
    const detected = countryCodeFromHeaders(await headers());
    await setResidenceCountryIfMissing(user.id, detected);
    identity = { ...identity, countryCode: detected };
  }

  const [subscription, active] = await Promise.all([
    getPremiumSubscription(user.id),
    isPremiumUser(user.id),
  ]);
  const plan = premiumPlanForCountry(identity?.countryCode);
  const country = countryDisplayName(identity?.countryCode, locale);

  return (
    <main lang={locale} className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.36_0.16_70/0.28),transparent_70%),radial-gradient(45%_35%_at_85%_45%,oklch(0.30_0.16_300/0.4),transparent_70%)]" />
      <Starfield count={100} shooting={2} />
      <AppHeader authed />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
            <Crown className="size-4" /> Vivida PRO
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            {active
              ? en ? "Your subscription" : "შენი გამოწერა"
              : en ? "Unlimited Vivida" : "ულიმიტო Vivida"}
          </h1>
        </div>

        {subscription ? (
          <>
            <section className="rounded-3xl border border-[var(--vivida-gold)]/35 bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Vivida PRO · {country}</div>
                <div className="mt-1 text-2xl font-semibold">
                  {formatBillingAmount(subscription.amountMinor, subscription.currency, locale)}
                  <span className="text-sm font-normal text-muted-foreground">/{en ? "month" : "თვე"}</span>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-400/12 text-emerald-300" : "bg-foreground/10 text-muted-foreground"}`}>
                {active ? "PRO" : subscription.status.replaceAll("_", " ")}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Detail icon={CalendarDays} label={subscription.cancelAtPeriodEnd ? (en ? "Access ends" : "წვდომა დასრულდება") : (en ? "Next renewal" : "შემდეგი განახლება")} value={formatDate(subscription.currentPeriodEnd, locale)} />
              <Detail icon={CreditCard} label={en ? "Billing" : "გადახდა"} value={subscription.cancelAtPeriodEnd ? (en ? "Cancellation scheduled" : "გაუქმება დაგეგმილია") : (en ? "Renews automatically" : "ავტომატურად განახლდება")} />
            </dl>

              <SubscriptionActions locale={locale} active={active} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} hasCustomer={Boolean(identity?.stripeCustomerId)} />
            </section>
            {!active && plan && (
              <div className="mt-4">
                <PremiumPlanCard plan={plan} locale={locale} />
              </div>
            )}
          </>
        ) : plan ? (
          <PremiumPlanCard plan={plan} locale={locale} />
        ) : (
          <section className="rounded-3xl border border-border bg-card/60 p-8 text-center ring-1 ring-foreground/5">
            <Crown className="mx-auto size-9 text-muted-foreground" />
            <h2 className="mt-3 text-xl font-semibold">
              {en ? "PRO is not available in your country yet" : "PRO შენს ქვეყანაში ჯერ არ არის ხელმისაწვდომი"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {en ? `Detected country: ${country}. Country-specific plans are being added gradually.` : `განსაზღვრული ქვეყანა: ${country}. გეგმები ეტაპობრივად ემატება.`}
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function formatDate(date: Date, locale: "ka" | "en") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Detail({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4" />{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
