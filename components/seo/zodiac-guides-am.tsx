import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { Compass, Moon, Sparkles, Sunrise, Sun } from "lucide-react";

import { SignByDatePicker } from "@/app/zodiac/datit/sign-by-date-picker";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import {
  ALL_ELEMENT_SLUGS,
  ALL_PAIR_SLUGS,
  ALL_SLUGS,
  SIGNS_BY_ELEMENT,
  ZODIAC_DATES,
  parsePairSlug,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ARMENIAN_SITE_URL, armenianSiteHref } from "@/lib/seo/locales";
import { serializeLd } from "@/lib/seo/jsonld";
import { signColor } from "@/lib/zodiac";
import {
  ELEMENT_NAME_AM,
  ELEMENT_SHORT_NAME_AM,
  ZODIAC_PLACEMENTS_AM,
  placementArmenian,
} from "@/lib/zodiac-placements-am";

function paragraphs(value: string) {
  return value
    .split("\n\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ZodiacByDatePageAm() {
  const content = ZODIAC_PLACEMENTS_AM.byDate;
  const path = "/zodiac/datit";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={path} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <span className="text-foreground/80">Նշանն ըստ ամսաթվի</span>
        </nav>
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Արեգակի նշանի հաշվիչ
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {content.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {content.tagline}
        </p>
        <div className="mt-8">
          <SignByDatePicker locale="am" />
        </div>
        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(content.intro).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <TextSection
          title={content.howItWorks.title}
          body={content.howItWorks.body}
        />
        <TextSection title={content.cusp.title} body={content.cusp.body} />

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
            Կենդանակերպի նշանների ամսաթվերը
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card/40">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-card/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Նշան</th>
                  <th className="px-4 py-3 text-left">Ամսաթվեր</th>
                  <th className="px-4 py-3 text-left">Տարր</th>
                </tr>
              </thead>
              <tbody>
                {ALL_SLUGS.map((sign) => {
                  const meta = signMetaBySlug(sign)!;
                  const element =
                    meta.element === "ცეცხლი"
                      ? "fire"
                      : meta.element === "მიწა"
                        ? "earth"
                        : meta.element === "ჰაერი"
                          ? "air"
                          : "water";
                  return (
                    <tr key={sign} className="border-b border-border/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/am/zodiac/${sign}`}
                          className="inline-flex items-center gap-2"
                        >
                          <span>{SIGNS_CONTENT[sign].symbol}</span>
                          <strong>{meta.labelAm}</strong>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {ZODIAC_DATES[sign].rangeAm}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ELEMENT_SHORT_NAME_AM[element]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <TextSection
          title={content.beyondSun.title}
          body={content.beyondSun.body}
        />
        <Button asChild variant="mystic" size="lg" className="mt-6">
          <Link href="/am/natal-chart">
            <Sparkles className="size-4" />
            Հաշվարկել ամբողջական նատալ քարտեզը
          </Link>
        </Button>
        <Faq items={content.faq} />
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function ZodiacGuideIndexAm() {
  const path = "/zodiac/gzamkvlevi";
  const url = armenianSiteHref(path, false);
  const links = [
    "/zodiac",
    "/zodiac/datit",
    "/zodiac/mtvare",
    "/zodiac/amomavali",
    "/zodiac/elementebi",
    "/compatibility",
  ];
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Կենդանակերպի ամբողջական ուղեցույց",
    description:
      "Բացահայտեք 12 նշանները, Լուսնի նշանները, ասցենդենտները, չորս տարրերը, հորոսկոպներն ու համատեղելիության բոլոր 78 զույգերը։",
    url,
    inLanguage: "hy-AM",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: links.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${ARMENIAN_SITE_URL}${item}`,
      })),
    },
  };

  return (
    <main
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={path} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <span className="text-foreground/80">Ամբողջական ուղեցույց</span>
        </nav>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Compass className="size-3.5" />
          Աստղաբանական գրադարան
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Կենդանակերպի ամբողջական ուղեցույց
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          Բացահայտեք բոլոր 12 նշանները, Լուսնի և ասցենդենտի դիրքերը, չորս
          տարրերը, հորոսկոպների ժամանակահատվածներն ու համատեղելիության բոլոր
          զույգերը։
        </p>

        <GuideSection
          icon={<Sun className="size-4" />}
          title="Արեգակի 12 նշանները"
          subtitle="Ինքնություն, շարժառիթներ, բնավորություն, սեր և աշխատանք"
        >
          <CardGrid>
            {ALL_SLUGS.map((sign) => (
              <SignCard
                key={sign}
                href={`/am/zodiac/${sign}`}
                sign={sign}
                label={signMetaBySlug(sign)!.labelAm}
                note={ZODIAC_DATES[sign].rangeAm}
              />
            ))}
          </CardGrid>
        </GuideSection>
        <GuideSection
          icon={<Moon className="size-4" />}
          title="Լուսնի 12 նշանները"
          subtitle="Էմոցիոնալ կարիքներ և բնազդային արձագանքներ"
        >
          <CardGrid>
            {ALL_SLUGS.map((sign) => (
              <SignCard
                key={sign}
                href={`/am/zodiac/mtvare/${sign}`}
                sign={sign}
                label={`Լուսինը ${signMetaBySlug(sign)!.labelAm} նշանում`}
                note={placementArmenian("moon", sign).tagline}
              />
            ))}
          </CardGrid>
          <HubLink
            href="/am/zodiac/mtvare"
            label="Բացահայտել Լուսնի բոլոր նշանները"
          />
        </GuideSection>
        <GuideSection
          icon={<Sunrise className="size-4" />}
          title="Ասցենդենտի 12 նշանները"
          subtitle="Առաջին տպավորություն, մոտեցում և արտաքին ոճ"
        >
          <CardGrid>
            {ALL_SLUGS.map((sign) => (
              <SignCard
                key={sign}
                href={`/am/zodiac/amomavali/${sign}`}
                sign={sign}
                label={`${signMetaBySlug(sign)!.labelAm} ասցենդենտ`}
                note={placementArmenian("rising", sign).tagline}
              />
            ))}
          </CardGrid>
          <HubLink
            href="/am/zodiac/amomavali"
            label="Բացահայտել բոլոր ասցենդենտները"
          />
        </GuideSection>
        <GuideSection
          icon={<Sparkles className="size-4" />}
          title="Չորս տարրերը"
          subtitle="Կրակ, Հող, Օդ և Ջուր"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_ELEMENT_SLUGS.map((element) => (
              <Link
                key={element}
                href={`/am/zodiac/elementebi/${element}`}
                className="rounded-2xl border border-border bg-card/55 p-4"
              >
                <h3 className="font-semibold">{ELEMENT_NAME_AM[element]}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {SIGNS_BY_ELEMENT[element]
                    .map((sign) => signMetaBySlug(sign)!.labelAm)
                    .join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </GuideSection>
        <GuideSection
          icon={<Sparkles className="size-4" />}
          title="Համատեղելիության բոլոր 78 զույգերը"
          subtitle="Արեգակի նշանների յուրաքանչյուր եզակի համադրություն"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((sign) => (
              <details
                key={sign}
                className="rounded-2xl border border-border bg-card/45 p-4"
              >
                <summary className="cursor-pointer font-medium">
                  {SIGNS_CONTENT[sign].symbol} {signMetaBySlug(sign)!.labelAm}
                </summary>
                <ul className="mt-3 space-y-1">
                  {ALL_PAIR_SLUGS.filter((pair) =>
                    parsePairSlug(pair)?.includes(sign),
                  ).map((pair) => {
                    const parsed = parsePairSlug(pair)!;
                    return (
                      <li key={pair}>
                        <Link
                          href={`/am/zodiac/tavsebadoba/${pair}`}
                          className="block rounded-lg px-2 py-1 text-sm hover:bg-foreground/5"
                        >
                          {parsed
                            .map((item) => signMetaBySlug(item)!.labelAm)
                            .join(" + ")}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </GuideSection>
        <GuideSection
          icon={<Compass className="size-4" />}
          title="Հաշվիչներ և բաժիններ"
          subtitle="Սկսեք այն հարցից, որը ցանկանում եք ուսումնասիրել"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                href: "/am/zodiac/datit",
                title: "Նշանն ըստ ամսաթվի",
                text: "Գտեք Արեգակի պայմանական նշանը ծննդյան ամսաթվով։",
              },
              {
                href: "/am/natal-chart",
                title: "Նատալ քարտեզի հաշվիչ",
                text: "Հաշվարկեք մոլորակները, տները, ասպեկտները, Լուսինն ու ասցենդենտը։",
              },
              {
                href: "/am/horoscope",
                title: "Հորոսկոպների բաժին",
                text: "Օրական, շաբաթական, ամսական և տարեկան ուղեցույցներ։",
              },
              {
                href: "/am/compatibility",
                title: "Համատեղելիության հաշվիչ",
                text: "Համեմատեք կենդանակերպի ցանկացած երկու նշան։",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-border bg-card/55 p-4"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.text}
                </p>
              </Link>
            ))}
          </div>
        </GuideSection>

        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-8 text-center">
          <h2 className="text-2xl font-semibold">
            Կազմեք ձեր ամբողջական աստղաբանական պատկերը
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Միավորեք նշանները, մոլորակները, տներն ու ասպեկտները մեկ նատալ
            քարտեզում։
          </p>
          <Button asChild variant="mystic" className="mt-5">
            <Link href="/am/natal-chart">Հաշվարկել նատալ քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed text-foreground/90">
        {paragraphs(body).map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section className="mt-14 max-w-3xl">
      <h2 className="mb-5 text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="rounded-2xl border border-border bg-card/55 p-5"
          >
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
function GuideSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="grid size-7 place-items-center rounded-lg border border-border bg-card/65">
          {icon}
        </span>
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
function SignCard({
  href,
  sign,
  label,
  note,
}: {
  href: string;
  sign: ZodiacSlug;
  label: string;
  note: string;
}) {
  const color = signColor(signMetaBySlug(sign)!);
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4"
    >
      <span
        className="grid size-9 place-items-center rounded-xl text-lg"
        style={{
          color,
          background: `color-mix(in oklch, ${color} 18%, transparent)`,
        }}
      >
        {SIGNS_CONTENT[sign].symbol}
      </span>
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        <div className="line-clamp-1 text-xs text-muted-foreground">{note}</div>
      </div>
    </Link>
  );
}
function HubLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground"
    >
      {label} →
    </Link>
  );
}
