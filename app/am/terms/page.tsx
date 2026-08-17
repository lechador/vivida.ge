import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { ArmenianGuide } from "@/components/am/armenian-guide";
import {
  DEFAULT_OG_IMAGE,
  ARMENIAN_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const PATH = "/am/terms";
const TITLE = "Օգտագործման պայմաններ";
const DESCRIPTION =
  "Vivida-ի օգտագործման պայմանները հայերենով. աստղաբանության, ինքնաճանաչման և համայնքային գործառույթների կանոնները:";
const LAST_UPDATED = "16 օգոստոսի, 2026";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/terms", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/terms`,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
};

export default function ArmenianTermsPage() {
  return (
    <ArmenianGuide
      eyebrow="Իրավական"
      title="Օգտագործման պայմաններ"
      intro={`Վերջին թարմացումը՝ ${LAST_UPDATED}: Մուտք գործելով կամ օգտագործելով Vivida-ն՝ դուք համաձայնում եք այս պայմաններին:`}
      georgianPath="/terms"
      englishPath="/terms"
    >
      <section>
        <h2>1. Ղեկավարող կողմ և համաձայնություն</h2>
        <p>
          Vivida-ն ղեկավարվում է <strong>{LEGAL_ENTITY.name}</strong> ընկերության
          կողմից (գրանցված Վայոմինգում, ԱՄՆ, գրանցման համար {LEGAL_ENTITY.filingId}
          ), հասցե՝ {LEGAL_ENTITY.address}: Եթե համաձայն չեք այս պայմաններին, խնդրում
          ենք չօգտվել ծառայությունից:
        </p>
      </section>
      <section>
        <h2>2. Տարիքային սահմանափակում</h2>
        <p>
          Ծառայությունից օգտվելու համար դուք պետք է լինեք առնվազն 18 տարեկան: Դուք
          պատասխանատու եք ձեր հաշվի անվտանգության համար:
        </p>
      </section>
      <section>
        <h2>3. Աստղաբանական և թեստային բովանդակություն</h2>
        <p>
          Աստղաբանական մեկնաբանությունները, հորոսկոպները, համատեղելիության
          արդյունքները և անհատականության թեստերը տրամադրվում են ինքնաճանաչման և
          ժամանցային նպատակներով: Դրանք չեն հանդիսանում մասնագիտական բժշկական,
          հոգեբանական, իրավական կամ ֆինանսական խորհրդատվություն:
        </p>
      </section>
      <section>
        <h2>4. Գաղտնիություն</h2>
        <p>
          Անձնական տվյալների մշակումը նկարագրված է մեր{" "}
          <Link
            href="/am/privacy"
            className="text-[var(--vivida-cyan)] hover:underline"
          >
            գաղտնիության քաղաքականության
          </Link>{" "}
          մեջ:
        </p>
      </section>
      <section>
        <h2>5. Կապ</h2>
        <p>
          Հարցերի դեպքում գրեք մեզ՝{" "}
          <a
            href="mailto:hello@vivida.ge"
            className="text-[var(--vivida-cyan)] hover:underline"
          >
            hello@vivida.ge
          </a>
          : Վրացերեն տարբերակը հասանելի է{" "}
          <Link
            href={`${GEORGIAN_SITE_URL}/terms`}
            hrefLang="ka-GE"
            className="text-[var(--vivida-cyan)] hover:underline"
          >
            vivida.ge/terms
          </Link>{" "}
          էջում:
        </p>
      </section>
    </ArmenianGuide>
  );
}
