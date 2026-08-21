import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { DREAM_BY_SLUG, type DreamSymbol } from "@/lib/seo/dreams";
import { DREAM_AM_BY_SLUG, DREAM_SYMBOLS_AM, type DreamSymbolAm } from "@/lib/seo/dreams-am";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;

export const DREAMS_HUB_AM = {
  title: "Երազահան Ա–Ֆ. Երազների մեկնաբանություն և նշանակություն",
  description:
    "Բացահայտեք տարածված երազային խորհրդանիշների իմաստները՝ օձ, ջուր, ատամներ, թռիչք, փող, հղիություն և այլն: Ավանդական և հոգեբանական մեկնաբանություններ հայերենով:",
};

const FAQ_AM = [
  {
    q: "Արդյո՞ք երազները կանխատեսում են ապագան:",
    a: "Երազները սովորաբար արտացոլում են մեր հույզերը, հիշողությունները, ապրումները և ենթագիտակցական մտքերը, քան ուղիղ կանխատեսում են ապագա իրադարձությունները:",
  },
  {
    q: "Ինչո՞ւ նույն երազը տարբեր մարդկանց մոտ տարբեր իմաստներ ունի:",
    a: "Անհատական փորձառությունն ու զգացմունքները փոխում են խորհրդանիշի իմաստը: Օրինակ՝ շունը մեկի համար պաշտպան է, մյուսի համար՝ վախի աղբյուր:",
  },
  {
    q: "Ինչո՞ւ են երազները կրկնվում:",
    a: "Կրկնվող երազները հաճախ ցույց են տալիս չլուծված հուզական հարցեր կամ կյանքի կրկնվող իրավիճակներ, որոնք պահանջում են ձեր ուշադրությունը:",
  },
];

