import { EnglishShell } from "@/components/en/english-shell";
import { serializeLd, type JsonLd } from "@/lib/seo/jsonld";

export function EnglishGuide({
  eyebrow,
  title,
  intro,
  georgianPath,
  jsonLd,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  georgianPath: string;
  /**
   * Structured data for this guide. The Georgian counterparts of these pages
   * have shipped JSON-LD for a while; the English core pages had none, so
   * they were the only part of the site Google had to read unaided.
   */
  jsonLd?: JsonLd | JsonLd[];
  children: React.ReactNode;
}) {
  return (
    <EnglishShell georgianPath={georgianPath}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeLd(jsonLd) }}
        />
      )}
      <article className="mx-auto w-full max-w-4xl px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-20">
        <header className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--vivida-cyan)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-foreground/80 sm:text-xl">
            {intro}
          </p>
        </header>
        <div className="mt-12 space-y-10 text-base leading-relaxed text-foreground/85 sm:text-lg [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground sm:[&_h2]:text-3xl [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p+p]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-[var(--vivida-violet)]">
          {children}
        </div>
      </article>
    </EnglishShell>
  );
}
