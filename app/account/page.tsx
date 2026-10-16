import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Sparkles } from "lucide-react";

import { db } from "@/db";
import { profiles, profilePhotos, users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { asc } from "drizzle-orm";
import { getHeaderData } from "@/lib/header-cache";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { DangerZone } from "@/components/account/danger-zone";
import { VisibilityCard } from "@/components/account/visibility-card";
import { GenderCard } from "@/components/account/gender-card";
import { PhotoUploader } from "@/components/account/photo-uploader";
import { AiAvatarGenerator } from "@/components/account/ai-avatar-generator";
import { PushOptIn } from "@/components/push/push-opt-in";
import { EmailPreferencesCard } from "@/components/account/email-preferences-card";
import { LanguageCard } from "@/components/account/language-card";
import { PhoneCard } from "@/components/account/phone-card";
import { ResidenceCard } from "@/components/account/residence-card";
import { ReminderPreferencesCard } from "@/components/account/reminder-preferences-card";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { CountryBadge } from "@/components/profile/country-badge";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import {
  getRequestLocale,
  requestIsEnglishHost,
} from "@/lib/i18n/request-locale";
import { countryDisplayName } from "@/lib/residence";
import type { Metadata } from "next";
import { getReminderPreferences } from "@/lib/reminder-settings";
import { getPremiumSubscription } from "@/lib/premium";
import { SubscriptionCancelFlow } from "@/components/subscription/subscription-cancel-flow";
import {
  cheaperAlternativePlan,
  discountedPremiumPlanForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "Account" : "ანგარიში" };
}
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();

  const [
    [profile],
    photos,
    [emailPrefs],
    headerData,
    reminderData,
    subscription,
  ] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db
      .select({
        id: profilePhotos.id,
        url: profilePhotos.url,
        ready: profilePhotos.ready,
      })
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, user.id))
      .orderBy(asc(profilePhotos.sortOrder)),
    db
      .select({
        daily: users.emailDailyHoroscope,
        marketing: users.emailMarketing,
        nudges: users.emailNudges,
        locale: users.interfaceLanguage,
        countryCode: users.residenceCountryCode,
        city: users.residenceCity,
        phone: users.phone,
        phoneVerifiedAt: users.phoneVerifiedAt,
        emailVerified: users.emailVerified,
        hasPassword: sql<boolean>`${users.passwordHash} IS NOT NULL`,
        smsMarketing: users.smsMarketing,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    getHeaderData(user.id),
    getReminderPreferences(user.id),
    getPremiumSubscription(user.id),
  ]);
  // Same avatar resolution as the navbar so they never disagree.
  const accountAvatar = headerData.avatarUrl ?? user.image ?? null;
  const locale = await getRequestLocale(
    normalizeUserLocale(emailPrefs?.locale),
  );
  const en = locale !== "ka";
  const onEnglishHost = await requestIsEnglishHost();

  /**
   * The cheaper alternative offered in the cancellation flow. Returns null when
   * the user is already on the best rate, so the offer never upsells.
   */
  const discountedPlan =
    subscription && subscription.source === "stripe"
      ? cheaperAlternativePlan({
          candidate: discountedPremiumPlanForCountry(
            subscription.countryCode ?? emailPrefs?.countryCode ?? null,
          ),
          currentAmountMinor: subscription.amountMinor,
          currentCurrency: subscription.currency,
        })
      : null;

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.4),transparent_70%)]"
      />
      <Starfield count={70} />

      <AppHeader authed active="account" />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {en ? "Account" : "ანგარიში"}
        </div>
        <h1 className="mb-8 text-balance text-3xl font-semibold tracking-tight sm:mb-10 sm:text-5xl">
          {en
            ? user.name
              ? `${user.name.split(" ")[0]}'s account`
              : "Your account"
            : `${user.name?.split(" ")[0] ?? "შენი"}-ის ანგარიში`}
        </h1>

        {/* Profile */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
          {accountAvatar && (
            <Image
              src={accountAvatar}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full border border-border"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-base font-medium text-foreground">
              <span className="truncate">{user.name ?? "ვარსკვლავო"}</span>
              {headerData.isPremium && (
                <VerifiedBadge
                  label={
                    en ? "Vivida PRO verified" : "Vivida PRO ვერიფიცირებული"
                  }
                />
              )}
              <CountryBadge
                countryCode={emailPrefs?.countryCode}
                countryName={countryDisplayName(
                  emailPrefs?.countryCode,
                  locale,
                )}
              />
            </div>
            <div className="truncate text-sm text-foreground/65">
              {user.email}
            </div>
          </div>
          <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/75">
            Google
          </span>
        </div>

        {/* Language is a property of the domain, not of the account: vivida.ge
            renders Georgian for everyone. Offering a picker here would be a
            control that writes a preference this site then ignores. The
            international domain, where the choice is real, still shows it. */}
        {onEnglishHost && (
          <div className="mb-6">
            <LanguageCard initial={locale} />
          </div>
        )}

        {/* Profile photos, surfaced near the top so it's easy to find */}
        <div id="profile-photos" className="mb-6 scroll-mt-24">
          <PhotoUploader
            initial={photos
              .filter((p) => p.ready)
              .map((p) => ({
                id: p.id,
                url: p.url,
                ready: p.ready,
              }))}
            locale={locale}
          />
        </div>

        {/* AI zodiac avatar */}
        <div className="mb-6">
          <AiAvatarGenerator initialAvatar={accountAvatar} locale={locale} />
        </div>

        {/* Billing */}
        <div className="mb-6">
          <Link
            href={headerData.isPremium ? "/subscription" : "/credits"}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--vivida-cyan)]/30 bg-gradient-to-br from-[var(--vivida-cyan)]/10 via-card/60 to-[var(--vivida-violet)]/8 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5"
          >
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">
                {headerData.isPremium
                  ? "Vivida PRO"
                  : en
                    ? "Credits"
                    : "კრედიტები"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {headerData.isPremium
                  ? en
                    ? "Manage your subscription, billing, and renewal."
                    : "მართე გამოწერა, გადახდა და განახლება."
                  : en
                    ? "View your balance, top up, or invite a friend."
                    : "ნახე ბალანსი, შეავსე ან მოიწვიე მეგობარი."}
              </p>
            </div>
            <span
              aria-hidden
              className="text-2xl text-muted-foreground transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          {headerData.isPremium && subscription && (
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              {subscription.source === "crypto" ? (
                en ? (
                  `Vivida PRO · one-time pass · ends ${formatAccountDate(subscription.currentPeriodEnd, locale)} · no auto-renew`
                ) : (
                  `Vivida PRO · ერთჯერადი პასი · დასრულდება ${formatAccountDate(subscription.currentPeriodEnd, locale)} · ავტომატური განახლების გარეშე`
                )
              ) : subscription.source === "stripe" ? (
                <>
                  {subscription.cancelAtPeriodEnd
                    ? en
                      ? `Vivida PRO · ends ${formatAccountDate(subscription.currentPeriodEnd, locale)} · `
                      : `Vivida PRO · დასრულდება ${formatAccountDate(subscription.currentPeriodEnd, locale)} · `
                    : en
                      ? `Vivida PRO · renews ${formatAccountDate(subscription.currentPeriodEnd, locale)} · `
                      : `Vivida PRO · განახლდება ${formatAccountDate(subscription.currentPeriodEnd, locale)} · `}
                  <SubscriptionCancelFlow
                    locale={locale}
                    cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                    currentPriceLabel={formatBillingAmount(
                      subscription.amountMinor,
                      subscription.currency,
                      locale,
                    )}
                    discountedPriceLabel={
                      discountedPlan
                        ? formatBillingAmount(
                            discountedPlan.amountMinor,
                            discountedPlan.currency,
                            locale,
                          )
                        : null
                    }
                    discountedPeriodLabel={
                      discountedPlan
                        ? en
                          ? `${discountedPlan.intervalCount ?? 1} months`
                          : `${discountedPlan.intervalCount ?? 1} თვე`
                        : null
                    }
                  />
                </>
              ) : subscription.rcStore === "PLAY_STORE" ? (
                en ? (
                  "Vivida PRO · billed through Google Play, manage it in the Play Store settings."
                ) : (
                  "Vivida PRO · გადახდა Google Play-ით, მართე Play Store-ის პარამეტრებიდან."
                )
              ) : en ? (
                "Vivida PRO · billed through the App Store, manage it in the App Store settings."
              ) : (
                "Vivida PRO · გადახდა App Store-ით, მართე App Store-ის პარამეტრებიდან."
              )}
            </p>
          )}
        </div>

        {/* Push notifications */}
        <div className="mb-6">
          <PushOptIn locale={locale} />
        </div>

        <div id="reminders" className="mb-6 scroll-mt-24">
          <ReminderPreferencesCard
            initial={reminderData.preferences}
            initialCalendarToken={reminderData.calendarToken}
            locale={locale}
          />
        </div>

        {/* Email preferences */}
        <div className="mb-6">
          <EmailPreferencesCard
            locale={locale}
            initial={{
              daily: emailPrefs?.daily ?? true,
              marketing: emailPrefs?.marketing ?? true,
              nudges: emailPrefs?.nudges ?? true,
            }}
          />
        </div>

        <div className="mb-6">
          <ResidenceCard
            initialCountryCode={emailPrefs?.countryCode ?? null}
            initialCity={emailPrefs?.city ?? null}
            locale={locale}
          />
        </div>

        {/* Mobile number, SMS-verified phone login (Georgian host only;
            SMS codes go to Georgian numbers, so the card stays off English). */}
        {!onEnglishHost && (
          <div className="mb-6">
            <PhoneCard
              initialPhone={emailPrefs?.phone ?? null}
              initialPhoneLoginReady={
                !emailPrefs?.hasPassword ||
                Boolean(
                  emailPrefs.phoneVerifiedAt &&
                  emailPrefs.emailVerified &&
                  emailPrefs.phoneVerifiedAt.getTime() >=
                    emailPrefs.emailVerified.getTime(),
                )
              }
              initialSmsMarketing={emailPrefs?.smsMarketing ?? false}
              locale={locale}
            />
          </div>
        )}

        {/* Public profile fields */}
        <div className="mb-6">
          <VisibilityCard
            locale={locale}
            initial={{
              username: profile?.username ?? null,
              displayName: profile?.displayName ?? null,
              bio: profile?.bio ?? null,
              discoverable: profile?.discoverable ?? true,
            }}
            defaultName={user.name ?? null}
          />
        </div>

        {/* Birth data */}
        <div className="mb-6 rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {en ? "Birth details" : "დაბადების მონაცემები"}
            </h2>
            {profile?.dateOfBirth && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/onboarding">
                  <Pencil className="size-3.5" />
                  {en ? "Edit" : "რედაქტირება"}
                </Link>
              </Button>
            )}
          </div>
          {profile?.dateOfBirth ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Field
                label={en ? "Date of birth" : "დაბადების თარიღი"}
                value={profile.dateOfBirth}
              />
              <Field
                label={en ? "Time of birth" : "დაბადების დრო"}
                value={
                  profile.timeOfBirth
                    ? profile.timeOfBirth.slice(0, 5)
                    : en
                      ? "Unknown (12:00 used)"
                      : "უცნობია (გამოყენებულია 12:00)"
                }
              />
              <Field
                label={en ? "Place of birth" : "დაბადების ადგილი"}
                value={profile.cityName}
              />
              <Field
                label={en ? "Time zone" : "დროის სარტყელი"}
                value={profile.timezone}
              />
              <div className="sm:col-span-2">
                <GenderCard
                  initial={
                    profile.gender === "male" || profile.gender === "female"
                      ? profile.gender
                      : null
                  }
                  locale={locale}
                />
              </div>
            </dl>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                {en
                  ? "You have not created an astrology profile yet. Add your birth details to unlock your chart, horoscope and compatibility."
                  : "ასტრო პროფილი ჯერ არ შეგიქმნია. შეავსე დაბადების მონაცემები და გახსენი რუკა, ჰოროსკოპი და თავსებადობა."}
              </p>
              <Button asChild variant="mystic" className="mt-4">
                <Link href="/onboarding">
                  <Sparkles className="size-4" />
                  {en ? "Create astrology profile" : "ასტრო პროფილის შექმნა"}
                </Link>
              </Button>
            </div>
          )}
        </div>

        <DangerZone locale={locale} />
      </section>
    </main>
  );
}

function formatAccountDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
