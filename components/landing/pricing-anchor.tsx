import Link from "next/link";
import { Check, Coins, Crown, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { CREDIT_COST } from "@/lib/credits-config";

/**
 * Georgian homepage price anchor. The hero promises free starter credits but
 * named no price, so a first-time visitor had to hit a paywall before learning
 * what continuing costs. This states the ladder up front, free start, one
 * one-time starter pack, then PRO for frequent use, with every amount read
 * from the billing catalogue rather than hard-coded copy.
 */
export function PricingAnchor() {
  const starter = creditPacksForCountry("GE")[0];
  const pro = featuredPremiumPlanForCountry("GE");
  const proMonths = pro.intervalCount ?? 1;
  const tarotReadings = Math.floor(starter.credits / CREDIT_COST.tarot);

  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          დაიწყე უფასოდ,{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            გააგრძელე როცა გინდა
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
          ფასი გადახდამდე ჩანს. კრედიტები ერთჯერადი შენაძენია, გამოწერის გარეშე.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="flex flex-col rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Sparkles className="size-4" /> უფასო დაწყება
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight">₾0</div>
          <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground/75">
            {[
              "ნატალური რუკა და დიდი სამეული",
              "საწყისი კრედიტები საჩუქრად",
              "პირველი ტარო კითხვა უფასოდ",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href="/signup">შექმენი რუკა უფასოდ</Link>
          </Button>
        </article>

        <article className="flex flex-col rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/7 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vivida-cyan)]">
            <Coins className="size-4" /> კრედიტები
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight">
              {formatBillingAmount(starter.amountMinor, starter.currency, "ka")}
            </span>
            <span className="text-xs text-muted-foreground">
              / {starter.credits} კრედიტი
            </span>
          </div>
          <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground/75">
            {[
              `${tarotReadings} დამატებითი ტარო კითხვა`,
              "ერთჯერადი გადახდა, ავტოგანახლების გარეშე",
              "დარჩენილი კრედიტები ბალანსზე რჩება",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="mystic" className="mt-5 w-full">
            <Link href="/taro">სცადე ტარო</Link>
          </Button>
        </article>

        <article className="flex flex-col rounded-2xl border border-[var(--vivida-gold)]/35 bg-gradient-to-br from-[var(--vivida-gold)]/12 to-[var(--vivida-violet)]/10 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vivida-gold)]">
            <Crown className="size-4" /> Vivida PRO
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight">
              {formatBillingAmount(pro.amountMinor, pro.currency, "ka")}
            </span>
            <span className="text-xs text-muted-foreground">
              / {proMonths} თვე
            </span>
          </div>
          <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground/75">
            {[
              "ყველა ფუნქცია ულიმიტოდ",
              "საუკეთესოა ხშირი კითხვებისთვის",
              "გააუქმე ნებისმიერ დროს",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-gold)]" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href="/subscription">ნახე PRO</Link>
          </Button>
        </article>
      </div>
    </section>
  );
}
