import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Crown,
  LockKeyhole,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { InlineBirthDatePrompt } from "@/components/astro/inline-birth-date-prompt";
import { TarotReader } from "@/components/tarot/tarot-reader";
import { Button } from "@/components/ui/button";
import {
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { CREDIT_COST } from "@/lib/credits-config";
import { contextualCreditsHref } from "@/lib/safe-return-path";
import { tarotDetailDeck } from "@/lib/tarot/detail";

const FAQ = [
  {
    q: "როგორ მუშაობს Vivida-ს ტარო?",
    a: "წერ შენს კითხვას, სისტემა შემთხვევითად შლის სამ კარტს, ფესვს, აწმყოსა და გზას, და AI ტაროლოგი თითოეულ მათგანს უშუალოდ შენს სიტუაციას უკავშირებს.",
  },
  {
    q: "პირველი კითხვა ნამდვილად უფასოა?",
    a: "დიახ. პირველი პერსონალური გაშლა ₾0 ღირს. შემდეგი კითხვებისთვის დაგჭირდება 10 კრედიტი; შეგიძლია კრედიტების პაკეტი ერთჯერადად შეიძინო ან Vivida PRO გამოიყენო.",
  },
  {
    q: "ტარო მომავალს ზუსტად წინასწარმეტყველებს?",
    a: "ტარო არ არის უცვლელი მომავლის გარანტია. ის გეხმარება დაინახო შენი სიტუაციის ფარული მხარეები, შესაძლო მიმართულებები და ის კითხვა, რომელიც გადაწყვეტილების მიღებისას გამოგადგება.",
  },
  {
    q: "ჩემი კითხვა კონფიდენციალურია?",
    a: "შენი კითხვა პირადია და საჯაროდ არ ქვეყნდება. გამოიყენე ტარო როგორც პირადი რეფლექსიის ინსტრუმენტი და ნუ ჩაწერ ზედმეტად მგრძნობიარე პერსონალურ ინფორმაციას.",
  },
  {
    q: "რა თემაზე შემიძლია კითხვა?",
    a: "ურთიერთობაზე, არჩევანზე, საქმეზე, ემოციურ მდგომარეობაზე ან მომდევნო ნაბიჯზე. ყველაზე სასარგებლოა ღია კითხვა, მაგალითად: „რა უნდა დავინახო ამ სიტუაციაში?“",
  },
];

const READING_STEPS = [
  {
    n: "01",
    icon: MessageCircleQuestion,
    title: "დასვი ერთი მკაფიო კითხვა",
    text: "დაწერე ის, რაც ახლა ყველაზე მეტად გაწუხებს ან რაზეც სიცხადე გჭირდება.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "გაიშლება სამი კარტი",
    text: "ფესვი, აწმყო და გზა, სამი პოზიცია, რომელიც სიტუაციას სხვადასხვა კუთხიდან გაჩვენებს.",
  },
  {
    n: "03",
    icon: Clock3,
    title: "მიიღე პასუხი წამებში",
    text: "პერსონალური განმარტება ქართულად, თითოეული კარტის მნიშვნელობით და პრაქტიკული მინიშნებით.",
  },
];

export function TarotConversionLanding({
  authed,
  countryCode,
  premium = false,
  showBirthDatePrompt = false,
}: {
  authed: boolean;
  countryCode?: string | null;
  premium?: boolean;
  showBirthDatePrompt?: boolean;
}) {
  const packs = creditPacksForCountry(countryCode);
  const pro = featuredPremiumPlanForCountry(countryCode);
  const proMonths = pro.intervalCount ?? 1;

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <Starfield count={48} />

      {authed ? (
        <AppHeader authed active="tarot" />
      ) : (
        <SmartHeader active="taro" locale="ka" georgianPath="/taro" />
      )}

      {!authed && (
        <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="relative z-10 max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ონლაინ ტარო · პერსონალური 3-კარტიანი გაშლა ქართულად
            </div>

            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
              შენი კითხვა. სამი კარტი.{" "}
              <span className="text-primary">პირადი განმარტება.</span>
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              დაწერე კითხვა და მიიღე შენს სიტუაციაზე მორგებული პასუხი, სამი
              კარტით, მათი ახსნითა და პრაქტიკული მინიშნებით.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="min-h-12 px-6 text-base">
                <a href="#tarot-reader">
                  ჩემი პირველი კითხვა · ₾0
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <span className="text-center font-mono text-xs text-muted-foreground sm:text-left">
                პასუხისთვის საჭიროა ანგარიში · ბარათი არ გჭირდება
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-5 font-mono text-xs text-muted-foreground">
              <span>პირველი გაშლა უფასოდ</span>
              <span aria-hidden>·</span>
              <span>პასუხი ქართულად</span>
              <span aria-hidden>·</span>
              <span>მზადაა წამებში</span>
            </div>
          </div>

          <div className="relative mx-auto h-[330px] w-full max-w-[440px] sm:h-[400px] lg:h-[420px]">
            <div className="absolute left-1/2 top-1/2 h-[290px] w-[195px] -translate-x-[92%] -translate-y-1/2 -rotate-[12deg] overflow-hidden rounded-md border border-border bg-card shadow-xl sm:h-[345px] sm:w-[230px]">
              <Image
                src="/tarot/the-star.webp"
                alt="ვარსკვლავის ტაროს კარტი"
                fill
                loading="eager"
                sizes="(max-width: 640px) 220px, 270px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="absolute left-1/2 top-1/2 z-20 h-[310px] w-[208px] -translate-x-1/2 -translate-y-[53%] overflow-hidden rounded-md border border-primary/50 bg-card shadow-2xl sm:h-[370px] sm:w-[248px]">
              <Image
                src="/tarot/the-high-priestess.webp"
                alt="უმაღლესი ქურუმი, ტაროს კარტი"
                fill
                preload
                sizes="(max-width: 640px) 233px, 293px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="absolute left-1/2 top-1/2 z-10 h-[290px] w-[195px] -translate-x-[8%] -translate-y-1/2 rotate-[12deg] overflow-hidden rounded-md border border-border bg-card shadow-xl sm:h-[345px] sm:w-[230px]">
              <Image
                src="/tarot/the-moon.webp"
                alt="მთვარის ტაროს კარტი"
                fill
                sizes="(max-width: 640px) 220px, 270px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-sm border border-border bg-card px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:bottom-2">
              78 კარტი · თითო გაშლა უნიკალურია
            </div>
          </div>
        </section>
      )}

      <section
        id="tarot-reader"
        className={`relative z-20 scroll-mt-24 border-border bg-card/30 ${
          authed ? "border-b" : "border-y"
        }`}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {authed && <h1 className="sr-only">ტაროს კითხვა</h1>}
          {showBirthDatePrompt && <InlineBirthDatePrompt locale="ka" />}
          <TarotReader
            authed={authed}
            cost={CREDIT_COST.tarot}
            locale="ka"
            countryCode={countryCode}
            premium={premium}
          />
          {!authed && (
            <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
              პასუხის მისაღებად გაივლი სწრაფ რეგისტრაციას, შენი პირველი გაშლა
              ანგარიშზე ავტომატურად უფასოა.
            </p>
          )}
        </div>
      </section>

      {!authed && (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              01 · პროცესი
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              კითხვა, სამი კარტი, ახალი ხედვა
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {READING_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.n}
                  className="flex flex-col bg-card p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-sm border border-border bg-background/60 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!authed && (
        <section className="relative z-10 border-y border-border bg-card/30">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="relative mx-auto h-[400px] w-[270px] sm:h-[460px] sm:w-[310px]">
              <div className="absolute inset-0 overflow-hidden rounded-md border border-border bg-card shadow-2xl">
                <Image
                  src="/tarot/the-hermit.webp"
                  alt="განდეგილის ტაროს კარტი"
                  fill
                  sizes="(max-width: 640px) 290px, 340px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                02 · ინტერპრეტაცია
              </p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                არა ზოგადი ტექსტი, პასუხი შენს კონკრეტულ კითხვაზე
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Vivida არ გაჩვენებს მხოლოდ კარტების ცალკეულ მნიშვნელობებს. AI
                ტაროლოგი აკავშირებს სამივე სიმბოლოს შენს კითხვასთან და გაძლევს
                ერთიან, გასაგებ ინტერპრეტაციას.
              </p>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {[
                  "ფესვი — რა დგას სიტუაციის უკან",
                  "აწმყო — რას გიჩვენებს ეს მომენტი",
                  "გზა — სად ღირს ყურადღების მიმართვა",
                  "მოკლე პრაქტიკული მინიშნება შემდეგი ნაბიჯისთვის",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 py-3 text-sm text-foreground/90"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {!authed && (
        <section
          id="pricing"
          className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mb-10 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              03 · ფასი და კრედიტები
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              პირველი პასუხი ჩვენგანაა
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              დაიწყე უფასოდ. თუ კიდევ დაგჭირდება კითხვა, აირჩიე ერთჯერადი
              კრედიტები, გამოწერის გარეშე.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <article className="flex min-h-[250px] flex-col bg-card p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                დაიწყე აქ
              </span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                პირველი გაშლა
              </h3>
              <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground">
                ₾0
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                სრული პერსონალური პასუხი, სამივე კარტითა და მინიშნებით.
              </p>
              <Button asChild variant="outline" className="mt-auto w-full">
                <a href="#tarot-reader">დასვი პირველი კითხვა</a>
              </Button>
            </article>

            {packs.map((pack, index) => {
              const readings = Math.floor(pack.credits / CREDIT_COST.tarot);
              const featured = index === 1;
              return (
                <article
                  key={pack.id}
                  className={`flex min-h-[250px] flex-col p-6 ${
                    featured ? "bg-secondary/40" : "bg-card"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
                      featured ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {index === 0
                      ? "საწყისი"
                      : index === 1
                        ? "ყველაზე პოპულარული"
                        : "საუკეთესო ფასი"}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {readings} დამატებითი კითხვა
                  </h3>
                  <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground">
                    {formatBillingAmount(pack.amountMinor, pack.currency, "ka")}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {pack.credits} კრედიტი · ერთჯერადი უსაფრთხო გადახდა
                  </p>
                  <Button
                    asChild
                    variant={featured ? "default" : "outline"}
                    className="mt-auto w-full"
                  >
                    <Link
                      href={contextualCreditsHref({
                        returnTo: "/taro",
                        need: CREDIT_COST.tarot,
                        product: "tarot",
                        packId: pack.id,
                      })}
                    >
                      პაკეტის არჩევა
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>

          {pro && (
            <div className="mt-4 flex flex-col gap-5 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <Crown className="size-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    გინდა ტარო შეზღუდვის გარეშე?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Vivida PRO მოიცავს ულიმიტო ტაროს, AI ჩატს, პროგნოზებსა და
                    PDF ანგარიშებს.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link
                  href={`/subscription?${new URLSearchParams({ next: "/taro", product: "tarot" }).toString()}`}
                >
                  {formatBillingAmount(pro.amountMinor, pro.currency, "ka")} /{" "}
                  {proMonths === 1 ? "თვე" : `${proMonths} თვე`}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" /> უსაფრთხო გადახდა
            </span>
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="size-3.5 text-primary" /> პირადი კითხვა
            </span>
            <span className="flex items-center gap-1.5">
              <CircleCheck className="size-3.5 text-primary" /> პაკეტებზე
              ავტოგანახლება არ არის
            </span>
          </div>
        </section>
      )}

      <section className="relative z-10 border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ხშირად დასმული კითხვები
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              სანამ კარტებს გაშლი
            </h2>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-border/60 bg-background/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 ${
          authed ? "py-10 sm:py-14" : "py-16 sm:py-24"
        }`}
      >
        {!authed && (
          <div className="flex flex-col justify-between gap-6 rounded-md border border-border bg-card p-7 sm:flex-row sm:items-center sm:p-10">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                პერსონალური გაშლა
              </p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                როცა პასუხი არ ჩანს, ზოგჯერ ერთი ახალი კუთხეც საკმარისია
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                დასვი კითხვა და ნახე, რას გიჩვენებს შენი სამი კარტი.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <a href="#tarot-reader">
                ჩემი პასუხის ნახვა
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        )}

        <details
          className={`group mx-auto max-w-5xl ${
            authed ? "" : "mt-12 border-t border-border pt-6"
          }`}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span>ტაროს 78 კარტის მნიშვნელობები</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {tarotDetailDeck("ka").map((card) => (
              <Link
                key={card.slug}
                href={`/taro/${card.slug}`}
                className="flex items-center gap-3 bg-card px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/45 hover:text-foreground"
              >
                <span className="text-base">{card.glyph}</span>
                <span className="truncate">{card.name}</span>
              </Link>
            ))}
          </div>
        </details>
      </section>

      <SiteFooter locale="ka" />
    </main>
  );
}
