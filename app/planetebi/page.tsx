import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  FaqList,
  GuideBreadcrumbs,
  GuideShell,
  NatalCta,
} from "@/components/seo/astrology-guide-shell";
import { PLANETS_EN, PlanetsHubEn } from "@/components/seo/astrology-guides-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import { PLANET_GUIDES } from "@/lib/seo/astrology-guides";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  DEFAULT_OG_IMAGE,
  englishSiteHref,
  localizedAlternates,
} from "@/lib/seo/locales";

const URL = "https://www.vivida.ge/planetebi";
const TITLE = "პლანეტები ასტროლოგიაში, მნიშვნელობები ნატალურ რუკაში";
const DESCRIPTION =
  "მზე, მთვარე, მერკური, ვენერა, მარსი და სხვა პლანეტები ნატალურ რუკაში: რას ნიშნავს თითოეული, რას მართავს და როგორ წავიკითხოთ ქართულად.";
const FAQ = [
  {
    q: "რას ნიშნავს პლანეტა ნატალურ რუკაში?",
    a: "პლანეტა სიმბოლურად აღწერს ფსიქოლოგიურ ფუნქციას ან იმპულსს: მაგალითად, მერკური, აზროვნებას, ვენერა, ღირებულებებს, მარსი, მოქმედებას. ნიშანი გვიჩვენებს როგორ, სახლი კი სად ვლინდება ის.",
  },
  {
    q: "რატომ ითვლება მზე და მთვარე პლანეტებად?",
    a: "ასტროლოგიურ ენაში მათ მნათობებს უწოდებენ, მაგრამ ინტერპრეტაციის სიებში ხშირად პლანეტებთან ერთად აერთიანებენ. ასტრონომიულად მზე ვარსკვლავია, მთვარე კი დედამიწის თანამგზავრი.",
  },
  {
    q: "რომელი პლანეტაა ყველაზე მნიშვნელოვანი?",
    a: "მზე, მთვარე და ასცენდენტი ინტერპრეტაციის კარგი დასაწყისია, თუმცა მთლიან რუკაში ყველა პლანეტა, სახლი და ასპექტი ერთად იკითხება.",
  },
  {
    q: "რას ნიშნავს მმართველი პლანეტა?",
    a: "თითოეულ ნიშანს ჰყავს მმართველი პლანეტა. ასცენდენტის ნიშნის მმართველს ხშირად რუკის მმართველსაც უწოდებენ, რადგან მისი მდებარეობა ცხოვრების საერთო მიმართულებაზე მნიშვნელოვან მინიშნებას იძლევა.",
  },
];
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en")
    return {
      title: { absolute: PLANETS_EN.title },
      description: PLANETS_EN.description,
      keywords: [
        "planets in astrology",
        "birth chart planets",
        "planet meanings astrology",
        "ruling planets",
      ],
      alternates: localizedAlternates("/planetebi", "/planetebi", "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        title: PLANETS_EN.title,
        description: PLANETS_EN.description,
        url: englishSiteHref("/planetebi", false),
        type: "article",
        locale: "en_US",
        siteName: "Vivida",
      },
      twitter: {
        card: "summary_large_image",
        title: PLANETS_EN.title,
        description: PLANETS_EN.description,
      },
    };
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    keywords: [
      "პლანეტები ასტროლოგიაში",
      "პლანეტები ნატალურ რუკაში",
      "პლანეტების მნიშვნელობა",
      "მმართველი პლანეტა",
    ],
    alternates: localizedAlternates("/planetebi", "/planetebi", "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      title: TITLE,
      description: DESCRIPTION,
      url: URL,
      type: "article",
      locale: "ka_GE",
      siteName: "Vivida",
    },
  };
}
export default async function PlanetsPage() {
  const locale = await getRequestLocale();
  if (locale === "en") return <PlanetsHubEn />;
  const ld = [
    articleLd({
      url: URL,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: "2026-07-27T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "მთავარი", url: "https://www.vivida.ge" },
      { name: "პლანეტები ასტროლოგიაში", url: URL },
    ]),
    faqLd(FAQ),
  ];
  return (
    <GuideShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12">
        <GuideBreadcrumbs
          items={[{ href: "/planetebi", label: "პლანეტები" }]}
        />
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
            ნატალური რუკის გზამკვლევი
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            პლანეტები{" "}
            <span className="bg-gradient-to-r from-[var(--vivida-violet)] via-[var(--vivida-pink)] to-[var(--vivida-cyan)] bg-clip-text text-transparent">
              ასტროლოგიაში
            </span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-foreground/80">
            პლანეტა პასუხობს კითხვას „რა მოქმედებს?“, მზე აჩვენებს იდენტობას,
            მთვარე ემოციურ საჭიროებებს, ვენერა მიზიდულობას, მარსი კი მოქმედების
            სტილს. აირჩიე პლანეტა და წაიკითხე სრული ახსნა.
          </p>
        </header>
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {PLANET_GUIDES.map((planet) => (
            <Link
              href={`/planetebi/${planet.slug}`}
              key={planet.slug}
              className="group flex gap-5 rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:border-[var(--vivida-cyan)]/35"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-3xl text-[var(--vivida-cyan)]">
                {planet.symbol}
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{planet.name}</h2>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-sm text-foreground/70">{planet.role}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  მართავს: {planet.rules}
                </p>
              </div>
            </Link>
          ))}
        </section>
        <section className="mt-12 rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            პლანეტა + ნიშანი + სახლი + ასპექტი
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-foreground/80">
            სწორი ინტერპრეტაცია ოთხ ფენას აერთიანებს: პლანეტა აჩვენებს{" "}
            <strong className="text-foreground">რა</strong> ენერგია მოქმედებს;
            ზოდიაქოს ნიშანი, <strong className="text-foreground">როგორ</strong>;
            ასტროლოგიური სახლი, <strong className="text-foreground">სად</strong>
            ; ასპექტები კი, როგორ თანამშრომლობს ან იძაბება ეს ენერგია რუკის სხვა
            ნაწილებთან.
          </p>
          <Link
            href="/astrologiuri-saxlebi"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)] hover:underline"
          >
            გაეცანი 12 ასტროლოგიურ სახლს <ArrowRight className="size-4" />
          </Link>
        </section>
        <FaqList items={FAQ} />
        <NatalCta title="სად არიან შენი პლანეტები?" />
      </article>
    </GuideShell>
  );
}
