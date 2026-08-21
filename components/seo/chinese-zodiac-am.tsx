import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Sparkles } from "lucide-react";

import { ChineseYearFinder } from "@/components/calculator/chinese-year-finder";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import {
  CHINESE_ANIMALS,
  type ChineseAnimal,
  yearsForAnimal,
} from "@/lib/seo/chinese-zodiac";
import {
  CHINESE_ANIMALS_AM,
  CHINESE_ZODIAC_FAQ_AM,
  type ChineseAnimalContentAm,
} from "@/lib/seo/chinese-zodiac-am";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;

export const CHINESE_HUB_AM = {
  title: "Չինական կենդանակերպ. 12 նշաններ ըստ ծննդյան տարիների",
  description:
    "Իմացեք ձեր չինական կենդանակերպի նշանը ծննդյան տարեթվով և բացահայտեք բնավորությունը, տարրը (Wu Xing), սիրային համատեղելիությունը և կարիերան հայերենով:",
};

export function ChineseZodiacHubAm() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Չինական կենդանակերպի նշաններ",
      numberOfItems: CHINESE_ANIMALS.length,
      itemListElement: CHINESE_ANIMALS.map((animal, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: CHINESE_ANIMALS_AM[animal.slug]?.name || animal.nameEn,
        url: `${SITE}/chinuri-horoskopi/${animal.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: CHINESE_ZODIAC_FAQ_AM.map((item) => ({
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Չինական կենդանակերպ",
          item: `${SITE}/chinuri-horoskopi`,
        },
      ],
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <PageBackground />
      <Starfield count={140} shooting={3} />
      <SmartHeader locale="am" georgianPath="/chinuri-horoskopi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <span className="text-foreground/80">Չինական կենդանակերպ</span>
        </nav>

        <header className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Չինական կենդանակերպ. ձեր նշանը ըստ{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ծննդյան տարեթվի
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-foreground/80 sm:text-lg">
            Գտեք ձեր նշանը 12-ամյա լուսնային շրջանում և բացահայտեք բնավորությունը, սիրային համատեղելիությունը, ուժեղ կողմերն ու մարտահրավերները:
          </p>
        </header>

        <div className="mx-auto mt-8 max-w-md">
          <ChineseYearFinder locale="am" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CHINESE_ANIMALS.map((animal) => {
            const amInfo = CHINESE_ANIMALS_AM[animal.slug];
            return (
              <Link
                key={animal.slug}
                href={`/am/chinuri-horoskopi/${animal.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/55 p-5 text-center ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80"
              >
                <span className="text-4xl" aria-hidden>
                  {animal.emoji}
                </span>
                <span className="font-semibold tracking-tight">{amInfo?.name || animal.nameEn}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {yearsForAnimal(animal.slug).slice(0, 3).join(" · ")}
                </span>
              </Link>
            );
          })}
        </div>

        <article className="mt-14 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Ինչպե՞ս է գործում չինական աստղագուշակությունը
          </h2>
          <p>
            Չինական կենդանակերպը յուրաքանչյուր լուսնային տարվա վերագրում է 12 կենդանիներից մեկը՝ Առնետ, Ցուլ, Վագր, Ճագար, Վիշապ, Օձ, Ձի, Այծ, Կապիկ, Աքաղաղ, Շուն և Խոզ: Ցիկլը կրկնվում է 12 տարին մեկ, իսկ 60-ամյա մեծ շրջանը համադրում է կենդանիներին 5 տարրերի և Ին/Յան բևեռայնության հետ:
          </p>
          <p>
            Տարին չի սկսվում հունվարի 1-ին. չինական Նոր տարին շարժական է և սկսվում է հունվարի վերջից փետրվարի կեսերն ընկած ժամանակահատվածում:
          </p>
        </article>

        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Հաճախ տրվող հարցեր
          </h2>
          <div className="space-y-3">
            {CHINESE_ZODIAC_FAQ_AM.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/55 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter locale="am" />
    </main>
  );
}

