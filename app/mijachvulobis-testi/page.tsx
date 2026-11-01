import type { Metadata } from "next";
import { Clock, FileCheck2, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { AttachmentTest } from "@/components/attachment/attachment-test";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const PATH = "/mijachvulobis-testi";
const TITLE_KA = "მიჯაჭვულობის სტილის ტესტი, როგორ გიყვარს?";
const DESCRIPTION_KA =
  "გაიარე მიჯაჭვულობის 24-კითხვიანი ტესტი ქართულად. გაიგე შენი სტილი, უსაფრთხო, შფოთიანი, აცილებადი თუ შიშით-აცილებადი, და მიიღე პერსონალური განმარტება ურთიერთობებისთვის.";
const TITLE_EN = "Attachment Style Test, How Do You Love?";
const DESCRIPTION_EN =
  "Take the free 24-question attachment style test. Discover whether your style is secure, anxious, avoidant, or fearful-avoidant, and get a personal guide for your relationships.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const title = (en ? TITLE_EN : TITLE_KA) + ", Vivida";
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  return {
    title: { absolute: title },
    description,
    keywords: en
      ? [
          "attachment style test",
          "attachment theory quiz",
          "anxious attachment test",
          "avoidant attachment test",
          "relationship attachment quiz",
        ]
      : [
          "მიჯაჭვულობის ტესტი",
          "მიჯაჭვულობის სტილი",
          "attachment test ქართულად",
          "შფოთიანი მიჯაჭვულობა",
          "აცილებადი მიჯაჭვულობა",
          "ფსიქოლოგიური ტესტი ქართულად",
          "ურთიერთობის ტესტი",
        ],
    alternates: localizedAlternates(PATH, PATH, en ? "en" : "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${siteUrl}${PATH}`,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const FAQ_KA = [
  {
    q: "რას ზომავს მიჯაჭვულობის ტესტი?",
    a: "ის ზომავს ორ განზომილებას: შფოთს (მიტოვების შიში, დადასტურების საჭიროება) და აცილებას (სიახლოვის დისკომფორტი, დამოუკიდებლობისკენ მიდრეკილება). ამ ორის კომბინაცია ოთხ სტილს იძლევა, უსაფრთხო, შფოთიანი, აცილებადი და შიშით-აცილებადი.",
  },
  {
    q: "როგორ ითვლება შედეგი?",
    a: "24 დებულებიდან 12 შფოთს ზომავს, 12, აცილებას. თითოეული ფასდება 1-დან 5 ქულამდე, ნაწილი შებრუნებულად. თითო ღერძი 0-დან 100-მდე ნორმდება, სტილი კი რუკის კვადრანტით განისაზღვრება.",
  },
  {
    q: "არის ეს ფსიქოლოგიური დიაგნოზი?",
    a: "არა. ტესტი თვითრეფლექსიისა და ურთიერთობების გასაგებადაა. მიჯაჭვულობის სტილი განაჩენი არ არის, ის ცხოვრების გამოცდილებით იცვლება და შეგნებული მუშაობით უსაფრთხოსკენ იხრება.",
  },
  {
    q: "ინახება ჩემი პასუხები?",
    a: "არა. პასუხები და შედეგი უშუალოდ შენს ბრაუზერში ითვლება, Vivida-ს სერვერზე არ იგზავნება და გვერდის განახლების შემდეგ ქრება.",
  },
];

const FAQ_EN = [
  {
    q: "What does the attachment test measure?",
    a: "It measures two dimensions: anxiety (fear of abandonment, need for reassurance) and avoidance (discomfort with closeness, pull toward independence). Their combination gives four styles: secure, anxious, avoidant, and fearful-avoidant.",
  },
  {
    q: "How is the result calculated?",
    a: "Of the 24 statements, 12 measure anxiety and 12 measure avoidance. Each is scored from 1 to 5, some reverse-keyed. Each axis is normalized to 0–100, and your style is determined by the quadrant of the map.",
  },
  {
    q: "Is this a psychological diagnosis?",
    a: "No. The test is for self-reflection and understanding relationships. Attachment style is not a verdict — it shifts with life experience and bends toward security with conscious work.",
  },
  {
    q: "Are my answers stored?",
    a: "No. Your answers and result are computed right in your browser, never sent to Vivida's servers, and disappear when you refresh the page.",
  },
];

export default async function AttachmentTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();
  const en = locale === "en";
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const faq = en ? FAQ_EN : FAQ_KA;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: en ? "Attachment Style Test" : "მიჯაჭვულობის სტილის ტესტი ქართულად",
      description,
      inLanguage: en ? "en" : "ka-GE",
      url: `${siteUrl}${PATH}`,
      numberOfQuestions: 24,
      about: {
        "@type": "Thing",
        name: en ? "Attachment style" : "მიჯაჭვულობის სტილი",
        alternateName: "Attachment style",
      },
    },
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      { name: en ? "Tests" : "ტესტები", url: `${siteUrl}/tests` },
      {
        name: en ? "Attachment Test" : "მიჯაჭვულობის ტესტი",
        url: `${siteUrl}${PATH}`,
      },
    ]),
    faqLd(faq),
  ];

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.34_0.17_350/0.45),transparent_70%),radial-gradient(45%_35%_at_85%_45%,oklch(0.30_0.15_200/0.38),transparent_70%),radial-gradient(40%_30%_at_10%_80%,oklch(0.30_0.15_305/0.35),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? (
        <AppHeader authed active="tests" />
      ) : (
        <SmartHeader active="tests" locale={locale} georgianPath={PATH} />
      )}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <header className="mb-6 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida · Attachment Style Test
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {en ? "How do " : "როგორ"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-pink),var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "you love?" : "გიყვარს?"}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
            {en
              ? "Answer 24 short statements and discover your attachment style — why you worry, why you pull away, and what your relationships need."
              : "უპასუხე 24 მოკლე დებულებას და გაიგე შენი მიჯაჭვულობის სტილი, რატომ ღელავ, რატომ დისტანცირდები და რა სჭირდება შენს ურთიერთობას."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="size-3.5" />
              {en ? "24 questions" : "24 კითხვა"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {en ? "About 5 minutes" : "დაახლოებით 5 წუთი"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              {en ? "Answers never stored" : "პასუხები არ ინახება"}
            </span>
          </div>
        </header>

        <AttachmentTest locale={locale} />
      </section>

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {en ? "The four styles in brief" : "ოთხი სტილი მოკლედ"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[var(--vivida-cyan)]">
                ⚓ {en ? "Secure" : "უსაფრთხო"}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                {en
                  ? "Both closeness and independence feel comfortable. Conflict is a problem, not a catastrophe."
                  : "სიახლოვეც კომფორტულია და დამოუკიდებლობაც. კონფლიქტი პრობლემაა და არა კატასტროფა."}
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[var(--vivida-pink)]">
                🌊 {en ? "Anxious" : "შფოთიანი"}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                {en
                  ? "Connection matters enormously, so distance hurts and reassurance is needed."
                  : "კავშირი ძალიან მნიშვნელოვანია, ამიტომ დისტანცია მტკივნეულად აღიქმება და დადასტურებაა საჭირო."}
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[oklch(0.82_0.16_85)]">
                🏔️ {en ? "Avoidant" : "აცილებადი"}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                {en
                  ? "Independence is precious; too much closeness feels like pressure, and space is needed."
                  : "დამოუკიდებლობა ძვირფასია, გადაჭარბებული სიახლოვე კი წნეხად აღიქმება და სივრცეა საჭირო."}
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[var(--vivida-violet)]">
                🌗 {en ? "Fearful-avoidant" : "შიშით-აცილებადი"}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                {en
                  ? "You want closeness and fear it too — a swing between missing and pulling away."
                  : "სიახლოვეც გინდა და გეშინია კიდეც, საქანელა მონატრებასა და მოშორებას შორის."}
              </p>
            </article>
          </div>

          <h2 className="mt-7 text-xl font-semibold tracking-tight">
            {en ? "How is it scored?" : "როგორ ითვლება ქულა?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {en
              ? "Twelve items measure anxiety, twelve measure avoidance. Each scores 1–5, some reverse-keyed. Each axis is normalized to 0–100, and the style follows from the quadrant: both below 50, secure; anxiety above 50, anxious; avoidance above 50, avoidant; both high, fearful-avoidant."
              : "12 პუნქტი შფოთს ზომავს, 12, აცილებას. თითოეული 1–5 ქულაა, ნაწილი შებრუნებულად ითვლება. თითო ღერძი 0–100-ზე ნორმდება, სტილი კი კვადრანტით განისაზღვრება: ორივე 50-ზე დაბლა, უსაფრთხო; შფოთი 50-ზე მაღლა, შფოთიანი; აცილება 50-ზე მაღლა, აცილებადი; ორივე მაღლა, შიშით-აცილებადი."}
          </p>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-background/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[15px] leading-relaxed text-foreground/80">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
