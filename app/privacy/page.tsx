import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { localizedAlternates } from "@/lib/seo/locales";

export const metadata = {
  title: "კონფიდენციალურობა",
  description:
    "Vivida-ს კონფიდენციალურობის პოლიტიკა — როგორ ვაგროვებთ და ვინახავთ თქვენს მონაცემებს.",
  alternates: localizedAlternates("/privacy", "/en/privacy", "ka"),
};

const LAST_UPDATED = "2026-08-07";

export default function PrivacyPage() {
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
          კონფიდენციალურობის პოლიტიკა
        </h1>
        <p className="text-sm text-muted-foreground">
          ბოლო განახლება: {LAST_UPDATED}
        </p>

        <article className="mt-10 space-y-8 text-foreground/85">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. ვინც ვართ
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida არის ვებ-აპლიკაცია (vivida.ge), რომელიც მომხმარებელს
              აწვდის პერსონალურ ასტროლოგიურ ინსტრუმენტებს — ნატალურ რუკას,
              ყოველდღიურ პროგნოზებს, თავსებადობის ანალიზს. ჩვენ ვართ თქვენი
              მონაცემების კონტროლერი.
            </p>
            <p className="mt-3 leading-relaxed">
              სერვისს ოპერირებს ინდივიდუალური მეწარმე, საიდენტიფიკაციო ნომერი{" "}
              <strong className="text-foreground">09001026676</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. რა მონაცემებს ვაგროვებთ
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida-ს გამოყენებისას ვაგროვებთ შემდეგ ინფორმაციას:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong className="text-foreground">ანგარიშის მონაცემები:</strong>{" "}
                Google-ის ანგარიშიდან — სახელი, ელფოსტა, პროფილის ფოტო. ეს
                მიგვაწვდის Google OAuth სერვისი.
              </li>
              <li>
                <strong className="text-foreground">დაბადების მონაცემები:</strong>{" "}
                თარიღი, დრო და ადგილი (კოორდინატები + დროის სარტყელი).
                ნატალური რუკის გამოსათვლელად აუცილებელია.
              </li>
              <li>
                <strong className="text-foreground">საჯარო პროფილი:</strong>{" "}
                username, ბიო, ფოტოები (თუ ატვირთავთ). ეს მონაცემები ხილულია
                სხვა მომხმარებლებისთვის თქვენი არჩევანის შესაბამისად.
              </li>
              <li>
                <strong className="text-foreground">აქტივობის მონაცემები:</strong>{" "}
                შეტყობინებები, მეგობრობის მოთხოვნები, შენიშვნები. სერვისის
                ფუნქციონირებისთვის აუცილებელია.
              </li>
              <li>
                <strong className="text-foreground">ტექნიკური მონაცემები:</strong>{" "}
                IP მისამართი, ბრაუზერის ტიპი, მოწყობილობის ინფორმაცია — სერვისის
                უსაფრთხოებისთვის და ხარვეზების დიაგნოსტიკისთვის.
              </li>
              <li>
                <strong className="text-foreground">გადახდის მონაცემები:</strong>{" "}
                შეძენილი კრედიტების პაკეტი, თანხა, ვალუტა და ტრანზაქციის
                იდენტიფიკატორი. საბანკო ბარათის სრული მონაცემები მუშავდება
                გადახდის მომწოდებლის მიერ და Vivida-ში არ ინახება.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. რატომ ვამუშავებთ მონაცემებს (ლეგიტიმური საფუძვლები)
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong className="text-foreground">ხელშეკრულების შესრულება:</strong>{" "}
                ნატალური რუკის გამოთვლა, AI ინტერპრეტაციის გენერაცია, საჯარო
                პროფილის ფუნქციონირება.
              </li>
              <li>
                <strong className="text-foreground">თქვენი თანხმობა:</strong>{" "}
                ფოტოების ატვირთვა, საჯარო პროფილის ჩართვა, შეტყობინებების
                მიღება.
              </li>
              <li>
                <strong className="text-foreground">ლეგიტიმური ინტერესი:</strong>{" "}
                სერვისის უსაფრთხოება, თაღლითობის პრევენცია, აპლიკაციის გაუმჯობესება.
              </li>
              <li>
                <strong className="text-foreground">სამართლებრივი ვალდებულება:</strong>{" "}
                ფინანსური ჩანაწერების შენახვა, რეგულატორების მოთხოვნებზე
                პასუხი.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. ვის ვუზიარებთ მონაცემებს
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida არ ყიდის თქვენს მონაცემებს. ვუზიარებთ მხოლოდ შემდეგ
              დამუშავებლებს, ფუნქციონირებისთვის აუცილებელ ფარგლებში:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong className="text-foreground">Google (OAuth):</strong> ავტორიზაცია.
              </li>
              <li>
                <strong className="text-foreground">Vercel:</strong> ვებ-აპლიკაციის
                ჰოსტინგი და მოთხოვნების ტექნიკური დამუშავება.
              </li>
              <li>
                <strong className="text-foreground">Neon (Postgres):</strong> ბაზის ჰოსტინგი
                (აშშ/EU სერვერები).
              </li>
              <li>
                <strong className="text-foreground">Cloudflare R2:</strong> ფოტოების შენახვა.
              </li>
              <li>
                <strong className="text-foreground">OpenRouter / Google Gemini:</strong>{" "}
                AI ინტერპრეტაციის გენერაცია (გადაიცემა მხოლოდ ნატალური
                რუკის ნუმერული მონაცემები — სახელი ან საკონტაქტო ინფორმაცია
                არა).
              </li>
              <li>
                <strong className="text-foreground">Stripe:</strong> კრედიტების
                ერთჯერადი შეძენის გადახდის დამუშავება. Vivida ბარათის სრულ
                მონაცემებს არ იღებს და არ ინახავს.
              </li>
              <li>
                <strong className="text-foreground">Resend:</strong> ანგარიშისა და
                სერვისის ტრანზაქციული ელფოსტების გაგზავნა.
              </li>
              <li>
                <strong className="text-foreground">Google Analytics და Meta:</strong>{" "}
                საიტის გამოყენებისა და სარეკლამო კამპანიების გაზომვა, როცა ეს
                ხელსაწყოები ჩართულია. მათ არ გადავცემთ სახელს, ელფოსტას ან
                დაბადების ზუსტ მონაცემებს.
              </li>
              <li>
                <strong className="text-foreground">Cloudflare Turnstile:</strong>{" "}
                ბოტებისა და ბოროტად გამოყენების პრევენცია.
              </li>
            </ul>
            <p className="mt-3 leading-relaxed">
              ნატალური რუკის გამოთვლა ხდება ჩვენს სერვერზე, ლოკალურად
              (Swiss Ephemeris-ის ფორმულებით) — დაბადების კოორდინატები და
              დრო არ გადაეცემა AI მომწოდებელს. AI ინტერპრეტაციის მოთხოვნაში
              გამოიყენება უკვე გამოთვლილი რუკის მონაცემები, არასაჭირო
              იდენტიფიკატორების გარეშე.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. რამდენ ხანს ვინახავთ
            </h2>
            <p className="mt-2 leading-relaxed">
              თქვენი მონაცემები ინახება მანამ, სანამ თქვენი ანგარიში აქტიურია.
              ანგარიშის წაშლის შემდეგ:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 leading-relaxed">
              <li>პროფილი, ფოტოები, შეტყობინებები — წაიშლება დაუყოვნებლივ</li>
              <li>დაბადების მონაცემები + ქეშირებული რუკები — წაიშლება 30 დღეში</li>
              <li>ფინანსური ჩანაწერები — შენარჩუნებულია სამართლებრივი ვალდებულების შესაბამისად (5–7 წელი)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. თქვენი უფლებები
            </h2>
            <p className="mt-2 leading-relaxed">
              GDPR და საქართველოს კანონმდებლობის შესაბამისად, თქვენ გაქვთ
              შემდეგი უფლებები:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 leading-relaxed">
              <li>წვდომა — მოითხოვეთ ჩვენთან არსებული ინფორმაცია თქვენ შესახებ</li>
              <li>გასწორება — გამოასწორეთ არასწორი მონაცემები ანგარიშის გვერდიდან</li>
              <li>წაშლა — მოითხოვეთ ანგარიშის და მონაცემების წაშლა</li>
              <li>პორტაბელურობა — მოითხოვეთ თქვენი მონაცემების ექსპორტი</li>
              <li>შეზღუდვა — შეზღუდეთ ცალკეული ფუნქციების მონაცემთა დამუშავება</li>
              <li>თანხმობის გაუქმება — ნებისმიერ დროს, მომავალზე გავლენით</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              ამ უფლებების გამოსაყენებლად მოგვწერეთ:{" "}
              <a
                href="mailto:hello@vivida.ge"
                className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
              >
                hello@vivida.ge
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. უსაფრთხოება
            </h2>
            <p className="mt-2 leading-relaxed">
              მონაცემები გადაიცემა TLS-ით (HTTPS) და ინახება დაშიფრულ ბაზებში.
              ვიყენებთ თანამედროვე მიდგომებს დაცვისთვის, თუმცა ვერც ერთი
              ვებ-სერვისი ვერ უზრუნველყოფს 100%-იან უსაფრთხოებას.
              საეჭვო აქტივობის შემთხვევაში გაცნობებთ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. ბავშვების კონფიდენციალურობა
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida არ არის განკუთვნილი 16 წელზე ნაკლები ასაკის
              მომხმარებლებისთვის. თუ აღმოვაჩენთ, რომ შევაგროვეთ ასეთი
              მომხმარებლის მონაცემები მშობლის თანხმობის გარეშე, წავშლით.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Cookies და ანალიტიკა
            </h2>
            <p className="mt-2 leading-relaxed">
              Vivida იყენებს ორი ტიპის cookie-ს:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong className="text-foreground">აუცილებელი:</strong>{" "}
                სესიის ავტორიზაცია, უსაფრთხოება, Cloudflare Turnstile-ის
                ბოტ-პრევენცია. ამ cookie-ების გარეშე საიტი ვერ
                იფუნქციონირებს.
              </li>
              <li>
                <strong className="text-foreground">ანალიტიკური:</strong>{" "}
                Google Analytics 4 — ვაგროვებთ ანონიმიზებულ მონაცემებს
                (გვერდის ნახვები, დაწკაპუნებები, მოწყობილობის ტიპი),
                რომელიც გვეხმარება სერვისის გაუმჯობესებაში. პერსონალური
                იდენტიფიკატორები (სახელი, ელფოსტა) GA-ში არ გადაიცემა.
              </li>
            </ul>
            <p className="mt-3 leading-relaxed">
              ანალიტიკის გათიშვა შეგიძლია ბრაუზერის Do Not Track-ით ან{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
              >
                Google-ის ოფიციალური Opt-Out დანამატით
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. საერთაშორისო გადაცემები
            </h2>
            <p className="mt-2 leading-relaxed">
              ჩვენი ზოგიერთი დამუშავებელი (მათ შორის Google, Vercel,
              Cloudflare, Neon, OpenRouter, Stripe და Resend) ოპერირებს
              საქართველოს გარეთ. გადაცემები ხდება სტანდარტული საკონტრაქტო
              პუნქტების ან მსგავსი დაცვის მექანიზმების საფუძველზე.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              11. ცვლილებები
            </h2>
            <p className="mt-2 leading-relaxed">
              ამ პოლიტიკის არსებითი ცვლილებების შემთხვევაში გაცნობებთ
              ელფოსტით ან აპლიკაციაში. გამოყენების გაგრძელება ცვლილებების
              შემდეგ ნიშნავს მათ მიღებას.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              12. კონტაქტი
            </h2>
            <p className="mt-2 leading-relaxed">
              კონფიდენციალურობასთან დაკავშირებით:{" "}
              <a
                href="mailto:hello@vivida.ge"
                className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
              >
                hello@vivida.ge
              </a>
              .
            </p>
            <p className="mt-3 leading-relaxed">
              უფლებების შეზღუდვის შემთხვევაში შეგიძლიათ წარუდგინოთ საჩივარი
              შესაბამის სამეთვალყურეო ორგანოს.
            </p>
          </section>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
