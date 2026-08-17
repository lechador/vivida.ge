import Link from "next/link";
import {
  Brain,
  Compass,
  Globe2,
  Heart,
  MessageCircle,
  Sparkles,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { localizedAlternates } from "@/lib/seo/locales";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const am = locale === "am";
  return {
    title: am ? "Vivida-ի հնարավորությունները" : en ? "Features" : "ფუნქციები",
    description: am
      ? "Նատալ քարտեզ, ամենօրյա կանխատեսումներ, համատեղելիություն, AI վերլուծություն և հանրային պրոֆիլ՝ Vivida-ի բոլոր հնարավորությունները մեկ տեղում։"
      : en
        ? "Birth charts, daily forecasts, compatibility, AI insights, and a public profile—explore every Vivida feature."
        : "ნატალური რუკა, ყოველდღიური პროგნოზი, თავსებადობა, AI ანალიზი, საჯარო პროფილი — Vivida-ს ყველა ფუნქცია ერთ ადგილას.",
    // Same-path pair: the English version lives at /features on the
    // international host. Self-canonicalizes per domain AND declares the
    // reciprocal hreflang — the sitemap alone was one-way (only the English
    // side named a Georgian partner), so Google dropped the pair and treated
    // the two domains as competing duplicates.
    alternates: localizedAlternates(
      am ? "/am/features" : "/features",
      "/features",
      locale,
    ),
  };
}

type Feature = {
  Icon: LucideIcon;
  title: string;
  body: string;
  hue: string;
};

const FEATURES: Feature[] = [
  {
    Icon: Sun,
    title: "ყოველდღიური პროგნოზი",
    body: "შენი დღევანდელი ცა — ერთხელ დაგენერირებული, შენი ნატალური რუკით პერსონალიზებული. ემოციური ფონი, შესაძლებლობა, ფოკუსის ზონა.",
    hue: "oklch(0.82 0.16 80)",
  },
  {
    Icon: Compass,
    title: "სრული ნატალური რუკა",
    body: "ცოცხალი ვიზუალი — 12 ნიშანი, 12 სახლი, 10+ პლანეტა, ყველა ასპექტი. შენი დიდი სამეული (მზე, მთვარე, ამომავალი) ცენტრში.",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    Icon: Heart,
    title: "თავსებადობა (Synastry)",
    body: "ნახე ვისთან რეზონირებ კოსმოსურად — სიყვარული, მეგობრობა, კომუნიკაცია, ზრდა, ქიმია. პროცენტი + დეტალური ახსნა.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: Brain,
    title: "AI ინტერპრეტაცია",
    body: "შენი რუკის ემოციური პორტრეტი, შექმნილი AI-ს მიერ. არა ზოგადი ჰოროსკოპი — შენი მონაცემების მიხედვით პერსონალური ანალიზი.",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Sparkles,
    title: "მნიშვნელოვანი შტრიხები",
    body: "AI შენს რუკაში ყველაზე საინტერესო კავშირებს პოულობს — სტელიუმები, ძლიერი ასპექტები, უნიკალური აქცენტები.",
    hue: "oklch(0.72 0.22 350)",
  },
  {
    Icon: UserCircle,
    title: "საჯარო პროფილი",
    body: "შექმენი @username, ატვირთე ფოტოები, დაწერე ბიო — სხვებმა აღმოგაჩინონ შენი ნიშნით და მაშინვე ნახონ თქვენი თავსებადობა.",
    hue: "oklch(0.72 0.18 145)",
  },
  {
    Icon: Globe2,
    title: "აღმოაჩინე ცა",
    body: "Vivida გიჩვენებს თავსებად ხალხს — შენი დომინანტი ელემენტის მიხედვით, შენი ნიშნით, ან უბრალოდ ვინც ახლოს არის.",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Users,
    title: "მეგობრების წრე",
    body: "მეგობრების მოწვევა, შემოსული მოთხოვნები, თქვენი თავსებადობა ერთი დაკლიკვით. შენი კოსმიური წრე ერთ ადგილას.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: MessageCircle,
    title: "პირდაპირი შეტყობინებები",
    body: "ისაუბრე მეგობრებთან რეალურ დროში — write receipts, typing indicators, ფონური შეტყობინებები. ყველაფერი როგორც უნდა იყოს.",
    hue: "oklch(0.78 0.18 305)",
  },
];

