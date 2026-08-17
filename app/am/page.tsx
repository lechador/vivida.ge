import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Heart,
  Languages,
  Orbit,
  Sparkles,
} from "lucide-react";

import { ArmenianShell } from "@/components/am/armenian-shell";
import {
  DEFAULT_OG_IMAGE,
  ARMENIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const URL = ARMENIAN_SITE_URL;
const TITLE = "Նատալ քարտեզներ, հորոսկոպներ և կենդանակերպի ուղեցույցներ — Vivida";
const DESCRIPTION =
  "Հասկացեք ձեր ծննդյան քարտեզը, կենդանակերպի նշանները և համատեղելիությունը պարզ հայերեն աստղաբանական ուղեցույցների միջոցով: Vivida-ն միավորում է աստղագիտական տվյալները գործնական ինքնաճանաչման գործիքների հետ:";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: localizedAlternates("/am", "/", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const GUIDES = [
  {
    href: "/natal-chart",
    icon: Orbit,
    title: "Նատալ քարտեզ",
    text: "Իմացեք, թե ինչ է պարունակում ծննդյան քարտեզը և ինչպես են փոխազդում մոլորակները, նշանները, տներն ու ասպեկտները:",
  },
  {
    href: "/horoscope",
    icon: Sparkles,
    title: "Հորոսկոպ",
    text: "Հասկացեք, թե ինչպես են ստեղծվում օրական կանխատեսումները մոլորակների ընթացիկ շարժումներից:",
  },
  {
    href: "/zodiac",
    icon: Compass,
    title: "Կենդանակերպի նշաններ",
    text: "Բացահայտեք տասներկու նշանները, դրանց տարերքները, որակներն ու կառավարող մոլորակները:",
  },
  {
    href: "/compatibility",
    icon: Heart,
    title: "Համատեղելիություն",
    text: "Տեսեք, թե ինչու է իրական համատեղելիությունը ներառում ավելին, քան միայն երկու Արևի նշանները:",
  },
];

const FAQ = [
  {
    q: "Արդյո՞ք Vivida-ն հասանելի է հայերենով:",
    a: "Այո: Հանրային ուղեցույցները, նատալ քարտեզի վերլուծությունները, հորոսկոպները, համատեղելիության հաշվարկները, Տարո ընթերցումները և հիմնական թեստերը հասանելի են հայերենով:",
  },
  {
    q: "Նատալ քարտեզը նույնն է, ինչ հորոսկո՞պը:",
    a: "Նատալ քարտեզը ֆիքսում է երկնքի դիրքը ձեր ծննդյան պահին և մնում է անփոփոխ: Հորոսկոպը համեմատում է մոլորակների ընթացիկ շարժումները ձեր քարտեզի հետ, ուստի այն փոխվում է ժամանակի ընթացքում:",
  },
  {
    q: "Պարտադի՞ր է իմանալ ծննդյան ճշգրիտ ժամը:",
    a: "Ճշգրիտ ժամը շատ կարևոր է Ասցենդենտի և տների ճշգրիտ հաշվարկի համար: Մոլորակների մեծ մասի նշանները հնարավոր է հաշվարկել նաև առանց ժամի, բայց քարտեզը կլինի պակաս մանրամասն:",
  },
  {
    q: "Արդյո՞ք աստղաբանությունը գիտական խորհրդատվություն է:",
    a: "Ոչ: Vivida-ն ներկայացնում է աստղաբանությունը ինքնաճանաչման, ոգեշնչման և մշակութային հետաքրքրության նպատակով: Այն չի փոխարինում բժշկական, հոգեբանական, իրավական կամ ֆինանսական մասնագիտական խորհրդատվությանը:",
  },
];

export default function ArmenianHomePage() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Vivida",
      url: URL,
      inLanguage: "hy",
      description: DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <ArmenianShell georgianPath="/" englishPath="/">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <section className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Languages className="size-3.5 text-[var(--vivida-cyan)]" /> Հայերեն
          ուղեցույցներն արդեն հասանելի են
        </span>
        <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl md:text-7xl">
          Ձեր ծննդյան քարտեզը՝ ավելի{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            հասկանալի և խորը
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80 sm:text-xl">
          Բացահայտեք ձեր նատալ քարտեզի կառուցվածքը, կենդանակերպի 12 նշանները,
          մոլորակային ցիկլերը և հարաբերությունների համատեղելիությունը պարզ ու
          գործնական հայերեն ուղեցույցներով:
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/am/natal-chart"
            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30"
          >
            Սկսեք նատալ քարտեզից <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/am/zodiac"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold hover:bg-card"
          >
            Կենդանակերպի նշաններ
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Անվճար հետազոտություն · Քարտ չի պահանջվում · Ամբողջությամբ հայերենով
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-medium text-[var(--vivida-cyan)]">
            Գիտակցված մոտեցում
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Աստղաբանությունը փոխհարաբերությունների համակարգ է
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            Կենդանակերպի մեկ նշանը միայն ընդհանուր պատկերի մի փոքր մասն է: Նատալ
            քարտեզն արձանագրում է Արևի, Լուսնի և մոլորակների ճշգրիտ դիրքերը ձեր
            ծննդյան պահին: Նշանները նկարագրում են, թե ինչպես է էներգիան
            արտահայտվում, տները՝ որտեղ է այն դրսևորվում, իսկ ասպեկտները՝ ինչպես
            են տարբեր մասերը համագործակցում:
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            Vivida-ն համակարգում է այս շերտերը հասկանալի գործիքների և
            կրթական ուղեցույցների մեջ: Օգտագործեք դրանք որպես ինքնաճանաչման և
            մտորումների աղբյուր:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map(({ href, icon: Icon, title, text }) => (
            <Link
              key={href}
              href={`/am${href}`}
              className="group rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/45 hover:bg-card/75"
            >
              <Icon className="size-6 text-[var(--vivida-violet)]" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--vivida-cyan)]">
                Կարդալ ուղեցույցը{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Ինչպե՞ս է աշխատում Vivida-ն
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            [
              "01",
              "Մուտքագրեք ճշգրիտ տվյալներ",
              "Ծննդյան ամսաթիվը, վայրը և ճշգրիտ ժամը հիմք են հանդիսանում աստղագիտական հաշվարկների համար:",
            ],
            [
              "02",
              "Ուսումնասիրեք շերտերը",
              "Սկսեք Արևից, Լուսնից և Ասցենդենտից, ապա ավելացրեք մյուս մոլորակները, տներն ու ասպեկտները:",
            ],
            [
              "03",
              "Ինքնաճանաչում, ոչ թե կանխատեսում",
              "Օգտագործեք կրկնվող թեմաները որպես հարցեր և նոր հեռանկարներ՝ ձեր անձնական աճի համար:",
            ],
          ].map(([n, title, text]) => (
            <article
              key={n}
              className="rounded-2xl border border-border/60 bg-card/40 p-5"
            >
              <span className="text-sm font-semibold text-[var(--vivida-pink)]">
                {n}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight">
          Հաճախակի տրվող հարցեր
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card/55 p-5"
            >
              <summary className="cursor-pointer list-none font-medium">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </ArmenianShell>
  );
}