export function DreamsHubAm() {
  const groups = [...DREAM_SYMBOLS_AM]
    .sort((a, b) => a.title.localeCompare(b.title, "hy"))
    .reduce<Array<{ letter: string; items: DreamSymbolAm[] }>>((all, item) => {
      const letter = item.title[0].toUpperCase();
      const group = all.find((entry) => entry.letter === letter);
      if (group) group.items.push(item);
      else all.push({ letter, items: [item] });
      return all;
    }, []);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: DREAMS_HUB_AM.title,
      description: DREAMS_HUB_AM.description,
      inLanguage: "hy-AM",
      mainEntityOfPage: `${SITE}/sizmris-akhsna`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Երազների խորհրդանիշներ և մեկնաբանություններ",
      numberOfItems: DREAM_SYMBOLS_AM.length,
      itemListElement: DREAM_SYMBOLS_AM.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/sizmris-akhsna/${item.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_AM.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background />
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath="/sizmris-akhsna" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <span className="text-foreground/80">Երազահան</span>
        </nav>
        <header className="mb-10 text-center sm:mb-12">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Երազների մեկնաբանություն
          </div>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Երազահան Ա–Ֆ
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-foreground/85 sm:text-lg">
            {DREAMS_HUB_AM.description}
          </p>
        </header>

        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.letter}>
              <h2 className="mb-2.5 flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/12 text-lg font-semibold text-[var(--vivida-violet)]">
                  {group.letter}
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  const base = DREAM_BY_SLUG[item.slug];
                  return (
                    <Link
                      key={item.slug}
                      href={`/am/sizmris-akhsna/${item.slug}`}
                      className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-3 transition-colors hover:bg-card/75"
                    >
                      <span className="text-xl leading-none">{base?.glyph || item.glyph}</span>
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground/90">{item.title}</span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                          {item.summary}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Ինչպե՞ս մեկնաբանել երազը</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Խորհրդանիշը միայն ելակետ է: Ձեր սեփական կյանքը տալիս է ամբողջական ենթատեքստը: Ուշադրություն դարձրեք հետևյալ 3 հարցերին.
          </p>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/85">
            {[
              "Ի՞նչ զգացիք երազում. վախը, հանգստությունը, զարմանքը կամ ուրախությունը ամբողջությամբ փոխում են պատկերի իմաստը:",
              "Ի՞նչ է կատարվում ձեր կյանքում այժմ. երազները հաճախ մշակում են վերջին օրերի սթրեսը, որոշումներն ու հարաբերությունները:",
              "Ո՞ր մանրուքն էր ամենավառը. ամենատպավորիչ առարկան, գույնը կամ գործողությունը հաճախ լավագույն հուշումն է:",
            ].map((text, index) => (
              <li key={text} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--vivida-violet)]/15 text-xs font-semibold text-[var(--vivida-violet)]">
                  {index + 1}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Հաճախ տրվող հարցեր</h2>
          <div className="space-y-3">
            {FAQ_AM.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Երազները ցույց են տալիս մեկ գիշեր, իսկ նատալ քարտեզը՝ ամբողջական նախշը
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Բացահայտեք, թե ինչպես են Լուսինը, նշանները, տներն ու ասպեկտները նկարագրում ձեր հուզական աշխարհը:
          </p>
          <Link
            href="/am/natal-chart"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Բացահայտել նատալ քարտեզը
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function DreamSymbolPageAm({
  base,
  content,
}: {
  base: DreamSymbol;
  content: DreamSymbolAm;
}) {
  const url = `${SITE}/sizmris-akhsna/${base.slug}`;
  const related = base.related
    .map((slug) => ({ base: DREAM_BY_SLUG[slug], am: DREAM_AM_BY_SLUG[slug] }))
    .filter((item) => item.base && item.am);
  const alsoSee = DREAM_SYMBOLS_AM.filter((item) => item.slug !== base.slug).slice(0, 12);
  const faq = content.variants.map((variant) => ({
    q: `Ի՞նչ է նշանակում, երբ երազում ${variant.when.toLowerCase()}:`,
    a: variant.means,
  }));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `Երազում ${content.title} տեսնելու նշանակությունը`,
      description: content.summary,
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
        { "@type": "ListItem", position: 2, name: "Երազահան", item: `${SITE}/sizmris-akhsna` },
        { "@type": "ListItem", position: 3, name: content.title, item: url },
      ],
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background />
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath={`/sizmris-akhsna/${base.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <Link href="/am/sizmris-akhsna" className="hover:text-foreground">Երազահան</Link>
          <span>/</span>
          <span className="text-foreground/80">{content.title}</span>
        </nav>
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/15 text-3xl ring-1 ring-[var(--vivida-violet)]/35">
              {content.glyph || base.glyph}
            </span>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Երազում {content.title} տեսնելու իմաստը
              </h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Երազների մեկնաբանություն
              </p>
            </div>
          </div>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">
            {content.summary}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            Ընդհանուր նշանակություն
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.meaning}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Տարածված սցենարներ՝ երազում {content.title.toLowerCase()} տեսնելիս
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ընտրեք այն տարբերակը, որն առավել մոտ է ձեր երազին:
          </p>
          <div className="mt-4 space-y-3">
            {content.variants.map((variant) => (
              <article key={variant.when} className="rounded-2xl border border-border/70 bg-card/40 p-5">
                <h3 className="font-semibold text-foreground/95">Երբ {variant.when.toLowerCase()}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">{variant.means}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <section className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-cyan)]">
              Դրական իմաստ
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.positive}</p>
          </section>
          <section className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-pink)]">
              Ինչին ուշադրություն դարձնել
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.caution}</p>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Հարակից խորհրդանիշներ
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.base.slug}
                  href={`/am/sizmris-akhsna/${item.base.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/45 px-3.5 py-2.5 text-sm hover:bg-card/75"
                >
                  <span className="text-lg">{item.base.glyph}</span>
                  <span className="font-medium">{item.am.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Երազահանի այլ խորհրդանիշներ
          </h2>
          <div className="flex flex-wrap gap-2">
            {alsoSee.map((item) => (
              <Link
                key={item.slug}
                href={`/am/sizmris-akhsna/${item.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs hover:bg-card/75"
              >
                <span>{item.glyph}</span>
                {item.title}
              </Link>
            ))}
            <Link
              href="/am/sizmris-akhsna"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-xs font-medium text-[var(--vivida-violet)]"
            >
              Բոլոր խորհրդանիշները
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            Փնտրո՞ւմ եք այլ խորհրդանշական պատասխան
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            Փորձեք Տարոն որպես խորհրդանշական գործիք՝ ձեր հարցին այլ տեսանկյունից նայելու համար:
          </p>
          <Link
            href="/am/taro"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Բացել Տարոն
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
      className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_265/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.28_0.14_300/0.45),transparent_70%)]"
    />
  );
}
