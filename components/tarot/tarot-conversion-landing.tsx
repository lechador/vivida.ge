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
import { TarotReader } from "@/components/tarot/tarot-reader";
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
    a: "წერ შენს კითხვას, სისტემა შემთხვევითად შლის სამ კარტს — ფესვს, აწმყოსა და გზას — და AI ტაროლოგი თითოეულ მათგანს უშუალოდ შენს სიტუაციას უკავშირებს.",
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
    a: "ურთიერთობაზე, არჩევანზე, საქმეზე, ემოციურ მდგომარეობაზე ან მომდევნო ნაბიჯზე. ყველაზე სასარგებლოა ღია კითხვა — მაგალითად: „რა უნდა დავინახო ამ სიტუაციაში?“",
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
    text: "ფესვი, აწმყო და გზა — სამი პოზიცია, რომელიც სიტუაციას სხვადასხვა კუთხიდან გაჩვენებს.",
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
}: {
  authed: boolean;
  countryCode?: string | null;
  premium?: boolean;
}) {
  const packs = creditPacksForCountry(countryCode);
  const pro = featuredPremiumPlanForCountry(countryCode);
  const proMonths = pro.intervalCount ?? 1;
  // Signed-in users came to pull cards, not to be sold to: the hero banner and
  // every sales block (steps, pitch, pricing, closing CTA) render for logged-out
  // visitors only. SEO is untouched — crawlers are always unauthenticated.

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#070713]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[72rem] bg-[radial-gradient(55%_38%_at_75%_12%,rgba(115,91,255,0.28),transparent_72%),radial-gradient(45%_34%_at_12%_18%,rgba(203,88,166,0.2),transparent_72%),linear-gradient(180deg,#0c0b1d_0%,#070713_72%)]"
      />
      <Starfield count={140} shooting={2} />

      {authed ? (
        <AppHeader authed active="tarot" />
      ) : (
        <SmartHeader active="taro" locale="ka" georgianPath="/taro" />
      )}

      {!authed && (
        <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-16 lg:pt-12">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ba72]/30 bg-[#d7ba72]/8 px-3 py-1.5 text-xs font-semibold text-[#ead69f] ring-1 ring-white/5">
              <Sparkles className="size-3.5" />
              პერსონალური 3-კარტიანი გაშლა ქართულად
            </div>

            <h1 className="mt-5 text-balance text-[2.45rem] font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.6rem]">
              შენი კითხვა. სამი კარტი.
              <span className="mt-2 block bg-[linear-gradient(100deg,#eee2bc_5%,#d7a8ff_48%,#9fc9ff_92%)] bg-clip-text text-transparent">
                პირადი განმარტება.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              დაწერე კითხვა და მიიღე შენს სიტუაციაზე მორგებული პასუხი — სამი
              კარტით, მათი ახსნითა და პრაქტიკული მინიშნებით.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#tarot-reader"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8d67ff,#c958a4)] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_55px_-20px_rgba(145,93,255,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_65px_-18px_rgba(145,93,255,0.95)] focus:outline-none focus:ring-2 focus:ring-[#c4adff] focus:ring-offset-2 focus:ring-offset-[#070713]"
              >
                ჩემი პირველი კითხვა — ₾0
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <span className="text-center text-xs leading-5 text-white/60 sm:text-left">
                პასუხისთვის საჭიროა ანგარიში
                <br className="hidden sm:block" /> · ბარათი არ გჭირდება
              </span>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
              {[
                "პირველი გაშლა უფასოდ",
                "პასუხი ქართულად",
                "მზადაა წამებში",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-[#b9a4ff]" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto h-[330px] w-full max-w-[440px] sm:h-[420px] lg:h-[450px]">
            <div
              aria-hidden
              className="absolute inset-12 rounded-full bg-[radial-gradient(circle,rgba(140,103,255,0.26),rgba(102,62,161,0.05)_58%,transparent_72%)] blur-2xl"
            />
            <div className="absolute left-1/2 top-1/2 h-[310px] w-[207px] -translate-x-[93%] -translate-y-1/2 -rotate-[14deg] overflow-hidden rounded-[1.1rem] border border-[#d9bd79]/35 bg-[#111128] shadow-2xl sm:h-[365px] sm:w-[243px]">
              <Image
                src="/tarot/the-star.webp"
                alt="ვარსკვლავის ტაროს კარტი"
                fill
                loading="eager"
                sizes="(max-width: 640px) 220px, 270px"
                className="object-cover"
              />
            </div>
            <div className="absolute left-1/2 top-1/2 z-20 h-[330px] w-[220px] -translate-x-1/2 -translate-y-[53%] overflow-hidden rounded-[1.1rem] border border-[#f1d794]/60 bg-[#111128] shadow-[0_30px_80px_-28px_rgba(0,0,0,0.95),0_0_55px_-28px_rgba(224,191,113,0.8)] sm:h-[395px] sm:w-[263px]">
              <Image
                src="/tarot/the-high-priestess.webp"
                alt="უმაღლესი ქურუმი — ტაროს კარტი"
                fill
                preload
                sizes="(max-width: 640px) 233px, 293px"
                className="object-cover"
              />
            </div>
            <div className="absolute left-1/2 top-1/2 z-10 h-[310px] w-[207px] -translate-x-[7%] -translate-y-1/2 rotate-[14deg] overflow-hidden rounded-[1.1rem] border border-[#d9bd79]/35 bg-[#111128] shadow-2xl sm:h-[365px] sm:w-[243px]">
              <Image
                src="/tarot/the-moon.webp"
                alt="მთვარის ტაროს კარტი"
                fill
                sizes="(max-width: 640px) 220px, 270px"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#0c0c1d]/88 px-4 py-2 text-xs font-medium text-white/75 shadow-xl backdrop-blur-xl sm:bottom-2">
              78 კარტი · თითო გაშლა უნიკალურია
            </div>
          </div>
        </section>
      )}

      <section
        id="tarot-reader"
        className={`relative z-20 scroll-mt-24 border-white/8 bg-white/[0.025] ${
          authed ? "border-b" : "border-y"
        }`}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          {authed && <h1 className="sr-only">ტაროს კითხვა</h1>}
          <TarotReader
            authed={authed}
            cost={CREDIT_COST.tarot}
            locale="ka"
            countryCode={countryCode}
            premium={premium}
          />
          {!authed && (
            <p className="mt-4 text-center text-xs leading-5 text-white/45">
              პასუხის მისაღებად გაივლი სწრაფ რეგისტრაციას — შენი პირველი გაშლა
              ანგარიშზე ავტომატურად უფასოა.
            </p>
          )}
        </div>
      </section>

      {!authed && (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cab8ff]">
              მარტივი პროცესი
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              კითხვა, სამი კარტი, ახალი ხედვა
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {READING_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.n}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[inset_0_1px_rgba(255,255,255,0.06)] sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#8d67ff]/12 text-[#c7b5ff] ring-1 ring-[#a78cff]/20">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-white/25">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    {step.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!authed && (
        <section className="relative z-10 border-y border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.035))]">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative mx-auto h-[430px] w-[290px] sm:h-[500px] sm:w-[340px]">
              <div className="absolute inset-8 rounded-full bg-[#8d67ff]/18 blur-3xl" />
              <div className="absolute inset-0 overflow-hidden rounded-[1.65rem] border border-[#d9bd79]/40 shadow-[0_35px_90px_-38px_rgba(0,0,0,0.95)]">
                <Image
                  src="/tarot/the-hermit.webp"
                  alt="განდეგილის ტაროს კარტი"
                  fill
                  sizes="(max-width: 640px) 290px, 340px"
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cab8ff]">
                შენზე მორგებული განმარტება
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                არა ზოგადი ტექსტი — პასუხი შენს კონკრეტულ კითხვაზე
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
                Vivida არ გაჩვენებს მხოლოდ კარტების ცალკეულ მნიშვნელობებს. AI
                ტაროლოგი აკავშირებს სამივე სიმბოლოს შენს კითხვასთან და გაძლევს
                ერთიან, გასაგებ ინტერპრეტაციას.
              </p>
              <ul className="mt-7 space-y-4">
                {[
                  "ფესვი — რა დგას სიტუაციის უკან",
                  "აწმყო — რას გიჩვენებს ეს მომენტი",
                  "გზა — სად ღირს ყურადღების მიმართვა",
                  "მოკლე პრაქტიკული მინიშნება შემდეგი ნაბიჯისთვის",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/72 sm:text-base"
                  >
                    <Check className="mt-0.5 size-5 shrink-0 text-[#bca8ff]" />
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
          className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cab8ff]">
              მარტივი და გამჭვირვალე ფასი
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              პირველი პასუხი ჩვენგანაა
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/58 sm:text-base">
              დაიწყე უფასოდ. თუ კიდევ დაგჭირდება კითხვა, აირჩიე ერთჯერადი
              კრედიტები — გამოწერის გარეშე.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="relative flex min-h-[260px] flex-col rounded-3xl border border-[#c1a7ff]/40 bg-[linear-gradient(145deg,rgba(141,103,255,0.19),rgba(201,88,164,0.08))] p-6 shadow-[0_25px_75px_-42px_rgba(141,103,255,0.8)]">
              <span className="w-fit rounded-full bg-[#c8b5ff]/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d8ccff]">
                დაიწყე აქ
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">
                პირველი გაშლა
              </h3>
              <div className="mt-2 text-4xl font-bold tracking-tight text-white">
                ₾0
              </div>
              <p className="mt-3 text-sm leading-6 text-white/58">
                სრული პერსონალური პასუხი, სამივე კარტითა და მინიშნებით.
              </p>
              <a
                href="#tarot-reader"
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#141126] transition hover:bg-[#f1edff]"
              >
                დასვი პირველი კითხვა
              </a>
            </article>

            {packs.map((pack, index) => {
              const readings = Math.floor(pack.credits / CREDIT_COST.tarot);
              const featured = index === 1;
              return (
                <article
                  key={pack.id}
                  className={`relative flex min-h-[260px] flex-col rounded-3xl border p-6 ${
                    featured
                      ? "border-[#d3bb79]/45 bg-[linear-gradient(145deg,rgba(217,187,121,0.13),rgba(255,255,255,0.03))]"
                      : "border-white/10 bg-white/[0.035]"
                  }`}
                >
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${featured ? "bg-[#d3bb79]/14 text-[#ead69f]" : "bg-white/6 text-white/45"}`}
                  >
                    {index === 0
                      ? "საწყისი"
                      : index === 1
                        ? "ყველაზე პოპულარული"
                        : "საუკეთესო ფასი"}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {readings} დამატებითი კითხვა
                  </h3>
                  <div className="mt-2 text-4xl font-bold tracking-tight text-white">
                    {formatBillingAmount(pack.amountMinor, pack.currency, "ka")}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">
                    {pack.credits} კრედიტი · ერთჯერადი უსაფრთხო გადახდა
                  </p>
                  <Link
                    href={contextualCreditsHref({
                      returnTo: "/taro",
                      need: CREDIT_COST.tarot,
                      product: "tarot",
                      packId: pack.id,
                    })}
                    className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${featured ? "bg-[#d3bb79] text-[#17130b] hover:bg-[#ead69f]" : "border border-white/12 bg-white/6 text-white hover:bg-white/10"}`}
                  >
                    პაკეტის არჩევა
                  </Link>
                </article>
              );
            })}
          </div>

          {pro && (
            <div className="mt-5 flex flex-col gap-5 rounded-3xl border border-[#d3bb79]/25 bg-[#d3bb79]/[0.055] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#d3bb79]/12 text-[#ead69f] ring-1 ring-[#d3bb79]/20">
                  <Crown className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">
                    გინდა ტარო შეზღუდვის გარეშე?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Vivida PRO მოიცავს ულიმიტო ტაროს, AI ჩატს, პროგნოზებსა და
                    PDF ანგარიშებს.
                  </p>
                </div>
              </div>
              <Link
                href={`/subscription?${new URLSearchParams({ next: "/taro", product: "tarot" }).toString()}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d3bb79]/35 bg-[#d3bb79]/10 px-5 py-3 text-sm font-semibold text-[#ead69f] transition hover:bg-[#d3bb79]/16"
              >
                {formatBillingAmount(pro.amountMinor, pro.currency, "ka")} /{" "}
                {proMonths === 1 ? "თვე" : `${proMonths} თვე`}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/42">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> უსაფრთხო გადახდა
            </span>
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="size-4" /> პირადი კითხვა
            </span>
            <span className="flex items-center gap-1.5">
              <CircleCheck className="size-4" /> პაკეტებზე ავტოგანახლება არ არის
            </span>
          </div>
        </section>
      )}

      <section className="relative z-10 border-y border-white/8 bg-white/[0.02]">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cab8ff]">
              ხშირად დასმული კითხვები
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              სანამ კარტებს გაშლი
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-black/10 open:bg-white/[0.035]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-7 text-white/58">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 ${
          authed ? "py-10 sm:py-14" : "py-20 sm:py-28"
        }`}
      >
        {!authed && (
          <div className="overflow-hidden rounded-[2rem] border border-[#b89eff]/25 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(141,103,255,0.22),transparent_72%),rgba(255,255,255,0.03)] px-6 py-14 text-center shadow-[0_35px_100px_-55px_rgba(141,103,255,0.95)] sm:px-12 sm:py-20">
            <Sparkles className="mx-auto size-7 text-[#cfbeff]" />
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              როცა პასუხი არ ჩანს, ზოგჯერ ერთი ახალი კუთხეც საკმარისია
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/58 sm:text-base">
              დასვი კითხვა და ნახე, რას გიჩვენებს შენი სამი კარტი.
            </p>
            <a
              href="#tarot-reader"
              className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-[#151127] transition hover:-translate-y-0.5 hover:bg-[#f2eeff]"
            >
              ჩემი პასუხის ნახვა
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        )}

        <details
          className={`group mx-auto max-w-5xl ${
            authed ? "" : "mt-14 border-t border-white/8 pt-6"
          }`}
        >
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-sm font-medium text-white/55 transition hover:text-white/80 [&::-webkit-details-marker]:hidden">
            ტაროს 78 კარტის მნიშვნელობები
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {tarotDetailDeck("ka").map((card) => (
              <Link
                key={card.slug}
                href={`/taro/${card.slug}`}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3.5 py-3 text-sm text-white/65 transition hover:border-[#a88dff]/25 hover:bg-white/[0.045] hover:text-white"
              >
                <span className="text-lg">{card.glyph}</span>
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