const FEATURES_EN: Feature[] = [
  {
    Icon: Sun,
    title: "Daily forecast",
    body: "Your personal sky for today, generated from your natal chart—emotional tone, opportunity, and an area to focus on.",
    hue: "oklch(0.82 0.16 80)",
  },
  {
    Icon: Compass,
    title: "Complete birth chart",
    body: "An interactive chart with 12 signs, 12 houses, 10+ planets, and every major aspect. Your Sun, Moon, and rising sign take center stage.",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    Icon: Heart,
    title: "Compatibility (synastry)",
    body: "Explore romantic, friendship, communication, growth, chemistry, and work compatibility—with clear scores and detailed explanations.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: Brain,
    title: "AI interpretation",
    body: "A personalized emotional portrait of your chart. This is not a generic horoscope; every insight is grounded in your birth data.",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Sparkles,
    title: "Chart highlights",
    body: "Vivida finds the most distinctive patterns in your chart—stelliums, powerful aspects, and the placements that deserve a closer look.",
    hue: "oklch(0.72 0.22 350)",
  },
  {
    Icon: UserCircle,
    title: "Public profile",
    body: "Choose a username, add photos and a bio, and let people discover your signs and instantly see your shared compatibility.",
    hue: "oklch(0.72 0.18 145)",
  },
  {
    Icon: Globe2,
    title: "Discover people",
    body: "Meet people through shared elements, zodiac signs, and meaningful chart connections—or simply see who is nearby.",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Users,
    title: "Friends circle",
    body: "Invite friends, manage requests, and open your compatibility in one tap. Your people and your shared sky stay together.",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: MessageCircle,
    title: "Direct messages",
    body: "Talk with friends in real time, with read receipts, typing indicators, and notifications that keep conversations moving.",
    hue: "oklch(0.78 0.18 305)",
  },
];

const FEATURES_AM: Feature[] = [
  {
    Icon: Sun,
    title: "Ամենօրյա կանխատեսում",
    body: "Այսօրվա ձեր անձնական երկինքը՝ նատալ քարտեզի հիման վրա։ Տեսեք էմոցիոնալ ֆոնը, հնարավորություններն ու ուշադրության հիմնական ուղղությունը։",
    hue: "oklch(0.82 0.16 80)",
  },
  {
    Icon: Compass,
    title: "Ամբողջական նատալ քարտեզ",
    body: "Ինտերակտիվ քարտեզ՝ 12 նշանով, 12 տնով, 10-ից ավելի մոլորակներով և հիմնական ասպեկտներով։ Կենտրոնում ձեր Արեգակը, Լուսինն ու ասցենդենտն են։",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    Icon: Heart,
    title: "Համատեղելիություն",
    body: "Ուսումնասիրեք ռոմանտիկ, ընկերական, հաղորդակցական, աճի, քիմիայի և աշխատանքային համատեղելիությունը՝ հստակ գնահատականներով ու մանրամասն բացատրություններով։",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: Brain,
    title: "AI մեկնաբանություն",
    body: "Ձեր քարտեզի անհատական էմոցիոնալ պատկերը։ Սա ընդհանուր հորոսկոպ չէ․ յուրաքանչյուր դիտարկում հիմնված է ձեր ծննդյան տվյալների վրա։",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Sparkles,
    title: "Քարտեզի կարևոր շեշտադրումներ",
    body: "Vivida-ն գտնում է ձեր քարտեզի առավել առանձնահատուկ օրինաչափությունները՝ ստելիումները, ուժեղ ասպեկտներն ու ուշադրության արժանի դիրքերը։",
    hue: "oklch(0.72 0.22 350)",
  },
  {
    Icon: UserCircle,
    title: "Հանրային պրոֆիլ",
    body: "Ընտրեք օգտանուն, ավելացրեք լուսանկարներ ու ձեր մասին տեղեկություն, որպեսզի մարդիկ գտնեն ձեզ և անմիջապես տեսնեն ձեր ընդհանուր համատեղելիությունը։",
    hue: "oklch(0.72 0.18 145)",
  },
  {
    Icon: Globe2,
    title: "Մարդկանց բացահայտում",
    body: "Ծանոթացեք մարդկանց՝ ընդհանուր տարրերի, կենդանակերպի նշանների և քարտեզների նշանակալի կապերի միջոցով, կամ պարզապես տեսեք՝ ովքեր են մոտակայքում։",
    hue: "oklch(0.78 0.15 195)",
  },
  {
    Icon: Users,
    title: "Ընկերների շրջանակ",
    body: "Հրավիրեք ընկերների, կառավարեք հարցումները և մեկ հպումով բացեք ձեր համատեղելիությունը։ Ձեր մարդիկ ու ընդհանուր երկինքը միշտ միասին են։",
    hue: "oklch(0.72 0.22 0)",
  },
  {
    Icon: MessageCircle,
    title: "Անձնական հաղորդագրություններ",
    body: "Զրուցեք ընկերների հետ իրական ժամանակում՝ կարդալու նշումներով, մուտքագրման ցուցիչներով և ծանուցումներով։",
    hue: "oklch(0.78 0.18 305)",
  },
];

