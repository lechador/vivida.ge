import type { Metadata } from "next";
import Link from "next/link";

import { ArmenianGuide } from "@/components/am/armenian-guide";
import { SIGNS } from "@/lib/zodiac";
import { DEFAULT_OG_IMAGE, ARMENIAN_SITE_URL, ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { articleLd, breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

const TITLE = "Ինչպե՞ս են աշխատում օրական հորոսկոպները — Vivida";
const DESCRIPTION =
  "Իմացեք, թե ինչպես են օրական, շաբաթական և ամսական հորոսկոպները հիմնվում մոլորակների ընթացիկ տարանցումների վրա, և կարդացեք Vivida-ի հայերեն կանխատեսումները կենդանակերպի բոլոր 12 նշանների համար:";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${ARMENIAN_SITE_URL}/horoscope`,
    languages: {
      en: `${ENGLISH_SITE_URL}/horoscope`,
      "hy-AM": `${ARMENIAN_SITE_URL}/horoscope`,
      hy: `${ARMENIAN_SITE_URL}/horoscope`,
      "x-default": `${ENGLISH_SITE_URL}/horoscope`,
    },
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/horoscope`,
    locale: "hy_AM",
  },
};

export default function ArmenianHoroscopePage() {
  const url = `${ARMENIAN_SITE_URL}/horoscope`;
  const ld = [
    articleLd({
      url,
      headline: "Ինչպե՞ս են աշխատում օրական հորոսկոպները",
      description: DESCRIPTION,
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: ARMENIAN_SITE_URL },
      { name: "Հորոսկոպ", url },
    ]),
    faqLd([
      {
        q: "Ո՞րն է տարբերությունը Արևի նշանի և անհատական հորոսկոպի միջև:",
        a: "Արևի նշանի հորոսկոպը գրվում է 12 նշաններից մեկի համար և նկարագրում է ընդհանուր կոլեկտիվ միտումները: Անհատական հորոսկոպը համեմատում է ընթացիկ տարանցումները ձեր ծննդյան քարտեզի ճշգրիտ աստիճանների, տների և ասպեկտների հետ:",
      },
      {
        q: "Որքա՞ն հաճախ են փոխվում հորոսկոպները:",
        a: "Օրական կանխատեսումները հետևում են Լուսնին և արագընթաց ասպեկտներին, շաբաթականները՝ Մերկուրիին, Վեներային և Մարսին, իսկ ամսականները՝ լուսնային փուլերին և ավելի դանդաղ ցիկլերին:",
      },
      {
        q: "Պե՞տք է արդյոք հորոսկոպը դիտարկել որպես անխուսափելի կանխատեսում:",
        a: "Ոչ: Օգտակար հորոսկոպն առաջարկում է հարցեր, համատեքստ և նոր հայացք, իսկ բոլոր որոշումները մնում են ընթերցողին:",
      },
    ]),
  ];

  return (
    <ArmenianGuide
      eyebrow="Երկինքն այժմ"
      title="Ինչպե՞ս են աշխատում հորոսկոպները"
      intro="Հորոսկոպը կապում է մոլորակների ընթացիկ շարժումները (տարանցումները) կենդանակերպի նշանի կամ ամբողջական նատալ քարտեզի հետ:"
      georgianPath="/horoskopi"
      englishPath="/horoscope"
      jsonLd={ld}
    >
      <section>
        <h2>Արևի նշաններ և անհատական հորոսկոպներ</h2>
        <p>
          Ընդհանուր հորոսկոպը սովորաբար գրվում է Արևի 12 նշանների համար: Այն կարող
          է նկարագրել ընդհանուր թեմաներ, բայց նույն նշանի տակ ծնված յուրաքանչյուր
          անձ ունի իր ուրույն քարտեզը: Անհատական հորոսկոպը համեմատում է ընթացիկ
          շարժումները ձեր ծննդյան կոնկրետ աստիճանների հետ:
        </p>
      </section>
      <section>
        <h2>Կանխատեսման տարբեր ժամանակահատվածներ</h2>
        <ul className="mt-4 list-disc">
          <li>
            <strong>Օրական կանխատեսումներ</strong>՝ ընդգծում են Լուսինը և արագ
            շարժվող ասպեկտները:
          </li>
          <li>
            <strong>Շաբաթական կանխատեսումներ</strong>՝ հետևում են Մերկուրիի,
            Վեներայի և Մարսի զարգացումներին:
          </li>
          <li>
            <strong>Ամսական կանխատեսումներ</strong>՝ ծածկում են լուսնային
            փուլերը և դանդաղ տրանսֆորմացիաները:
          </li>
        </ul>
      </section>
      <section>
        <h2>Կենդանակերպի 12 նշանները</h2>
        <p>
          Ընտրեք նշանը՝ դրա էներգիան և բնութագիրը բացահայտելու համար.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SIGNS.map((sign) => (
            <Link
              key={sign.key}
              href={`/am/zodiac`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 hover:border-[var(--vivida-violet)]/45 hover:bg-card"
            >
              <span className="text-2xl text-[var(--vivida-violet)]">
                {sign.symbol}
              </span>
              <span>
                <strong className="block text-sm text-foreground">
                  {sign.labelAm}
                </strong>
                <span className="text-xs text-muted-foreground">
                  Հայերեն ուղեցույց
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2>Գիտակցված մոտեցում կանխատեսումներին</h2>
        <p>
          Փնտրեք թեմաներ, որոնք կօգնեն ձեզ մտածել, պլանավորել կամ ավելի
          իմաստուն շփվել: Vivida-ի հորոսկոպները ստեղծված են ինքնաճանաչման և
          ոգեշնչման համար:
        </p>
      </section>
    </ArmenianGuide>
  );
}
