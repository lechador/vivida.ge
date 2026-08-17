import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { ANGEL_NUMBERS, type AngelNumber } from "@/lib/seo/angel-numbers";
import {
  ANGEL_FAQ_AM,
  ANGEL_NUMBERS_AM,
  type AngelNumberAm,
} from "@/lib/seo/angel-numbers-am";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;

export const ANGEL_HUB_AM = {
  title: "Հրեշտակային թվեր. 111, 222, 333 և 11:11 նշանակությունները",
  description:
    "Բացահայտեք կրկնվող թվերի նշանակությունը՝ 000, 111, 222, 333, 444, 555, 777, 888, 999, 11:11, 12:12 և 1234 հայերենով:",
};

export function AngelNumbersHubAm() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: ANGEL_HUB_AM.title,
      description: ANGEL_HUB_AM.description,
      inLanguage: "hy-AM",
      mainEntityOfPage: `${SITE}/angeluri-ricxvebi`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Հրեշտակային թվերի նշանակություններ",
      numberOfItems: ANGEL_NUMBERS_AM.length,
      itemListElement: ANGEL_NUMBERS_AM.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/angeluri-ricxvebi/${item.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ANGEL_FAQ_AM.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background />
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="am" georgianPath="/angeluri-ricxvebi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <span className="text-foreground/80">Հրեշտակային թվեր</span>
        </nav>
        <header className="mb-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Ժամանակակից նումերոլոգիա
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Հրեշտակային թվերի{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              նշանակությունը
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80">
            Հաճա՞խ եք նկատում 11:11, 222 կամ այլ կրկնվող թվեր: Բացահայտեք դրանց խորհրդանշական իմաստը և օգտագործեք պահը ինքնաանդրադարձի համար:
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {ANGEL_NUMBERS_AM.map((item) => {
            const base = ANGEL_NUMBERS.find((number) => number.slug === item.slug);
            return (
              <Link
                key={item.slug}
                href={`/am/angeluri-ricxvebi/${item.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5 transition-colors hover:bg-card/75"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    {item.slug}
                  </span>
                  {(item.clock || base?.clockKa) && (
                    <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {item.clock || base?.clockKa}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">{item.essence}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-violet)]">
                  Կարդալ նշանակությունը
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Ինչո՞ւ են կրկնվող թվերը գրավում մեր ուշադրությունը
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Երբ որևէ համադրություն իմաստ է ստանում, ընտրողական ուշադրությունը հեշտացնում է այն նորից նկատելը: Հեռախոսները, ժամացույցներն ու չեկերը ամեն օր մեզ ցույց են տալիս հարյուրավոր թվեր:
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Խորհրդանշական մոտեցումը հիանալի գործիք է դադար վերցնելու, մտքերը հստակեցնելու և ճիշտ որոշումներ կայացնելու համար:
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Հաճախ տրվող հարցեր</h2>
          <div className="space-y-3">
            {ANGEL_FAQ_AM.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Հաշվեք ձեր կյանքի ուղու թիվը
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Հրեշտակային թվերը նկարագրում են ներկա պահը, իսկ կյանքի ուղու թիվը հաշվարկվում է ծննդյան ամսաթվից:
          </p>
          <Link
            href="/am/numerologia"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Կյանքի ուղու հաշվիչ
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function AngelNumberPageAm({
  base,
  content,
}: {
  base: AngelNumber;
  content: AngelNumberAm;
}) {
  const url = `${SITE}/angeluri-ricxvebi/${base.slug}`;
  const faq = [
    { q: `Ի՞նչ է նշանակում ${base.slug} թիվը:`, a: content.meaning },
    { q: `Ի՞նչ է նշանակում ${base.slug}-ը սիրո մեջ:`, a: content.love },
    { q: `Ի՞նչ անել, երբ տեսնում եք ${base.slug}:`, a: content.action },
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.essence,
      inLanguage: "hy-AM",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida", url: SITE },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Գլխավոր", item: SITE },
        { "@type": "ListItem", position: 2, name: "Հրեշտակային թվեր", item: `${SITE}/angeluri-ricxvebi` },
        { "@type": "ListItem", position: 3, name: base.slug, item: url },
      ],
    },
  ];
  const sections = [
    { title: "Սեր և հարաբերություններ", body: content.love, accent: "var(--vivida-pink)" },
    { title: "Կարիերա և գործեր", body: content.career, accent: "var(--vivida-cyan)" },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background />
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath={`/angeluri-ricxvebi/${base.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <Link href="/am/angeluri-ricxvebi" className="hover:text-foreground">Հրեշտակային թվեր</Link>
          <span>/</span>
          <span className="text-foreground/80">{base.slug}</span>
        </nav>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              {base.slug}
            </span>
            {(content.clock || base.clockKa) && (
              <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted-foreground">
                {content.clock || base.clockKa}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {content.title}
          </h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-foreground/90">
            {content.essence}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            Ի՞նչ է նշանակում {base.slug} թիվը
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.meaning}</p>
        </section>

        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6"
            >
              <h2
                className="text-sm font-semibold uppercase tracking-[0.14em]"
                style={{ color: section.accent }}
              >
                {section.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{section.body}</p>
            </section>
          ))}
          <section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
              Ի՞նչ անել, երբ տեսնում եք {base.slug} թիվը
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.action}</p>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Այլ հրեշտակային թվեր
          </h2>
          <div className="flex flex-wrap gap-2">
            {ANGEL_NUMBERS.filter((item) => item.slug !== base.slug).map((item) => (
              <Link
                key={item.slug}
                href={`/am/angeluri-ricxvebi/${item.slug}`}
                className="rounded-xl border border-border bg-card/55 px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-card/85"
              >
                {item.slug}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            Գտեք ձեր կյանքի ուղու թիվը
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            Հաշվեք ձեր նումերոլոգիական թիվը ծննդյան ամսաթվով և բացահայտեք ձեր բնածին տաղանդները:
          </p>
          <Link
            href="/am/numerologia"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Հաշվել իմ թիվը
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function Background() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
    />
  );
}
