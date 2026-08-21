import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { formatAmDate } from "@/lib/i18n/am-date";
import { isMercuryRetrogradeNow, mercuryRetrogradePeriods } from "@/lib/retrograde";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;

export const MERCURY_RETROGRADE_AM = {
  title: "Մերկուրիի ռետրոգրադ. ամսաթվեր, նշանակություն և ուղեցույց",
  description:
    "Մերկուրիի ռետրոգրադի ընթացիկ և առաջիկա ամսաթվերը, հետընթաց շարժման իմաստը և գործնական խորհուրդներ հաղորդակցության, տեխնոլոգիաների ու ճամփորդությունների համար:",
};

const FAQ = [
  {
    q: "Ի՞նչ է նշանակում Մերկուրիի ռետրոգրադը:",
    a: "Ռետրոգրադ (հետընթաց) շարժումը Երկրից դիտվող տեսանելի երևույթ է: Աստղաբանության մեջ այն դիտարկվում է որպես տեղեկատվության, փաստաթղթերի, տեխնոլոգիաների և համաձայնագրերի վերանայման ժամանակահատված:",
  },
  {
    q: "Որքա՞ն է տևում Մերկուրիի ռետրոգրադը:",
    a: "Մերկուրիի ռետրոգրադ փուլը տևում է մոտ 3 շաբաթ և կրկնվում է տարեկան 3 կամ 4 անգամ: Այստեղ նշված ամսաթվերը հաշվարկված են ճշգրիտ աստղագիտական տվյալներով:",
  },
  {
    q: "Ինչի՞ց խուսափել Մերկուրիի ռետրոգրադի ժամանակ:",
    a: "Խորհուրդ է տրվում չշտապել կարևոր պայմանագրեր կնքելիս, թանկարժեք տեխնիկա գնելիս կամ հապշտապ հայտարարություններ անելիս: Այն հիանալի ժամանակ է հին գործերն ավարտելու, սխալներն ուղղելու և վերանայելու համար:",
  },
  {
    q: "Արդյո՞ք Մերկուրիի ռետրոգրադը բոլորի վրա նույն կերպ է ազդում:",
    a: "Առավել զգայուն են այն նշանները, որոնցով անցնում է Մերկուրին, ինչպես նաև Երկվորյակներն ու Կույսը (որոնց կառավարում է Մերկուրին):",
  },
];

const format = (iso: string) => formatAmDate(new Date(`${iso}T12:00:00Z`));

export function MercuryRetrogradePageAm() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const retro = isMercuryRetrogradeNow(now);
  const periods = [
    {
      label: `Մերկուրիի ռետրոգրադ ${year}`,
      periods: mercuryRetrogradePeriods(year),
    },
    {
      label: `Մերկուրիի ռետրոգրադ ${year + 1}`,
      periods: mercuryRetrogradePeriods(year + 1),
    },
  ];

  const ld = [
    articleLd({
      url: `${SITE}/merkuri-retrogradi`,
      headline: MERCURY_RETROGRADE_AM.title,
      description: MERCURY_RETROGRADE_AM.description,
      datePublished: "2026-08-13T00:00:00+04:00",
      dateModified: now.toISOString(),
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: "Մերկուրիի ռետրոգրադ", url: `${SITE}/merkuri-retrogradi` },
    ]),
    faqLd(FAQ),
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath="/merkuri-retrogradi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <span className="text-foreground/80">Մերկուրիի ռետրոգրադ</span>
        </nav>
        <header className="mb-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Մերկուրիի{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ռետրոգրադ
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            Հաշվարկված ամսաթվեր, հետընթաց շարժման հստակ բացատրություն և գործնական խորհուրդներ՝ առանց ավելորդ անհանգստության:
          </p>
        </header>

        <div
          className={`rounded-2xl border p-5 sm:p-6 ${
            retro
              ? "border-[var(--vivida-pink)]/45 bg-[var(--vivida-pink)]/10"
              : "border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/8"
          }`}
        >
          <div className="flex items-center gap-3">
            <RotateCcw
              className={`size-6 shrink-0 ${
                retro ? "text-[var(--vivida-pink)]" : "text-[var(--vivida-cyan)]"
              }`}
            />
            <div>
              <div className="text-lg font-semibold">
                Մերկուրին այժմ {retro ? "ռետրոգրադ (հետընթաց)" : "ուղիղ"} է
              </div>
              <p className="mt-0.5 text-sm text-foreground/80">
                {retro
                  ? "Ստուգեք մանրուքները, ավարտեք հին գործերը և լրացուցիչ ժամանակ տրամադրեք փաստաթղթերին:"
                  : "Մերկուրին շարժվում է առաջ՝ նպաստելով հստակ հաղորդակցությանն ու նոր համաձայնագրերին:"}
              </p>
            </div>
          </div>
        </div>

        {periods.map((group) => (
          <section key={group.label} className="mt-8">
            <h2 className="text-xl font-semibold">{group.label}</h2>
            <div className="mt-3 space-y-2">
              {group.periods.map((period) => (
                <div
                  key={period.startIso}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/50 px-4 py-3"
                >
                  <div className="text-[15px] font-medium">
                    {format(period.startIso)} — {format(period.endIso)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {period.startSignAm === period.endSignAm
                      ? period.startSignAm
                      : `${period.startSignAm} → ${period.endSignAm}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10 space-y-4">
          <Text
            title="Ինչի՞ վրա կարող է ազդել"
            body="Մերկուրին խորհրդանշում է հաղորդակցությունը, տեղեկատվությունը, տեխնոլոգիաները, տրանսպորտը և պայմանագրերը: Ռետրոգրադ շարժման ժամանակ կարող են առաջանալ թյուրիմացություններ, ուշացումներ կամ տեխնիկական խնդիրներ:"
          />
          <Text
            title="Ինչի՞ համար է հարմար այս փուլը"
            body="Վերանայման, խմբագրման, վերանորոգման, հաշտեցման և հին գաղափարներին վերադառնալու համար: Ավարտեք դադարեցված նախագծերը, կարգի բերեք փաստաթղթերը և պահուստավորեք կարևոր տվյալները:"
          />
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Հաճախ տրվող հարցեր
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50">
                <summary className="cursor-pointer p-5 font-medium">{item.q}</summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold sm:text-2xl">
            Ինչպե՞ս է այս տրանզիտն ազդում ձեզ վրա
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            Ձեր նատալ քարտեզը ցույց է տալիս ծննդյան Մերկուրին և այն տունը, որով այժմ շարժվում է տրանզիտը:
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href="/am/natal-chart">
              Բացահայտել նատալ քարտեզը <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function Text({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}
