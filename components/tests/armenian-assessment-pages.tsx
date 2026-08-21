import type { ReactNode } from "react";
import Link from "next/link";

import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { PopularSearches } from "@/components/seo/popular-searches";
import { TestMusicPlayer } from "@/components/mbti/test-music-player";
import { MbtiTestClient } from "@/components/mbti/mbti-test-client";
import { IqTestClient } from "@/components/iq/iq-test";
import { EqTestClient } from "@/components/eq/eq-test-client";
import { BigFiveTestClient } from "@/components/big-five/big-five-test-client";
import { ARMENIAN_SITE_URL, armenianSiteHref } from "@/lib/seo/locales";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { localeHref } from "@/lib/i18n/armenian-routes";
import type { MbtiQuestion } from "@/lib/mbti-questions";
import { IQ_ADAPTIVE_LENGTH } from "@/lib/iq/adaptive";
import { EQ_QUESTION_COUNT } from "@/lib/eq/questions";
import { BIG5_QUESTION_COUNT } from "@/lib/big-five/questions";
import { BIG5_TRAITS_AM, EQ_DOMAINS_AM, IQ_DOMAINS_AM } from "@/lib/tests-content-am";

type Faq = { q: string; a: string };
type Card = { title: string; description: string; glyph?: string };

