import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

import type { EqResult } from "@/lib/eq/scoring";
import { recommendedEqArticles } from "@/lib/seo/eq-articles";

export function EqArticleRecommendations({ result }: { result: EqResult }) {
  const articles = recommendedEqArticles(result.domains);
  const needsGrowth = result.domains.some((domain) => domain.score < 62);

  return (
    <section className="rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/12 text-[var(--vivida-violet)]">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {needsGrowth ? "შენთვის შერჩეული განვითარების გეგმა" : "შეინარჩუნე და გააღრმავე შენი ძლიერი EQ"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-foreground/70">
            რეკომენდაციები ავტომატურად შეირჩა შენი ყველაზე დაბალი სფეროების მიხედვით.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/emociuri-inteleqti/${article.slug}`}
            className="group rounded-2xl border border-border bg-background/25 p-4 transition hover:border-[var(--vivida-violet)]/45"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground">
              <BookOpen className="size-3.5" /> {article.category}
            </span>
            <span className="mt-2 block font-semibold leading-snug">{article.title}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-cyan)]">
              წაიკითხე <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
      <Link href="/emociuri-inteleqti" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/75 hover:text-foreground">
        ყველა EQ სტატია <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