export default async function FeaturesPage() {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const am = locale === "am";
  const features = am ? FEATURES_AM : en ? FEATURES_EN : FEATURES;
  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <SmartHeader active="features" locale={locale} georgianPath="/features" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {am ? "Հնարավորություններ" : en ? "Features" : "ფუნქციები"}
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {am
            ? "Այն ամենը, ինչ "
            : en
              ? "Everything that makes "
              : "ყველაფერი, რაც "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {am
              ? "կենդանացնում է ձեր քարտեզը"
              : en
                ? "your chart"
                : "შენს რუკას"}
          </span>{" "}
          {am ? "" : en ? " come alive" : " ცოცხალს ხდის"}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {am
            ? "Vivida-ն պարզապես հորոսկոպի հավելված չէ։ Այն ձեր անձնական ուղեցույցն է՝ ծննդյան պահից մինչև ամենօրյա ընտրությունները։"
            : en
              ? "Vivida goes beyond a horoscope app. It is a personal guide from the moment of your birth to the choices you make every day."
              : "Vivida არ არის უბრალო ჰოროსკოპის აპი. ეს არის შენი პერსონალური კოსმიური თანამგზავრი — დაბადებიდან ყოველდღიურ გადაწყვეტილებებამდე."}
        </p>

        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
              style={
                {
                  ["--feat-hue" as string]: feature.hue,
                } as React.CSSProperties
              }
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 size-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                style={{
                  background: `radial-gradient(circle, ${feature.hue} 0%, transparent 70%)`,
                }}
              />
              <div className="relative">
                <div
                  className="mb-4 grid size-12 place-items-center rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklch, var(--feat-hue) 22%, transparent), color-mix(in oklch, var(--feat-hue) 8%, transparent))",
                    boxShadow:
                      "inset 0 0 0 1px color-mix(in oklch, var(--feat-hue) 32%, transparent)",
                  }}
                >
                  <feature.Icon
                    className="size-5"
                    style={{
                      color: feature.hue,
                      filter: `drop-shadow(0 0 6px ${feature.hue})`,
                    }}
                  />
                </div>
                <h2 className="mb-2 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-pretty text-sm leading-relaxed text-foreground/85">
                  {feature.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {am
              ? "Ամեն ինչ՝ մեկ տեղում"
              : en
                ? "Everything in one place"
                : "ყველაფერი ერთ ადგილას"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            {am
              ? "Սկսեք անվճար և ձեր անձնական երկինքը միշտ պահեք ձեռքի տակ։"
              : en
                ? "Start with Vivida for free and keep your personal sky within reach."
                : "ყველა ფუნქცია სრულად უფასოა — შენი კოსმოსი ერთ დაკლიკვაზე."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="mystic" size="lg">
              <Link href="/signup">
                {am ? "Սկսել անվճար" : en ? "Start for free" : "დაიწყე უფასოდ"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
