import type { Metadata } from "next";
import { headers } from "next/headers";
import { CalendarDays, Crown, CreditCard } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { PremiumPlanCard } from "@/components/subscription/premium-plan-card";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";
import {
  billingPeriodMonths,
  formatBillingAmount,
  premiumPlanForCountry,
} from "@/lib/billing-config";
import {
  getBillingIdentity,
  getPremiumSubscription,
  isPremiumUser,
} from "@/lib/premium";
import {
  countryCodeFromHeaders,
  countryDisplayName,
  setResidenceCountryIfMissing,
} from "@/lib/residence";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { Suspense } from "react";
import { CheckoutSuccessTracker } from "@/components/billing/checkout-success-tracker";
import { normalizeReturnPath } from "@/lib/safe-return-path";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return {
    title: en ? "PRO subscription" : "PRO გამოწერა",
    robots: { index: false },
  };
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const returnTo = rawNext ? normalizeReturnPath(rawNext) : null;
  // See app/credits/page.tsx — authed surfaces carry no `/am` prefix, so the
  // stored preference is what keeps an Armenian user in Armenian.
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";
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
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.36_0.16_70/0.28),transparent_70%),radial-gradient(45%_35%_at_85%_45%,oklch(0.30_0.16_300/0.4),transparent_70%)]"
      />
      <Starfield count={100} shooting={2} />
      <AppHeader authed />
      <Suspense fallback={null}>
        <CheckoutSuccessTracker />
      </Suspense>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
            <Crown className="size-4" /> Vivida PRO
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            {active
              ? en
                ? "Your subscription"
                : "შენი გამოწერა"
              : en
                ? "Unlimited Vivida"
                : "ულიმიტო Vivida"}
          </h1>
        </div>

        {subscription ? (
          <>
            <section className="rounded-3xl border border-[var(--vivida-gold)]/35 bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Vivida PRO · {country}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">
                    {formatBillingAmount(
                      subscription.amountMinor,
                      subscription.currency,
                      locale,
                    )}
                    {/* Read from the subscription, not assumed monthly — the
                      ₾29 promo bills quarterly, and telling its buyers they
                      pay that every month would be a false billing claim. */}
                    <span className="text-sm font-normal text-muted-foreground">
                      /
                      {billingCadenceLabel(
                        billingPeriodMonths(
                          subscription.currentPeriodStart,
                          subscription.currentPeriodEnd,
                        ),
                        en,
                      )}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-400/12 text-emerald-300" : "bg-foreground/10 text-muted-foreground"}`}
                >
                  {active ? "PRO" : subscription.status.replaceAll("_", " ")}
                </span>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <Detail
                  icon={CalendarDays}
                  label={
                    subscription.cancelAtPeriodEnd
                      ? en
                        ? "Access ends"
                        : "წვდომა დასრულდება"
                      : en
                        ? "Next renewal"
                        : "შემდეგი განახლება"
                  }
                  value={formatDate(subscription.currentPeriodEnd, locale)}
                />
                <Detail
                  icon={CreditCard}
                  label={en ? "Billing" : "გადახდა"}
                  value={
                    subscription.cancelAtPeriodEnd
                      ? en
                        ? "Cancellation scheduled"
                        : "გაუქმება დაგეგმილია"
                      : en
                        ? "Renews automatically"
                        : "ავტომატურად განახლდება"
                  }
                />
              </dl>

              <SubscriptionActions
                locale={locale}
                active={active}
                cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                hasCustomer={Boolean(identity?.stripeCustomerId)}
              />
            </section>
            {!active && (
              <div className="mt-4">
                <PremiumPlanCard
                  plan={plan}
                  locale={locale}
                  placement="subscription_page_reactivation"
                  returnTo={returnTo}
                />
              </div>
            )}
          </>
        ) : (
          <PremiumPlanCard
            plan={plan}
            locale={locale}
            placement="subscription_page"
            returnTo={returnTo}
          />
        )}
      </section>
    </main>
  );
}

import type { UserLocale } from "@/lib/i18n/user-locale";

function formatDate(date: Date, locale: UserLocale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "month" / "3 months" — the denominator under a subscription's price. */
function billingCadenceLabel(months: number, en: boolean): string {
  if (months === 1) return en ? "month" : "თვე";
  return en ? `${months} months` : `${months} თვე`;
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
