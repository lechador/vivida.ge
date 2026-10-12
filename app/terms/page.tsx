import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { localizedAlternates } from "@/lib/seo/locales";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

import { LEGAL_ENTITY } from "@/lib/legal-entity";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return {
    title: en ? "Terms and Conditions" : "წესები და პირობები",
    description: en
      ? "Terms and Conditions governing your use of Vivida."
      : "Vivida-ს გამოყენების წესები და პირობები, სამომხმარებლო ხელშეკრულება.",
    alternates: localizedAlternates("/terms", "/en/terms", locale),
  };
}

const LAST_UPDATED = "2026-10-11";

export default async function TermsPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.28_0.14_300/0.4),transparent_70%)]"
      />

      <SmartHeader />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          სამართლებრივი
        </div>
        <h1 className="mb-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          წესები და პირობები
        </h1>
        <p className="text-sm text-muted-foreground">
          ბოლო განახლება: {LAST_UPDATED}
        </p>

        <article className="mt-10 space-y-8 text-foreground/85">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. ხელშეკრულების მიღება
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს ვებ-აპლიკაციის (vivida.ge ან vividaastro.com) გამოყენებით
              თქვენ ეთანხმებით წინამდებარე წესებსა და პირობებს. თუ არ
              ეთანხმებით, გთხოვთ არ ისარგებლოთ სერვისით.
            </p>
            <p className="mt-3 leading-relaxed">
              სერვისს ოპერირებს{" "}
              <strong className="text-foreground">{LEGAL_ENTITY.name}</strong>,
              ვაიომინგის შტატში (აშშ) რეგისტრირებული კომპანია, სარეგისტრაციო
              ნომერი {LEGAL_ENTITY.filingId}. იურიდიული მისამართი:{" "}
              {LEGAL_ENTITY.addressKa}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. ვინ შეიძლება გამოიყენოს Vivida
            </h2>
            <p className="mt-2 leading-relaxed">
              სერვისი განკუთვნილია 16 წლის ან უფროსი ასაკის მომხმარებლებისთვის.
              თუ 16 წლამდე ხარ, საჭიროა მშობლის ან კანონიერი წარმომადგენლის
              თანხმობა, ამისთვის მოგვწერე hello@vivida.ge-ზე, რადგან რეგისტრაცია
              16 წლამდე ასაკს ტექნიკურად არ უშვებს. 18 წლამდე მომხმარებლის
              ნებისმიერ ფასიან შეძენას სჭირდება მშობლის ან კანონიერი
              წარმომადგენლის თანხმობა. რეგისტრაციით თქვენ ადასტურებთ, რომ ეს
              მოთხოვნები შესრულებულია.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. ანგარიშის შექმნა
            </h2>
            <p className="mt-2 leading-relaxed">
              ანგარიში შეგიძლია შექმნა Google-ის ანგარიშით ან ელფოსტითა და
              პაროლით. პასუხისმგებელი ხარ ავტორიზაციის მონაცემების
              უსაფრთხოებაზე. Google-ით შესვლისას შენს Google-ის პაროლს არ
              ვიღებთ; ელფოსტით რეგისტრაციისას პაროლი ინახება მხოლოდ უსაფრთხო,
              ჰეშირებული ფორმით. ანგარიშის უნებართვო გამოყენებისას გვაცნობე
              დაუყოვნებლივ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. უფასო ფუნქციები, კრედიტები და გადახდა
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida გთავაზობს უფასო ფუნქციებს, ერთჯერად კრედიტების პაკეტებსა და
              ქვეყნის მიხედვით განსაზღვრულ Vivida PRO გეგმებს. PRO ავტომატურად
              განახლებადი გამოწერაა, სანამ არ გააუქმებ; ფასი, გადახდის
              პერიოდულობა, წვდომა და განახლების თარიღი ნაჩვენებია შეძენამდე და
              გამოწერის გვერდზე. ინგლისურ საიტზე (vividaastro.com) გადახდა ხდება
              USDC-ით Solana-ში, PRO კი იყიდება ერთჯერადი 30-დღიანი პასის სახით
              და ავტომატურად არ განახლდება.
            </p>
            <p className="mt-3 leading-relaxed">
              მოქმედების ღირებულება კრედიტებში და კრედიტების პაკეტის ფასი
              ნაჩვენებია დადასტურებამდე. უფასო ლიმიტები, ბონუსები, კრედიტების
              ღირებულება და ხელმისაწვდომი ფუნქციები შეიძლება შეიცვალოს; არსებითი
              ცვლილების შესახებ წინასწარ გაცნობებთ. გადახდებთან და
              ანაზღაურებასთან დაკავშირებული სავალდებულო უფლებები რეგულირდება
              მოქმედი კანონმდებლობით.
            </p>
            <p className="mt-3 leading-relaxed">
              <strong className="text-foreground">
                გაუქმება და ანაზღაურება.
              </strong>{" "}
              თუ მომხმარებელი ხარ გაერთიანებულ სამეფოში ან ევროკავშირში,
              დისტანციურ ხელშეკრულებაზე უარის თქმის 14-დღიანი ვადა გაქვს.
              კრედიტები და PRO წვდომა ციფრული პროდუქტია, რომლის მიწოდებასაც
              გადახდისთანავე ვიწყებთ, შეკვეთის დასრულებით ითხოვ მიწოდების
              დაუყოვნებლივ დაწყებას და ეთანხმები, რომ უკვე მიწოდებულ ნაწილზე
              14-დღიანი უარის თქმის უფლება აღარ ვრცელდება. PRO-ს გამოუყენებელი
              პერიოდი ნებისმიერ დროს შეგიძლია გააუქმო ანგარიშის გვერდიდან.
              გაუქმება აჩერებს შემდეგ გადახდას; მიმდინარე გადახდილი პერიოდის
              თანხა არ ბრუნდება, ხოლო PRO წვდომა პერიოდის ბოლომდე შენარჩუნდება.
              ერთჯერადი პასი უბრალოდ ამოიწურება ვადის ბოლოს და გაუქმებას არ
              საჭიროებს; კრიპტო-გადახდა საბოლოოა ტრანზაქციის დადასტურების
              შემდეგ. ეს პუნქტი არ ზღუდავს სავალდებულო სამომხმარებლო უფლებებს,
              მათ შორის როცა პროდუქტი ხარვეზიანია, აღწერას არ შეესაბამება ან
              საერთოდ არ მოგეწოდა.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. მომხმარებლის შინაარსი
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ში თქვენ შეგიძლიათ ატვირთოთ ფოტოები, შეიყვანოთ ბიო და
              დააყენოთ საჯარო პროფილი. ამ შინაარსზე უფლებები რჩება თქვენთან.
              ატვირთვით თქვენ ანიჭებთ Vivida-ს არაექსკლუზიურ, ჰონორარის გარეშე
              ლიცენზიას, შეინახოს და აჩვენოს ეს შინაარსი მხოლოდ სერვისის
              ფუნქციონირებისთვის.
            </p>
            <p className="mt-3 leading-relaxed">აკრძალულია:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 leading-relaxed">
              <li>სხვისი ფოტოს ატვირთვა მათი თანხმობის გარეშე</li>
              <li>შეურაცხმყოფელი, ძალადობრივი ან უკანონო შინაარსი</li>
              <li>სხვისი იდენტობით სარგებლობა</li>
              <li>სპამი, ფიშინგი ან მავნე ლინკები</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. ასტროლოგიური შინაარსი, გართობისთვის
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს ასტროლოგიური ინტერპრეტაციები განკუთვნილია გართობისა და
              თვითშემეცნების მიზნებისთვის. ისინი{" "}
              <strong className="text-foreground">
                არ წარმოადგენს სამედიცინო, ფსიქოლოგიურ, ფინანსურ ან იურიდიულ
                რჩევას.
              </strong>{" "}
              მნიშვნელოვანი გადაწყვეტილებები მიიღეთ კვალიფიციური სპეციალისტების
              კონსულტაციით.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. ინტელექტუალური საკუთრება
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს ბრენდი, ლოგო, დიზაინი, კოდი და AI ინტერპრეტაციების
              ალგორითმები არის Vivida-ს საკუთრება. მათი კოპირება, რეპროდუქცია ან
              კომერციული გამოყენება ნებართვის გარეშე აკრძალულია.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. პერსონალური მონაცემები
            </h2>
            <p className="mt-2 leading-relaxed">
              ჩვენი მონაცემთა დამუშავების პრაქტიკა აღწერილია ცალკე{" "}
              <a
                href="/privacy"
                className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
              >
                კონფიდენციალურობის პოლიტიკაში
              </a>
              . ის წინამდებარე წესების ნაწილია.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. სერვისის შეწყვეტა
            </h2>
            <p className="mt-2 leading-relaxed">
              ანგარიშის წაშლა შეგიძლიათ ნებისმიერ დროს ანგარიშის გვერდიდან.
              წინამდებარე პირობების დარღვევის შემთხვევაში Vivida-ს უფლება აქვს
              შეაჩეროს ან წაშალოს თქვენი ანგარიში გაფრთხილებით ან მის გარეშე.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. პასუხისმგებლობის შეზღუდვა
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida მიეწოდება „როგორც არის“ პრინციპით. კანონის მიერ ნებადართულ
              ფარგლებში Vivida არ აგებს პასუხს არაპირდაპირ, შემთხვევით ან
              შედეგობრივ ზიანზე, რომელიც დაკავშირებულია სერვისის გამოყენებასთან.
              ეს არ ზღუდავს იმ პასუხისმგებლობას, რომელიც კანონით არ შეიძლება
              გამოირიცხოს.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              11. ცვლილებები
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს უფლება აქვს განაახლოს წინამდებარე წესები. არსებითი
              ცვლილების შემთხვევაში გაცნობებთ ელფოსტით ან აპლიკაციაში.
              გამოყენების გაგრძელება ცვლილებების შემდეგ ნიშნავს მათ მიღებას.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              12. მოქმედი კანონი
            </h2>
            <p className="mt-2 leading-relaxed">
              წინამდებარე ხელშეკრულება რეგულირდება საქართველოს კანონმდებლობით.
              დავები განიხილება საქართველოს სასამართლოებში, თუ სავალდებულო
              სამომხმარებლო სამართალი სხვაგვარად არ ითვალისწინებს.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              13. კონტაქტი
            </h2>
            <p className="mt-2 leading-relaxed">
              შეკითხვები წინამდებარე წესებთან დაკავშირებით მოგვწერეთ:{" "}
              <a
                href="mailto:hello@vivida.ge"
                className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
              >
                hello@vivida.ge
              </a>
              .
            </p>
          </section>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
