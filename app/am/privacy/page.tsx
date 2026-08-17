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

const PATH = "/am/privacy";
const TITLE = "Գաղտնիության քաղաքականություն";
const DESCRIPTION =
  "Vivida-ի գաղտնիության քաղաքականությունը հայերենով. ինչ տեղեկատվություն է հավաքվում, ինչպես է այն օգտագործվում և ձեր տվյալների պաշտպանության իրավունքները:";
const LAST_UPDATED = "16 օգոստոսի, 2026";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/privacy", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/privacy`,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
};

export default function ArmenianPrivacyPage() {
  return (
    <ArmenianGuide
      eyebrow="Իրավական"
      title="Գաղտնիության քաղաքականություն"
      intro={`Վերջին թարմացումը՝ ${LAST_UPDATED}: Այս քաղաքականությունը բացատրում է, թե ինչպես է Vivida-ն հավաքում, օգտագործում և պաշտպանում տեղեկատվությունը:`}
      georgianPath="/privacy"
      englishPath="/privacy"
    >
      <section>
        <h2>1. Ով է ղեկավարում Vivida-ն</h2>
        <p>
          Vivida-ն ղեկավարվում է <strong>{LEGAL_ENTITY.name}</strong> ընկերության
          կողմից (գրանցված Վայոմինգում, ԱՄՆ, գրանցման համար {LEGAL_ENTITY.filingId}
          ), հասցե՝ {LEGAL_ENTITY.address}: Գաղտնիության հարցերով կարող եք գրել՝{" "}
          <a
            href="mailto:hello@vivida.ge"
            className="text-[var(--vivida-cyan)] hover:underline"
          >
            hello@vivida.ge
          </a>
          :
        </p>
      </section>
      <section>
        <h2>2. Մեր հավաքած տեղեկատվությունը</h2>
        <ul className="mt-4 list-disc">
          <li>
            Հաշվի տվյալներ՝ Google-ի կամ էլ. փոստի միջոցով (անուն, էլ. հասցե,
            նկար):
          </li>
          <li>
            Ծննդյան տվյալներ՝ քարտեզի հաշվարկման համար (ամսաթիվ, ժամ, վայր):
          </li>
          <li>
            Պրոֆիլի լրացուցիչ տվյալներ, որոնք ընտրում եք ավելացնել:
          </li>
          <li>
            Տեխնիկական և օգտագործման տեղեկատվություն (սարք, բրաուզեր):
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Ինչու ենք օգտագործում տեղեկատվությունը</h2>
        <p>
          Մենք օգտագործում ենք տեղեկատվությունը նատալ քարտեզները հաշվարկելու,
          անհատական մեկնաբանություններ և հորոսկոպներ տրամադրելու, հաշիվներն
          ապահովելու և ծառայությունը բարելավելու նպատակով:
        </p>
      </section>
      <section>
        <h2>4. Ձեր իրավունքները</h2>
        <p>
          Դուք իրավունք ունեք պահանջել մուտք դեպի ձեր անձնական տվյալները, դրանց
          ուղղում կամ ջնջում: Դուք ցանկացած պահի կարող եք ջնջել ձեր հաշիվը
          կարգավորումներից:
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
            href={`${GEORGIAN_SITE_URL}/privacy`}
            hrefLang="ka-GE"
            className="text-[var(--vivida-cyan)] hover:underline"
          >
            vivida.ge/privacy
          </Link>{" "}
          էջում:
        </p>
      </section>
    </ArmenianGuide>
  );
}
