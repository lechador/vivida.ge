import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy — ჯაშუში · Party Games" },
  description:
    "Privacy policy for ჯაშუში · Party Games by CoreShift Apps. The app collects no personal data, works fully offline, and uses no analytics or tracking.",
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "28 June 2026";

export default function JashushiPrivacyPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.28_0.14_300/0.4),transparent_70%)]"
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Legal
        </div>
        <h1 className="mb-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy — ჯაშუში · Party Games
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-[7rem_1fr]">
          <dt className="font-medium text-foreground/70">Effective date</dt>
          <dd>{EFFECTIVE_DATE}</dd>
          <dt className="font-medium text-foreground/70">App</dt>
          <dd>ჯაშუში · Party Games</dd>
          <dt className="font-medium text-foreground/70">Developer</dt>
          <dd>CoreShift Apps</dd>
          <dt className="font-medium text-foreground/70">Contact</dt>
          <dd>
            <a
              href="mailto:givi@coreshiftapps.com"
              className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
            >
              givi@coreshiftapps.com
            </a>
          </dd>
        </dl>

        {/* English */}
        <article className="mt-12 text-foreground/85">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            English
          </h2>
          <p className="mt-4 leading-relaxed">
            ჯაშუში · Party Games (&quot;the app&quot;) is designed to respect
            your privacy completely.
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed">
            <li>
              <strong className="text-foreground">
                We do not collect any personal data.
              </strong>{" "}
              The app has no user accounts and no sign-in.
            </li>
            <li>
              <strong className="text-foreground">
                We do not transmit any data.
              </strong>{" "}
              The app works fully offline; it does not connect to any server or
              backend.
            </li>
            <li>
              <strong className="text-foreground">Local storage only.</strong>{" "}
              Your settings (player names, number of players, categories, timer)
              are saved only on your own device and never leave it. You can clear
              them at any time by clearing the app&apos;s data or uninstalling
              the app.
            </li>
            <li>
              <strong className="text-foreground">
                No analytics, no advertising, no tracking, no third-party SDKs.
              </strong>
            </li>
            <li>
              <strong className="text-foreground">Children&apos;s privacy.</strong>{" "}
              The app does not knowingly collect any information from anyone,
              including children.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed">
            If we ever change this policy, we will update this page and the
            &quot;Effective date&quot; above.
          </p>
          <p className="mt-3 leading-relaxed">
            If you have any questions about this privacy policy, contact us at{" "}
            <a
              href="mailto:givi@coreshiftapps.com"
              className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
            >
              givi@coreshiftapps.com
            </a>
            .
          </p>
        </article>

        <hr className="my-12 border-border" />

        {/* ქართული */}
        <article className="text-foreground/85">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            ქართული
          </h2>
          <p className="mt-4 leading-relaxed">
            ჯაშუში · Party Games (&quot;აპლიკაცია&quot;) სრულად იცავს თქვენს
            კონფიდენციალურობას.
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed">
            <li>
              <strong className="text-foreground">
                ჩვენ არ ვაგროვებთ პერსონალურ მონაცემებს.
              </strong>{" "}
              აპლიკაციას არ აქვს ანგარიში და არ საჭიროებს ავტორიზაციას.
            </li>
            <li>
              <strong className="text-foreground">
                ჩვენ არ ვაგზავნით არანაირ მონაცემს.
              </strong>{" "}
              აპლიკაცია მუშაობს სრულად ოფლაინ რეჟიმში და არ უკავშირდება არცერთ
              სერვერს.
            </li>
            <li>
              <strong className="text-foreground">მხოლოდ ლოკალური შენახვა.</strong>{" "}
              თქვენი პარამეტრები (მოთამაშეების სახელები, რაოდენობა, კატეგორიები,
              დრო) ინახება მხოლოდ თქვენს მოწყობილობაზე და არასდროს ტოვებს მას.
              შეგიძლიათ წაშალოთ ნებისმიერ დროს აპლიკაციის მონაცემების
              გასუფთავებით ან აპლიკაციის წაშლით.
            </li>
            <li>
              <strong className="text-foreground">
                არანაირი ანალიტიკა, რეკლამა, თვალთვალი ან მესამე მხარის SDK.
              </strong>
            </li>
            <li>
              <strong className="text-foreground">
                ბავშვების კონფიდენციალურობა.
              </strong>{" "}
              აპლიკაცია არ აგროვებს არანაირ ინფორმაციას არავისგან, მათ შორის
              ბავშვებისგან.
            </li>
          </ul>
          <p className="mt-4 leading-relaxed">
            თუ ამ პოლიტიკას შევცვლით, განვაახლებთ ამ გვერდს და ზემოთ მითითებულ
            თარიღს.
          </p>
          <p className="mt-3 leading-relaxed">
            შეკითხვების შემთხვევაში დაგვიკავშირდით:{" "}
            <a
              href="mailto:givi@coreshiftapps.com"
              className="text-[var(--vivida-violet)] underline-offset-2 hover:underline"
            >
              givi@coreshiftapps.com
            </a>
            .
          </p>
        </article>
      </section>
    </main>
  );
}