function ArmenianAssessmentShell({
  authed,
  path,
  title,
  description,
  eyebrow,
  heading,
  accent,
  subtitle,
  questionCount,
  about,
  children,
  infoTitle,
  infoParagraphs,
  cards,
  faq,
  searches,
  music = false,
  links = [],
}: {
  authed: boolean;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  accent: string;
  subtitle: string;
  questionCount: number;
  about: string;
  children: ReactNode;
  infoTitle: string;
  infoParagraphs: string[];
  cards: Card[];
  faq: Faq[];
  searches: string[];
  music?: boolean;
  links?: { href: string; label: string; sub: string }[];
}) {
  const url = armenianSiteHref(path, false);
  const ld = [
    { "@context": "https://schema.org", "@type": "Quiz", name: title, description, inLanguage: "hy-AM", url, educationalLevel: "beginner", numberOfQuestions: questionCount, about: { "@type": "Thing", name: about } },
    faqLd(faq),
    breadcrumbLd([
      { name: "Գլխավոր", url: ARMENIAN_SITE_URL },
      { name: "Թեստեր", url: `${ARMENIAN_SITE_URL}/tests` },
      { name: title, url },
    ]),
  ];

  return (
    <main lang="am" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_250/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.15_350/0.35),transparent_70%)]" />
      <Starfield count={130} shooting={2} />
      {music && <TestMusicPlayer locale="am" />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
      {authed ? <AppHeader authed active="tests" /> : <SmartHeader active="tests" locale="am" georgianPath={path} />}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {heading}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">{accent}</span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </header>
        {children}
      </section>

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">{infoTitle}</h2>
          {infoParagraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-foreground/85">{paragraph}</p>)}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {cards.map((card) => <div key={card.title} className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"><div className="text-sm font-semibold">{card.glyph && <span className="mr-2">{card.glyph}</span>}{card.title}</div><div className="mt-0.5 text-xs text-muted-foreground">{card.description}</div></div>)}
          </div>
          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Հաճախ տրվող հարցեր</h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => <details key={item.q} className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">{item.q}<span className="text-muted-foreground transition-transform group-open:rotate-45">+</span></summary><p className="px-4 pb-4 text-[15px] leading-relaxed text-foreground/85">{item.a}</p></details>)}
          </div>
          <PopularSearches queries={searches} locale="am" />
        </div>
        {links.length > 0 && <section className="mt-10"><h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Ուսումնասիրեք ավելին</h2><div className="grid gap-2 sm:grid-cols-2">{links.map((item) => <Link key={item.href} href={localeHref(item.href, "am")} className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 transition-colors hover:bg-card/70"><div className="text-sm font-medium text-foreground/90">{item.label}</div><div className="mt-0.5 text-xs text-muted-foreground">{item.sub}</div></Link>)}</div></section>}
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

const COMMON_LINKS = [
  { href: "/pirovnebis-testi", label: "Astro-MBTI", sub: "Բացահայտեք ձեր հոգեբանական տիպը" },
  { href: "/iq-testi", label: "IQ թեստ", sub: "Հարմարվող տրամաբանական առաջադրանքներ" },
  { href: "/eq-testi", label: "EQ թեստ", sub: "Էմոցիոնալ ինտելեկտի պրոֆիլ" },
  { href: "/big-five", label: "Big Five", sub: "Անհատականության հինգ լայն գծերը" },
];

export function ArmenianMbtiAssessmentPage({ authed, questions }: { authed: boolean; questions: MbtiQuestion[] }) {
  const faq = [
    { q: "Քանի՞ հարց կա թեստում։", a: "Թեստը ներառում է 60 պնդում՝ համաձայնության յոթաստիճան սանդղակով։" },
    { q: "Թեստն անվճա՞ր է։", a: "Այո։ Կարող եք անվճար ավարտել թեստը և տեսնել ձեր տիպը։" },
    { q: "Սա ախտորոշո՞ւմ է։", a: "Ոչ։ Սա ինքնաճանաչման գործիք է, ոչ թե կլինիկական գնահատում։" },
  ];
  return <ArmenianAssessmentShell authed={authed} path="/pirovnebis-testi" title="Անվճար անհատականության թեստ — բացահայտեք ձեր 16 տիպերից մեկը" description="Պատասխանեք 60 հարցի և ուսումնասիրեք ձեր նախընտրությունները էներգիայի, տեղեկատվության, որոշումների, կառուցվածքի և ինքնության ոլորտներում։" eyebrow="Astro-MBTI" heading="Ձեր" accent="հոգեբանական տիպը" subtitle="60 հարց · մոտ 7 րոպե · անհատական պրոֆիլ" questionCount={questions.length} about="Անհատականության տիպ (MBTI ոճով)" infoTitle="Ի՞նչ է չափում այս անհատականության թեստը։" infoParagraphs={["MBTI ոճի այս համակարգը նկարագրում է ձեր նախընտրությունները չորս զույգ չափումների և ինքնության լրացուցիչ չափման միջոցով։ Չկա «լավ» կամ «վատ» տիպ․ արդյունքը ցույց է տալիս, թե ինչպես եք սովորաբար մշակում տեղեկատվությունն ու որոշումներ կայացնում։", "Ձեր տիպը դիտարկեք որպես կրկնվող նախընտրությունների բառապաշար, ոչ թե անփոփոխ սահմանում կամ ախտորոշում։"]} cards={[{ title: "E ↔ I — Էներգիա", description: "Շփո՞ւմը, թե՞ մենակությունն է ձեզ վերականգնում" }, { title: "S ↔ N — Տեղեկատվություն", description: "Կոնկրետ փաստե՞ր, թե՞ օրինաչափություններ և հնարավորություններ" }, { title: "T ↔ F — Որոշումներ", description: "Անանձնական տրամաբանությո՞ւն, թե՞ արժեքներ և մարդկային ազդեցություն" }, { title: "J ↔ P — Կառուցվածք", description: "Պլանավորում և ավարտ, թե ճկունություն և բաց տարբերակներ" }]} faq={faq} searches={["անվճար անհատականության թեստ", "16 տիպերի թեստ", "MBTI թեստ հայերեն", "իմ անհատականության տիպը"]} links={COMMON_LINKS.slice(1)} music><MbtiTestClient questions={questions} locale="am" /></ArmenianAssessmentShell>;
}

export function ArmenianIqAssessmentPage({ authed }: { authed: boolean }) {
  const faq = [{ q: "Ինչպե՞ս է աշխատում հարմարվող IQ թեստը։", a: "Յուրաքանչյուր պատասխանից հետո հաջորդ առաջադրանքի բարդությունը հարմարեցվում է ձեր ընթացիկ մակարդակին։" }, { q: "Որքա՞ն է տևում թեստը։", a: `Թեստը ներառում է ${IQ_ADAPTIVE_LENGTH} առաջադրանք և ունի 25 րոպե ժամանակային սահմանափակում։` }, { q: "Արդյունքը կլինիկական գնահատո՞ւմ է։", a: "Ոչ։ Այն տրամաբանական կարողության մոտավոր գնահատում է և չի սահմանում մարդու ընդհանուր ներուժը։" }];
  return <ArmenianAssessmentShell authed={authed} path="/iq-testi" title="Անվճար IQ թեստ — հարմարվող տրամաբանական գնահատում" description="Անցեք թվային, տրամաբանական, տարածական և պատկերային մտածողության 25 հարմարվող առաջադրանք և ստացեք IQ-ի մոտավոր միավոր։" eyebrow="Vivida IQ" heading="Ձեր" accent="մտածողության պրոֆիլը" subtitle="25 հարմարվող առաջադրանք · 25 րոպե · անվճար" questionCount={IQ_ADAPTIVE_LENGTH} about="Տրամաբանական մտածողություն և IQ" infoTitle="Ի՞նչ է չափում IQ թեստը։" infoParagraphs={["Այս թեստը գնահատում է օրինաչափությունները տեսնելու, թվերի հետ աշխատելու, տրամաբանական եզրակացություններ անելու և տարածական պատկերները մտովի մշակելու կարողությունը։", "Հարմարվող համակարգը հաջորդ առաջադրանքը ընտրում է ձեր նախորդ պատասխանների հիման վրա, որպեսզի ավելի քիչ հարցերով ստանա ավելի ճշգրիտ գնահատում։"]} cards={Object.entries(IQ_DOMAINS_AM).map(([key, value]) => ({ title: value, description: key === "numeric" ? "Թվային շարքեր և քանակական կապեր" : key === "logic" ? "Եզրակացություններ և վերացական կանոններ" : key === "spatial" ? "Պտույտներ և տարածական փոխակերպումներ" : "Տեսողական հաջորդականություններ և մատրիցներ" }))} faq={faq} searches={["անվճար IQ թեստ", "IQ թեստ հայերեն", "տրամաբանական մտածողության թեստ", "ինտելեկտի թեստ"]} links={COMMON_LINKS.filter((item) => item.href !== "/iq-testi")}><IqTestClient locale="am" /></ArmenianAssessmentShell>;
}

export function ArmenianEqAssessmentPage({ authed }: { authed: boolean }) {
  const faq = [{ q: "Ի՞նչ է էմոցիոնալ ինտելեկտը։", a: "Այն սեփական և ուրիշների հույզերը ճանաչելու, հասկանալու և կառավարելու հմտությունների ամբողջությունն է։" }, { q: "Ինչպե՞ս է հաշվարկվում EQ միավորը։", a: "40 պատասխանները միավորվում են հինգ ոլորտների մեջ և նորմավորվում 0-ից 100 սանդղակով։" }, { q: "Կարելի՞ է զարգացնել EQ-ն։", a: "Այո։ Ինքնագիտակցությունը, հույզերի կառավարումը և հաղորդակցման հմտությունները զարգանում են գիտակցված վարժանքով։" }];
  return <ArmenianAssessmentShell authed={authed} path="/eq-testi" title="Անվճար EQ թեստ — էմոցիոնալ ինտելեկտի գնահատում" description="Պատասխանեք 40 հարցի և ուսումնասիրեք ինքնագիտակցությունը, ինքնակարգավորումը, մոտիվացիան, ապրումակցումը և սոցիալական հմտությունները։" eyebrow="Vivida EQ" heading="Ձեր" accent="էմոցիոնալ ինտելեկտը" subtitle={`${EQ_QUESTION_COUNT} հարց · մոտ 7 րոպե · անվճար`} questionCount={EQ_QUESTION_COUNT} about="Էմոցիոնալ ինտելեկտ (EQ)" infoTitle="Ի՞նչ է էմոցիոնալ ինտելեկտը։" infoParagraphs={["Էմոցիոնալ ինտելեկտը սեփական և ուրիշների հույզերը ճանաչելու, հասկանալու ու կառավարելու հմտությունն է։ Այդ սովորությունները ազդում են հաղորդակցության, կոնֆլիկտների, դիմակայունության և հարաբերությունների վրա։", "Այս ինքնագնահատման թեստը չափում է հինգ ծանոթ ոլորտ և օգնում է տեսնել ձեր ուժեղ կողմերն ու զարգացման ուղղությունները։"]} cards={Object.entries(EQ_DOMAINS_AM).map(([, value], index) => ({ title: value.name, description: value.tagline, glyph: ["🪞", "⚓", "🔥", "💗", "🤝"][index] }))} faq={faq} searches={["անվճար EQ թեստ", "էմոցիոնալ ինտելեկտի թեստ", "ապրումակցման թեստ", "ինքնագիտակցության թեստ"]} links={COMMON_LINKS.filter((item) => item.href !== "/eq-testi")}><EqTestClient locale="am" /></ArmenianAssessmentShell>;
}

export function ArmenianBigFiveAssessmentPage({ authed }: { authed: boolean }) {
  const faq = [{ q: "Ի՞նչ է Big Five մոդելը։", a: "Այն անհատականությունը նկարագրում է հինգ լայն և համեմատաբար անկախ գծերով՝ բացություն, բարեխղճություն, էքստրավերսիա, բարյացակամություն և նևրոտիզմ։" }, { q: "Կա՞ լավ կամ վատ պրոֆիլ։", a: "Ոչ։ Յուրաքանչյուր գծի երկու բևեռներն էլ կարող են օգտակար լինել տարբեր իրավիճակներում։" }, { q: "Թեստը կլինիկական ախտորոշո՞ւմ է։", a: "Ոչ։ Սա ինքնագնահատման և ինքնաճանաչման գործիք է։" }];
  return <ArmenianAssessmentShell authed={authed} path="/big-five" title="Անվճար Big Five անհատականության թեստ — OCEAN պրոֆիլ" description="Պատասխանեք 40 հարցի և բացահայտեք ձեր պրոֆիլը անհատականության հինգ լայն գծերով։" eyebrow="Vivida · Big Five" heading="Ձեր" accent="Big Five պրոֆիլը" subtitle={`${BIG5_QUESTION_COUNT} հարց · մոտ 7 րոպե · անվճար`} questionCount={BIG5_QUESTION_COUNT} about="Անհատականության մեծ հնգյակ" infoTitle="Ի՞նչ է Big Five-ը։" infoParagraphs={["Big Five-ը հոգեբանության մեջ լայնորեն կիրառվող մոդել է, որը անհատականությունը նկարագրում է հինգ համեմատաբար անկախ գծերով։ Այն մարդկանց չի բաժանում փակ տիպերի, այլ ցույց է տալիս յուրաքանչյուր գծի աստիճանը։", "Այս գծերից ոչ մեկը ինքնին «լավ» կամ «վատ» չէ։ Պրոֆիլը օգտակար է ձեր սովորությունները, նախընտրությունները և տարբեր իրավիճակներում արձագանքները հասկանալու համար։"]} cards={Object.entries(BIG5_TRAITS_AM).map(([, value], index) => ({ title: value.name, description: value.tagline, glyph: ["🎨", "📐", "⚡", "🤲", "🌊"][index] }))} faq={faq} searches={["անվճար Big Five թեստ", "OCEAN անհատականության թեստ", "անհատականության հինգ գծերը", "Big Five հայերեն"]} links={COMMON_LINKS.filter((item) => item.href !== "/big-five")}><BigFiveTestClient locale="am" /></ArmenianAssessmentShell>;
}
