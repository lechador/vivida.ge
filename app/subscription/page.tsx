import { Check, Crown } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import {
  getOrProvisionSubscription,
  isOnTrial,
  isProActive,
  trialDaysLeft,
} from "@/lib/plan";
import { PLANS, PRO_HIGHLIGHTS, formatPrice } from "@/lib/pricing";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";

export const metadata = { title: "გამოწერა" };
export const dynamic = "force-dynamic";

function fmtDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const sub = await getOrProvisionSubscription(user.id);

  const pro = isProActive(sub);
  const trial = isOnTrial(sub);
  const daysLeft = trialDaysLeft(sub);
  const isPaid =
    !!sub?.stripeSubscriptionId &&
    (sub.status === "active" || sub.status === "past_due");
  const cancelAtEnd = !!sub?.cancelAtPeriodEnd;
  const periodEnd = fmtDate(sub?.currentPeriodEnd);
  const priceLabel = formatPrice(PLANS.pro.price.month);

  // Status line
  let badge: { text: string; color: string };
  let detail: string | null = null;
  if (isPaid && sub?.status === "past_due") {
    badge = { text: "გადახდა ვერ მოხერხდა", color: "var(--vivida-pink)" };
    detail = "განაახლე ბარათი, რომ Pro შეგრჩეს.";
  } else if (isPaid && cancelAtEnd) {
    badge = { text: "Pro · გაუქმდება", color: "var(--vivida-gold)" };
    detail = periodEnd ? `მოქმედებს ${periodEnd}-მდე.` : null;
  } else if (isPaid) {
    badge = { text: "Pro · აქტიური", color: "var(--vivida-cyan)" };
    detail = periodEnd ? `შემდეგი გადახდა: ${periodEnd}` : null;
  } else if (trial) {
    badge = { text: "საცდელი პერიოდი", color: "var(--vivida-violet)" };
    detail = `დარჩა ${daysLeft} დღე — შემდეგ უფასო გეგმაზე გადახვალ.`;
  } else {
    badge = { text: "უფასო გეგმა", color: "var(--muted-foreground)" };
    detail = "Pro ფუნქციები ჯერ დახურულია.";
  }

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_350/0.3),transparent_70%)]"
      />
      <Starfield count={90} />
      <AppHeader authed plan={pro ? "pro" : "free"} active="pro" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <h1 className="mb-6 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          გამოწერა
        </h1>

        {sp.status === "success" && (
          <div className="mb-5 rounded-xl border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 p-4 text-sm text-foreground/90">
            მადლობა! Pro გააქტიურდა. შესაძლოა რამდენიმე წამი დასჭირდეს განახლებას.
          </div>
        )}

        {/* Status card */}
        <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                შენი გეგმა
              </div>
              <div
                className="mt-1 text-xl font-semibold tracking-tight"
                style={{ color: badge.color }}
              >
                {badge.text}
              </div>
              {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
            </div>
            <div
              className="grid size-12 shrink-0 place-items-center rounded-full"
              style={{ background: `color-mix(in oklch, ${badge.color} 16%, transparent)`, color: badge.color }}
            >
              <Crown className="size-6" />
            </div>
          </div>

          <div className="mt-5">
            {isPaid ? (
              <SubscriptionActions mode="manage" priceLabel={priceLabel} />
            ) : (
              <SubscriptionActions mode="subscribe" priceLabel={priceLabel} />
            )}
          </div>
        </div>

        {/* Pro features */}
        <div className="mt-6 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 via-card/60 to-[var(--vivida-cyan)]/8 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <h2 className="text-lg font-semibold tracking-tight">
            რას მოიცავს{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              Vivida Pro
            </span>
          </h2>
          <ul className="mt-4 space-y-2.5">
            {PRO_HIGHLIGHTS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                {f}
              </li>
            ))}
          </ul>
          {!isPaid && (
            <p className="mt-5 text-sm text-muted-foreground">
              {priceLabel}/თვე · ნებისმიერ დროს გააუქმე.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          გადახდას ამუშავებს Stripe. ბარათის მონაცემები Vivida-ს არ ინახავს.
        </p>
      </section>
    </main>
  );
}
