import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

import { ArmenianGuide } from "@/components/am/armenian-guide";
import { DEFAULT_OG_IMAGE, ARMENIAN_SITE_URL } from "@/lib/seo/locales";
import { breadcrumbLd } from "@/lib/seo/jsonld";

const TITLE = "Vivida-ի մասին";
const DESCRIPTION =
  "Իմացեք, թե ինչ է Vivida-ն, ինչպես են ստեղծվում աստղաբանական և ինքնաճանաչման նյութերը, և ինչպես կապ հաստատել մեր թիմի հետ:";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Աստղաբանություն և ինքնաճանաչում` },
  description: DESCRIPTION,
  alternates: {
    canonical: `${ARMENIAN_SITE_URL}/about`,
    languages: {
      hy: `${ARMENIAN_SITE_URL}/about`,
      "x-default": `${ARMENIAN_SITE_URL}/about`,
    },
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/about`,
    locale: "hy_AM",
  },
};

export default function ArmenianAboutPage() {
  const url = `${ARMENIAN_SITE_URL}/about`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: TITLE,
      description: DESCRIPTION,
      url,
      inLanguage: "hy",
      mainEntity: {
        "@type": "Organization",
        name: "Vivida",
        url: ARMENIAN_SITE_URL,
        email: "hello@vivida.ge",
        address: { "@type": "PostalAddress", addressCountry: "GE" },
        sameAs: ["https://www.vivida.ge"],
      },
    },
    breadcrumbLd([
      { name: "Գլխավոր", url: ARMENIAN_SITE_URL },
      { name: "Մեր մասին", url },
    ]),
  ];

  return (
    <ArmenianGuide
      eyebrow="Մեր մասին"
      title="Vivida-ն հեշտացնում է բարդ քարտեզների բացահայտումը"
      intro="Vivida-ն աստղաբանական և ինքնաճանաչման հարթակ է, որը միավորում է նատալ քարտեզի հաշվարկները, կրթական ուղեցույցները և ինքնավերլուծության գործիքները մեկ վայրում:"
      georgianPath="/"
      englishPath="/about"
      jsonLd={ld}
    >
      <section>
        <h2>Ի՞նչ ենք մենք ստեղծում</h2>
        <p>
          Մեր հանրային ուղեցույցները բացատրում են նատալ քարտեզների, կենդանակերպի
          նշանների, մոլորակային ցիկլերի և հարաբերությունների համատեղելիության
          հիմնական կառուցվածքը: Հայերեն բաժինը ներառում է ամբողջական նավիգացիա,
          ուղեցույցներ, թեստեր, անձնական աստղաբանական մեկնաբանություններ և
          հորոսկոպներ:
        </p>
      </section>
      <section>
        <h2>Ինչպե՞ս օգտագործել մեր նյութերը</h2>
        <p>
          Vivida-ի աստղաբանական բովանդակությունը նախատեսված է ինքնաճանաչման,
          մշակութային հետաքրքրության և ոգեշնչման համար: Այն չի հանդիսանում
          բժշկական, հոգեբանական, ֆինանսական կամ իրավական խորհրդատվություն:
        </p>
        <p>
          Անհատականության և ճանաչողական թեստերը նույնպես կրթական գործիքներ են և
          չեն փոխարինում կլինիկական գնահատականներին:
        </p>
      </section>
      <section>
        <h2>Թափանցիկություն և կապ</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <MapPin className="size-5 text-[var(--vivida-violet)]" />
            <h3 className="mt-3">Գտնվելու վայրը</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Vivida-ն ղեկավարվում է Վրաստանից և ծառայում է բազմալեզու լսարանին:
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <ShieldCheck className="size-5 text-[var(--vivida-violet)]" />
            <h3 className="mt-3">Գաղտնիության տվյալներ</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Կարդացեք մեր{" "}
              <Link
                href="/am/privacy"
                className="text-[var(--vivida-cyan)] hover:underline"
              >
                գաղտնիության քաղաքականությունը
              </Link>
              :
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <Mail className="size-5 text-[var(--vivida-violet)]" />
            <h3 className="mt-3">Հետադարձ կապ</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Հարցերի դեպքում գրեք մեզ՝{" "}
              <a
                href="mailto:hello@vivida.ge"
                className="text-[var(--vivida-cyan)] hover:underline"
              >
                hello@vivida.ge
              </a>
              :
            </p>
          </div>
        </div>
      </section>
    </ArmenianGuide>
  );
}
