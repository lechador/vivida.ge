import { ArmenianLink as Link } from "@/components/i18n/international-link";

import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { RANKING_CATEGORY_ORDER } from "@/lib/seo/rankings";
import {
  RANKING_CATEGORIES_AM,
  RANKING_TOPICS_AM,
  RANKINGS_HUB_AM,
  SIGN_REASON_AM,
  type RankingTopicAm,
} from "@/lib/seo/rankings-am";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";
import { serializeLd } from "@/lib/seo/jsonld";

export { RANKINGS_HUB_AM };

const SITE = ARMENIAN_SITE_URL;

export function RankingsHubAm() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Կենդանակերպի նշաններ", item: `${SITE}/zodiac` },
        { "@type": "ListItem", position: 2, name: "Վարկանիշներ", item: `${SITE}/zodiac/reitingebi` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Կենդանակերպի նշանների վարկանիշներ",
      numberOfItems: RANKING_TOPICS_AM.length,
      itemListElement: RANKING_TOPICS_AM.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: topic.title,
        url: `${SITE}/zodiac/reitingebi/${topic.slug}`,
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <SmartHeader locale="am" georgianPath="/zodiac/reitingebi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac" className="hover:text-foreground">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <span className="text-foreground/80">Վարկանիշներ</span>
        </nav>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Կենդանակերպի նշանների{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            վարկանիշներ
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-base text-foreground/80 sm:text-lg">
          Ո՞ր նշաններն են առավել ռոմանտիկ, նպատակասլաց, զգայուն կամ անկախ: Բացահայտեք բոլոր 12 նշանները՝ ըստ հայտնի աստղաբանական հատկանիշների:
        </p>

        {RANKING_CATEGORY_ORDER.map((category) => (
          <section key={category} className="mt-12">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {RANKING_CATEGORIES_AM[category]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {RANKING_TOPICS_AM.filter((topic) => topic.category === category).map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/am/zodiac/reitingebi/${topic.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 transition-colors hover:bg-card/80 sm:p-5"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/10 text-2xl ring-1 ring-[var(--vivida-violet)]/20">
                    {topic.emoji}
                  </span>
                  <div>
                    <div className="font-semibold tracking-tight">{topic.short}</div>
                    <div className="text-sm text-muted-foreground">{topic.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <aside className="mt-12 rounded-2xl border border-border bg-card/45 p-5 text-sm leading-7 text-foreground/75">
          <strong className="text-foreground">Նշում վարկանիշների մասին.</strong> այս ցուցակները համեմատում են ընդհանուր արևային նշանների արխետիպերը: Ամբողջական նատալ քարտեզը կարող է ցույց տալ այլ հատկանիշներ՝ Լուսնի, Ասցենդենտի և մոլորակների միջոցով:
        </aside>

        <div className="mt-14">
          <ReportPromo />
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function RankingTopicPageAm({ topic }: { topic: RankingTopicAm }) {
  const sorted = topic.order.map((slug, index) => ({ slug, rank: index + 1 }));
  const related = RANKING_TOPICS_AM.filter((item) => item.slug !== topic.slug).slice(0, 8);
  const url = `${SITE}/zodiac/reitingebi/${topic.slug}`;

  const firstSignMeta = signMetaBySlug(topic.order[0])!;
  const firstSignAm = firstSignMeta.labelAm;

  const intro = `${topic.title}. Այս վարկանիշը համեմատում է ${topic.trait}: Օգտագործված են արևային նշանների ավանդական արխետիպերը:`;

  const faq = [
    {
      q: `Ո՞ր նշանն է առաջին տեղում՝ որպես ${topic.short.toLowerCase()}:`,
      a: `${firstSignAm}ը զբաղեցնում է առաջին հորիզոնականը այս ցուցակում, քանի որ նրա ավանդական արխետիպն առավել հստակ է արտահայտում ${topic.trait}:`,
    },
    {
      q: "Արդյո՞ք կենդանակերպի վարկանիշները գիտականորեն ապացուցված են:",
      a: "Ոչ: Դրանք հիմնված են աստղաբանական ավանդույթների և արխետիպերի վրա: Դրանք ծառայում են ինքնաճանաչման և հետաքրքրության համար:",
    },
    {
      q: "Ինչո՞ւ իմ բնավորությունը կարող է չհամընկնել իմ արևային նշանի հետ:",
      a: "Ամբողջական նատալ քարտեզը ներառում է Լուսինը, Ասցենդենտը, մյուս մոլորակներն ու տները: Կյանքի փորձը և անհատական որոշումները նույնպես ձևավորում են անհատականությունը:",
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: topic.title,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: 12,
      itemListElement: sorted.map((item) => ({
        "@type": "ListItem",
        position: item.rank,
        name: signMetaBySlug(item.slug)!.labelAm,
        url: `${SITE}/zodiac/${item.slug}`,
      })),
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
        { "@type": "ListItem", position: 1, name: "Կենդանակերպի նշաններ", item: `${SITE}/zodiac` },
        { "@type": "ListItem", position: 2, name: "Վարկանիշներ", item: `${SITE}/zodiac/reitingebi` },
        { "@type": "ListItem", position: 3, name: topic.short, item: url },
      ],
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={`/zodiac/reitingebi/${topic.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac" className="hover:text-foreground">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <Link href="/am/zodiac/reitingebi" className="hover:text-foreground">Վարկանիշներ</Link>
          <span>/</span>
          <span className="text-foreground/80">{topic.short}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 sm:p-10">
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[var(--vivida-violet)]/12 text-5xl ring-1 ring-[var(--vivida-violet)]/30">
              {topic.emoji}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Կենդանակերպի վարկանիշ
              </div>
              <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                {topic.title}
              </h1>
            </div>
          </div>
        </article>

        <p className="mt-8 max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {intro}
        </p>

        <ol className="mt-10 space-y-3">
          {sorted.map((item) => {
            const meta = signMetaBySlug(item.slug)!;
            const accent = signColor(meta);
            return (
              <li key={item.slug}>
                <Link
                  href={`/am/zodiac/${item.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 transition-colors hover:bg-card/80 sm:gap-5 sm:p-5"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-bold tabular-nums sm:size-12 sm:text-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} ${item.rank <= 3 ? 22 : 14}%, transparent)`,
                      color: accent,
                    }}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color: accent }}>
                        {SIGNS_CONTENT[item.slug].symbol}
                      </span>
                      <h2 className="text-base font-semibold sm:text-lg">{meta.labelAm}</h2>
                    </div>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
                      {SIGN_REASON_AM[item.slug]}. Այս վարկանիշում դա {meta.labelAm}ին դնում է {item.rank}-րդ տեղում:
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <section className="mt-14 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold sm:text-3xl">
            Հաճախ տրվող հարցեր
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/55 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14">
          <ReportPromo />
        </div>

        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Այլ վարկանիշներ
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/am/zodiac/reitingebi/${item.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm"
              >
                <span>{item.emoji}</span>
                {item.short}
              </Link>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}
