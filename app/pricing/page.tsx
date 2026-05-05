import { Sparkles } from "lucide-react";

import { auth } from "@/auth";
import {
  getCurrentPlan,
  getOrProvisionSubscription,
  isOnTrial,
  trialDaysLeft,
} from "@/lib/plan";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "ფასები" };

const KA_DATE = new Intl.DateTimeFormat("ka-GE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function PricingPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  // Sequential — the lazy fetch must run before any read that the user
  // sees, otherwise a freshly-signed-up email user lands on /pricing
  // with no subscription row and sees "free" instead of their trial.
  const subscription = authed
    ? await getOrProvisionSubscription(session!.user.id)
    : null;
  const currentPlan = authed
    ? await getCurrentPlan(session!.user.id)
    : ("free" as const);
  const onTrial = isOnTrial(subscription);
  const trialEnds = onTrial && subscription?.currentPeriodEnd
    ? KA_DATE.format(subscription.currentPeriodEnd)
    : null;
  const trialDays = trialDaysLeft(subscription);
  const isPaidPro =
    currentPlan === "pro" && !onTrial && subscription?.status === "active";

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_0%,oklch(0.28_0.12_300/0.45),transparent_70%),radial-gradient(40%_30%_at_85%_70%,oklch(0.32_0.13_200/0.35),transparent_70%)]"
      />
      <Starfield count={90} />

      <AppHeader authed={authed} plan={currentPlan} />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-[var(--vivida-cyan)] vivida-pulse" />
            ფასები
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            აირჩიე ის პაკეტი, რომელიც{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              შენ გერგება
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            დაიწყე უფასოდ. გადადი Pro-ზე, როცა მზად იქნები, შენი კოსმოსი უფრო
            ღრმად შეიცნო.
          </p>
        </div>

        {/* Current-plan banner — shown only to authed users so they always
            know what they have before deciding to upgrade. */}
        {authed && (onTrial || isPaidPro) && (
          <div className="mx-auto mb-10 max-w-2xl overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-r from-[var(--vivida-violet)]/15 via-[var(--vivida-pink)]/8 to-[var(--vivida-cyan)]/15 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-violet)]/20 ring-1 ring-[var(--vivida-violet)]/40">
                <Sparkles className="size-4 text-[var(--vivida-violet)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-muted-foreground">
                  თქვენი მიმდინარე გეგმა
                </div>
                {onTrial ? (
                  <>
                    <div className="mt-0.5 text-base font-semibold text-foreground sm:text-lg">
                      Pro · უფასო საცდელი
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      საცდელი {trialEnds}-მდე ·{" "}
                      <span className="text-[var(--vivida-violet)]">
                        {trialDays === 1 ? "1 დღე" : `${trialDays} დღე`}
                      </span>{" "}
                      დარჩა. გააგრძელე Pro-თი ფასიან გეგმაზე გადასვლით.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mt-0.5 text-base font-semibold text-foreground sm:text-lg">
                      Pro · აქტიური
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      მადლობა, რომ Pro-თი სარგებლობ. შენი გეგმა აქტიურია.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <PricingCards
          authed={authed}
          currentPlan={currentPlan}
          onTrial={onTrial}
        />

        <section className="mt-20">
          <h2 className="mb-6 text-center text-xl font-semibold tracking-tight">
            ხშირად დასმული კითხვები
          </h2>
          <dl className="mx-auto max-w-2xl space-y-4">
            {FAQ.map((q, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl"
              >
                <dt className="text-sm font-semibold text-foreground">
                  {q.q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {q.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}

const FAQ = [
  {
    q: "გამოწერის გაუქმება ნებისმიერ დროს შემეძლება?",
    a: "კი, გამოწერას ძალიან მარტივად გააუქმებ შენი ანგარიშის გვერდიდან. Pro ფუნქციები კი გადახდილი პერიოდის ბოლომდე შენთან დარჩება.",
  },
  {
    q: "როგორ ხდება გადახდა?",
    a: "გადახდები Flitt-ის დაცული პლატფორმით სრულდება. ბარათის მონაცემებს ჩვენ არ ვინახავთ — ყველაფერი Flitt-ის მხარეს, PCI DSS სტანდარტის სრული დაცვით ხდება.",
  },
  {
    q: "რა მოხდება, თუ დაბადების მონაცემებს შევცვლი?",
    a: "დაბადების თარიღი ფიქსირდება რეგისტრაციაზე და ვერ შეიცვლება. დროისა და ადგილის კორექცია კი შეიძლება ნებისმიერ დროს ანგარიშის გვერდიდან — ჩვენი რუკა და AI ანალიზი ავტომატურად განახლდება.",
  },
  {
    q: "რომელ ენაზეა ჰოროსკოპები?",
    a: "ყველაფერი ქართულადაა და სრულად შენზეა მორგებული.",
  },
];
