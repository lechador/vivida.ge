import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";

export const metadata = {
  title: "წესები და პირობები",
  description:
    "Vivida-ს გამოყენების წესები და პირობები — სამომხმარებლო ხელშეკრულება.",
};

const LAST_UPDATED = "2026-05-04";

export default function TermsPage() {
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
              Vivida-ს ვებ-აპლიკაციის (vivida.ge) გამოყენებით თქვენ
              ეთანხმებით წინამდებარე წესებსა და პირობებს. თუ არ ეთანხმებით,
              გთხოვთ არ ისარგებლოთ სერვისით.
            </p>
            <p className="mt-3 leading-relaxed">
              სერვისს ოპერირებს ინდივიდუალური მეწარმე, საიდენტიფიკაციო ნომერი{" "}
              <strong className="text-foreground">09001026676</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. ვინ შეიძლება გამოიყენოს Vivida
            </h2>
            <p className="mt-2 leading-relaxed">
              სერვისი განკუთვნილია 16 წლის ან უფროსი ასაკის მომხმარებლებისთვის.
              თუ თქვენი ასაკი არ აღემატება 16-ს, მშობლის ან კანონიერი
              წარმომადგენლის თანხმობა სავალდებულოა. რეგისტრაციით თქვენ
              ადასტურებთ, რომ ეს მოთხოვნები შესრულებულია.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. ანგარიშის შექმნა
            </h2>
            <p className="mt-2 leading-relaxed">
              ანგარიში იქმნება Google-ის ანგარიშის მეშვეობით. პასუხისმგებელი
              ხართ თქვენი Google ანგარიშის უსაფრთხოებაზე — ჩვენ პაროლს არ
              ვინახავთ. ანგარიშის უნებართვო გამოყენებისას გვაცნობეთ
              დაუყოვნებლივ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. სერვისის ხელმისაწვდომობა
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს ფუნქციები ამჟამად სრულად უფასოა — ნატალური რუკა, AI
              ინტერპრეტაცია, ყოველდღიური პროგნოზი, თავსებადობა და სხვა.
              ფასიანი ფუნქციების დამატებამდე გაცნობებთ წინასწარ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. მომხმარებლის შინაარსი
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ში თქვენ შეგიძლიათ ატვირთოთ ფოტოები, შეიყვანოთ ბიო და
              დააყენოთ საჯარო პროფილი. ამ შინაარსზე უფლებები რჩება თქვენთან.
              ატვირთვით თქვენ ანიჭებთ Vivida-ს არააქცენტიური, ლიცენზიის
              შესახებ გადასახდელის გარეშე უფლებას, აჩვენოს ეს შინაარსი
              სერვისის ფარგლებში.
            </p>
            <p className="mt-3 leading-relaxed">
              აკრძალულია:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 leading-relaxed">
              <li>სხვისი ფოტოს ატვირთვა მათი თანხმობის გარეშე</li>
              <li>შეურაცხმყოფელი, ძალადობრივი ან უკანონო შინაარსი</li>
              <li>სხვისი იდენტობით სარგებლობა</li>
              <li>სპამი, ფიშინგი ან მავნე ლინკები</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. ასტროლოგიური შინაარსი — გართობისთვის
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს ასტროლოგიური ინტერპრეტაციები განკუთვნილია გართობისა და
              თვითშემეცნების მიზნებისთვის. ისინი{" "}
              <strong className="text-foreground">
                არ წარმოადგენს სამედიცინო, ფსიქოლოგიურ, ფინანსურ ან
                იურიდიულ რჩევას.
              </strong>{" "}
              მნიშვნელოვანი გადაწყვეტილებები მიიღეთ კვალიფიციური
              სპეციალისტების კონსულტაციით.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. ინტელექტუალური საკუთრება
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს ბრენდი, ლოგო, დიზაინი, კოდი და AI ინტერპრეტაციების
              ალგორითმები არის Vivida-ს საკუთრება. მათი კოპირება, რეპროდუქცია
              ან კომერციული გამოყენება ნებართვის გარეშე აკრძალულია.
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
              შედეგობრივ ზიანზე, რომელიც დაკავშირებულია სერვისის
              გამოყენებასთან. ეს არ ზღუდავს იმ პასუხისმგებლობას, რომელიც
              კანონით არ შეიძლება გამოირიცხოს.
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
              დავები განიხილება საქართველოს სასამართლოებში.
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
