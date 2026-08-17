import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { ArmenianGuide } from "@/components/am/armenian-guide";
import { CompatibilityCalculator } from "@/components/landing/compatibility-calculator";
import { buildCalculatorData } from "@/lib/compatibility-calculator-data";
import {
  DEFAULT_OG_IMAGE,
  ARMENIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";

const PATH = "/am/compatibility";
const TITLE = "Աստղաբանական համատեղելիություն. Ավելին, քան միայն Արևի նշաններ";
const DESCRIPTION =
  "Իմացեք, թե ինչպես է սինաստրիան համեմատում երկու նատալ քարտեզներ՝ Արևի, Լուսնի, Վեներայի, Մարսի, տների և ասպեկտների միջոցով:";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/zodiac/tavsebadoba", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/compatibility`,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
};

export default function ArmenianCompatibilityPage() {
  const { signs, pairs } = buildCalculatorData("am");
  const url = `${ARMENIAN_SITE_URL}/compatibility`;
  const ld = [
    articleLd({ url, headline: TITLE, description: DESCRIPTION }),
    breadcrumbLd([
      { name: "Գլխավոր", url: ARMENIAN_SITE_URL },
      { name: "Համատեղելիություն", url },
    ]),
  ];

  return (
    <ArmenianGuide
      eyebrow="Հարաբերություններ և սինաստրիա"
      title="Համատեղելիությունը ավելին է, քան միայն երկու Արևի նշան"
      intro="Աստղաբանական համատեղելիությունը (սինաստրիան) համեմատում է երկու ամբողջական ծննդյան քարտեզներ՝ բացահայտելով ձգողականության, հասկացողության և համատեղ աճի նախշերը:"
      georgianPath="/zodiac/tavsebadoba"
      englishPath="/compatibility"
      jsonLd={ld}
    >
      <section className="not-prose rounded-3xl border border-border bg-card/40 p-4 sm:p-7">
        <div className="mb-6 text-center">
          <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
          <h2 className="mt-3 text-2xl font-semibold">
            Փորձեք անվճար համատեղելիության հաշվիչը
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Ընտրեք երկու նշան՝ ակնթարթային հայերեն համատեղելիության արդյունքի
            համար:
          </p>
        </div>
        <CompatibilityCalculator signs={signs} pairs={pairs} locale="am" />
      </section>

      <section>
        <h2>Ի՞նչ է համեմատում համատեղելիության վերլուծությունը</h2>
        <ul className="mt-4 list-disc">
          <li>
            <strong>Արևների կապը</strong>՝ նկարագրում է ինքնությունը, կյանքի
            ուղղությունը և փոխադարձ ճանաչումը:
          </li>
          <li>
            <strong>Լուսինների կապը</strong>՝ ցույց է տալիս հուզական ռիթմը,
            ապահովության զգացումն ու առօրյա կարիքները:
          </li>
          <li>
            <strong>Մերկուրիի ասպեկտները</strong>՝ արտացոլում են հաղորդակցման
            ոճն ու մտքերի փոխանակումը:
          </li>
          <li>
            <strong>Վեներան և Մարսը</strong>՝ ավանդաբար կապված են սիրո,
            գրավչության, կրքի և ցանկությունների հետ:
          </li>
          <li>
            <strong>Սատուրնի կապերը</strong>՝ ընդգծում են պատասխանատվությունը,
            կայունությունը և համբերությունը:
          </li>
          <li>
            <strong>Տների համադրումը</strong>՝ ցույց է տալիս, թե կյանքի որ
            ոլորտներն են ակտիվանում զուգընկերոջ մոլորակներով:
          </li>
        </ul>
      </section>

      <section>
        <h2>Համատեղելիությունը որպես երկխոսություն</h2>
        <p>
          Սինաստրիայի լավագույն կիրառումն է տալ ավելի ճիշտ հարցեր. որտե՞ղ ենք մենք
          բնականորեն հասկանում միմյանց, որտե՞ղ են տարբերվում մեր կարիքները և ինչպե՞ս
          կարող ենք զարգանալ միասին:
        </p>
      </section>

      <div className="rounded-3xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-6 text-center sm:p-8">
        <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
        <h2 className="mt-3">Բացահայտեք ձեր ամբողջական համատեղելիությունը</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Ստեղծեք անվճար պրոֆիլ՝ ամբողջական նատալ քարտեզների համեմատություն
          ստանալու համար:
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white"
        >
          Ստեղծել իմ պրոֆիլը <ArrowRight className="size-4" />
        </Link>
      </div>
    </ArmenianGuide>
  );
}