export function ChineseAnimalPageAm({
  animal,
  content,
}: {
  animal: ChineseAnimal;
  content: ChineseAnimalContentAm;
}) {
  const years = yearsForAnimal(animal.slug);
  const url = `${SITE}/chinuri-horoskopi/${animal.slug}`;
  const amName = content.name || CHINESE_ANIMALS_AM[animal.slug]?.name || animal.nameEn;
  const amElement = content.element || CHINESE_ANIMALS_AM[animal.slug]?.element || animal.elementEn;
  const amPolarity = content.polarity || CHINESE_ANIMALS_AM[animal.slug]?.polarity || animal.polarityEn;

  const faq = [
    {
      q: `Ո՞ր տարիներն են համարվում ${amName}ի տարի:`,
      a: `Վերջին տարիներն են՝ ${years.slice(0, 8).join(", ")}: Չինական Նոր տարին չի սկսվում հունվարի 1-ին, ուստի հունվարին և փետրվարի սկզբին ծնվածները պետք է ճշտեն լուսնային օրացույցի ամսաթիվը:`,
    },
    {
      q: `Ինչպիսի՞ն է ${amName}ի տարում ծնվածների բնավորությունը:`,
      a: content.personality,
    },
    {
      q: `Ո՞ր նշանների հետ է առավել համատեղելի ${amName}ը:`,
      a: `${content.compatible.map((slug) => CHINESE_ANIMALS_AM[slug]?.name || slug).join(", ")} նշանները ավանդաբար համարվում են ամենաներդաշնակ զույգերը:`,
    },
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${amName} — Չինական կենդանակերպի տարիները, բնավորությունը և համատեղելիությունը`,
      description: content.intro,
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Չինական կենդանակերպ",
          item: `${SITE}/chinuri-horoskopi`,
        },
        { "@type": "ListItem", position: 3, name: amName, item: url },
      ],
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <PageBackground />
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="am" georgianPath={`/chinuri-horoskopi/${animal.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <Link href="/am/chinuri-horoskopi" className="hover:text-foreground">Չինական կենդանակերպ</Link>
          <span>/</span>
          <span className="text-foreground/80">{amName}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[var(--vivida-violet)]/12 text-6xl ring-1 ring-[var(--vivida-violet)]/30">
              {animal.emoji}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Չինական կենդանակերպ · {amElement} · {amPolarity}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {amName}ի տարի
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {content.headline}
              </p>
            </div>
          </div>
        </article>

        <section className="mt-8">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {amName}ի ծննդյան տարեթվերը
          </h2>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <span
                key={year}
                className="rounded-full border border-border bg-card/55 px-3 py-1 text-sm tabular-nums"
              >
                {year}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Ծնվե՞լ եք հունվարին կամ փետրվարի սկզբին: Ճշտեք չինական Նոր տարվա ամսաթիվը, քանի որ կարող եք պատկանել նախորդ տարվա կենդանուն:
          </p>
        </section>

        <Prose className="mt-8" body={content.intro} />
        <TextSection title={`${amName}ի բնավորությունը`} body={content.personality} />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Traits title="Բնական ուժեղ կողմեր" items={content.strengths} color="var(--vivida-cyan)" />
          <Traits title="Աճի մարտահրավերներ" items={content.challenges} color="var(--vivida-pink)" />
        </div>

        <TextSection title="Սեր և հարաբերություններ" body={content.love} />
        <TextSection title="Կարիերա և աշխատանք" body={content.career} />

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Համատեղելիություն
          </h2>
          <CompatibilityGroup
            label="Ավանդաբար ներդաշնակ"
            slugs={content.compatible}
            color="var(--vivida-cyan)"
          />
          <div className="mt-5">
            <CompatibilityGroup
              label="Հնարավոր մարտահրավերներով"
              slugs={content.challenging}
              color="var(--vivida-pink)"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Այս համադրությունները նկարագրում են ավանդական ընդհանուր միտումները: Անհատական հաղորդակցությունը, արժեքներն ու փոխադարձ հարգանքը միշտ ավելի կարևոր են:
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
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

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Բացահայտեք ձեր նատալ քարտեզը
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Չինական նշանը հետևում է լուսնային տարվան, իսկ արևմտյան նատալ քարտեզը հաշվարկում է երկնքի ճշգրիտ պատկերը ըստ ձեր ծննդյան րոպեի և վայրի:
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">
              Բացահայտել նատալ քարտեզը
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Այլ կենդանակերպի նշաններ
          </h2>
          <div className="flex flex-wrap gap-2">
            {CHINESE_ANIMALS.filter((other) => other.slug !== animal.slug).map((other) => {
              const otherAm = CHINESE_ANIMALS_AM[other.slug]?.name || other.nameEn;
              return (
                <Link
                  key={other.slug}
                  href={`/am/chinuri-horoskopi/${other.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/85"
                >
                  <span aria-hidden>{other.emoji}</span>
                  {otherAm}
                </Link>
              );
            })}
          </div>
        </section>
      </section>

      <SiteFooter locale="am" />
    </main>
  );
}

function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"
    />
  );
}

function Prose({ body, className = "" }: { body: string; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl ${className}`}
    >
      <p className="text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">{body}</p>
    </div>
  );
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}

function Traits({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <h3 className="text-base font-semibold tracking-tight" style={{ color }}>
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground/90">
            <span className="mt-1 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CompatibilityGroup({
  label,
  slugs,
  color,
}: {
  label: string;
  slugs: string[];
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color }}>
        {label}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {slugs.map((slug) => {
          const animal = CHINESE_ANIMALS.find((a) => a.slug === slug);
          const name = CHINESE_ANIMALS_AM[slug]?.name || animal?.nameEn || slug;
          return (
            <Link
              key={slug}
              href={`/am/chinuri-horoskopi/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/75 px-3 py-1 text-sm font-medium transition-colors hover:bg-card"
            >
              {animal?.emoji && <span aria-hidden>{animal.emoji}</span>}
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
