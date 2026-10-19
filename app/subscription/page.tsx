import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  CalendarDays,
  Crown,
  CreditCard,
  Hourglass,
  History,
} from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { PremiumPlanCard } from "@/components/subscription/premium-plan-card";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";
import {
  billingPeriodMonths,
  featuredPremiumPlanForCountry,
  formatBillingAmount,
  premiumPlanForCountry,
} from "@/lib/billing-config";
import { productLd, serializeLd } from "@/lib/seo/jsonld";
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
import {
  getRequestLocale,
  requestIsEnglishHost,
} from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { Suspense } from "react";
import { CheckoutSuccessTracker } from "@/components/billing/checkout-success-tracker";
import { CryptoPayHost } from "@/components/crypto/crypto-pay";
import { isCryptoPayConfigured } from "@/lib/crypto-pay";
import { normalizeReturnPath } from "@/lib/safe-return-path";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vivida.ge";

const PRO_PLAN = featuredPremiumPlanForCountry("GE");
const PRO_MONTHS = PRO_PLAN.intervalCount ?? 1;

const SUBSCRIPTION_LD = productLd({
  name: "Vivida PRO",
  url: `${SITE_URL}/subscription`,
  offers: [
    {
      name:
        PRO_MONTHS > 1
          ? `Vivida PRO — ${PRO_MONTHS} თვე`
          : "Vivida PRO — თვიური",
      price: PRO_PLAN.amountMinor / 100,
      priceCurrency: PRO_PLAN.currency.toUpperCase(),
      url: `${SITE_URL}/subscription`,
    },
  ],
});

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
  searchParams: Promise<{
    next?: string | string[];
    product?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const returnTo = rawNext ? normalizeReturnPath(rawNext) : null;
  const rawProduct = Array.isArray(query.product)
    ? query.product[0]
    : query.product;
  const product =
    typeof rawProduct === "string" && /^[a-z0-9_-]{1,60}$/i.test(rawProduct)
      ? rawProduct
      : null;
  const loginQuery = new URLSearchParams();
  if (returnTo) loginQuery.set("next", returnTo);
  if (product) loginQuery.set("product", product);
  const loginReturn = loginQuery.size
    ? `/subscription?${loginQuery.toString()}`
    : "/subscription";
  const user = await requireUser(loginReturn);
  // See app/credits/page.tsx, authed surfaces carry no `/am` prefix, so the
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
  // English host pays by card (Stripe checkout is off there); the Georgian
  // site keeps its Stripe surfaces untouched.
  const cryptoPay = (await requestIsEnglishHost()) && isCryptoPayConfigured();
  const plan = premiumPlanForCountry(identity?.countryCode);
  const country = countryDisplayName(identity?.countryCode, locale);

  // Period progress for the "how much time is left" detail. Ceiled so a
  // period ending later today still reads as a day rather than zero.
  // eslint-disable-next-line react-hooks/purity -- server component, force-dynamic: evaluated once per request.
  const nowMs = Date.now();
  const periodStartMs = subscription?.currentPeriodStart.getTime() ?? nowMs;
  const periodEndMs = subscription?.currentPeriodEnd.getTime() ?? nowMs;
  const daysLeft = subscription
    ? Math.max(0, Math.ceil((periodEndMs - nowMs) / 86_400_000))
    : 0;
  const elapsedPct =
    subscription && periodEndMs > periodStartMs
      ? Math.min(
          100,
          Math.max(
            0,
            ((nowMs - periodStartMs) / (periodEndMs - periodStartMs)) * 100,
          ),
        )
      : 0;
  // PRO granted without a subscription row (manual grant, store receipt not
  // yet mirrored): there is no period to bill against, only premiumUntil.
  const directPremiumUntilMs = !subscription
    ? (identity?.premiumUntil?.getTime() ?? null)
    : null;
  const directDaysLeft =
    directPremiumUntilMs != null
      ? Math.max(0, Math.ceil((directPremiumUntilMs - nowMs) / 86_400_000))
      : 0;

  return (
    <CryptoPayHost>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(SUBSCRIPTION_LD) }}
      />
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
          <CheckoutSuccessTracker locale={locale} />
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
                      {/* Read from the subscription, not assumed monthly, the
                      ₾29 promo bills quarterly, and telling its buyers they
                      pay that every month would be a false billing claim. */}
                      <span className="text-sm font-normal text-muted-foreground">
                        /
                        {subscription.source === "crypto"
                          ? en
                            ? "one-time pass"
                            : "ერთჯერადი პასი"
                          : billingCadenceLabel(
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
                    icon={History}
                    label={en ? "Subscribed since" : "გამოწერილია"}
                    value={formatDate(subscription.createdAt, locale)}
                  />
                  <Detail
                    icon={Hourglass}
                    label={en ? "Time remaining" : "დარჩენილი დრო"}
                    value={remainingLabel(daysLeft, en)}
                  />
                  <Detail
                    icon={CalendarDays}
                    label={
                      subscription.cancelAtPeriodEnd ||
                      subscription.source === "crypto"
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
                      subscription.source === "crypto"
                        ? en
                          ? "One-time card payment"
                          : "ერთჯერადი გადახდა (ბარათით)"
                        : subscription.cancelAtPeriodEnd
                          ? en
                            ? "Cancellation scheduled"
                            : "გაუქმება დაგეგმილია"
                          : en
                            ? "Renews automatically"
                            : "ავტომატურად განახლდება"
                    }
                  />
                </dl>

                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/10"
                  role="progressbar"
                  aria-valuenow={Math.round(elapsedPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={
                    en ? "Billing period elapsed" : "საბილინგო პერიოდი"
                  }
                >
                  <div
                    className="h-full rounded-full bg-[var(--vivida-gold)]/80"
                    style={{ width: `${elapsedPct}%` }}
                  />
                </div>

                <SubscriptionActions
                  locale={locale}
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
                    product={product}
                    crypto={cryptoPay}
                  />
                </div>
              )}
            </>
          ) : active && identity?.premiumUntil ? (
            // PRO is on but there is no subscription row to bill against, so
            // the buy card would be a lie, show the status and the time left.
            <section className="rounded-3xl border border-[var(--vivida-gold)]/35 bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Vivida PRO
                  </div>
                  <div className="mt-1 text-2xl font-semibold">
                    {en ? "PRO is active" : "PRO ჩართულია"}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-300">
                  PRO
                </span>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <Detail
                  icon={CalendarDays}
                  label={en ? "Active until" : "აქტიურია"}
                  value={formatDate(identity.premiumUntil, locale)}
                />
                <Detail
                  icon={Hourglass}
                  label={en ? "Time remaining" : "დარჩენილი დრო"}
                  value={remainingLabel(directDaysLeft, en)}
                />
              </dl>
            </section>
          ) : (
            <PremiumPlanCard
              plan={plan}
              locale={locale}
              placement="subscription_page"
              returnTo={returnTo}
              product={product}
              crypto={cryptoPay}
            />
          )}
        </section>
      </main>
    </CryptoPayHost>
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

/** "23 days left", the remaining-time value under the subscription dates. */
function remainingLabel(daysLeft: number, en: boolean): string {
  if (daysLeft <= 0) return en ? "Ended" : "დასრულდა";
  if (daysLeft === 1) return en ? "1 day left" : "დარჩა 1 დღე";
  return en ? `${daysLeft} days left` : `დარჩა ${daysLeft} დღე`;
}

/** "month" / "3 months", the denominator under a subscription's price. */
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
