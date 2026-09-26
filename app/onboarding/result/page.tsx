import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ensureChartFor } from "@/actions/chart";
import {
  AhaResult,
  type AhaPlacement,
} from "@/components/onboarding/aha-result";
import { VividaMark } from "@/components/brand/vivida-mark";
import { Starfield } from "@/components/landing/starfield";
import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { buildEnglishChartInterpretation } from "@/lib/report-content-en";
import { BODIES, signByIndex } from "@/lib/zodiac";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "en" ? "Your Big Three" : "შენი დიდი სამეული",
  };
}

function safeNext(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/report";
}

function firstSentence(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const sentence = value.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? value;
  return sentence.length > 220
    ? `${sentence.slice(0, 217).trimEnd()}…`
    : sentence;
}

export default async function OnboardingResultPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  const [{ next }, locale, chart] = await Promise.all([
    searchParams,
    getUserLocale(user.id),
    ensureChartFor(user.id, { aiUpgrade: "defer" }),
  ]);

  if (!chart) redirect("/onboarding");

  // Persisted/shared interpretations are Georgian. Match the established
  // /report behavior and build the translated English fallback for every
  // non-Georgian interface until a dedicated Armenian library is available.
  const interpretation =
    locale === "ka"
      ? chart.interpretation
      : buildEnglishChartInterpretation(chart.data);
  const kinds = ["sun", "moon", "ascendant"] as const;
  const placements: AhaPlacement[] = kinds.flatMap((kind) => {
    const point =
      kind === "ascendant" ? chart.data.ascendant : chart.data.bodies[kind];
    if (!point) return [];
    const body = BODIES[kind];
    const sign = signByIndex(point.signIndex);
    return [
      {
        kind,
        label: locale === "en" ? body.labelEn : body.labelKa,
        glyph: body.symbol,
        sign: locale === "en" ? sign.labelEn : sign.labelKa,
        signSymbol: sign.symbol,
        meaning: locale === "en" ? body.meaningEn : body.meaningKa,
        interpretation: firstSentence(interpretation?.bigThree?.[kind]),
      },
    ];
  });

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-dvh flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.14_220/0.38),transparent_70%),radial-gradient(35%_25%_at_12%_78%,oklch(0.32_0.16_350/0.35),transparent_70%)]"
      />
      <Starfield count={130} shooting={2} />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="flex items-center gap-2">
          <VividaMark size={40} id="onboarding-result" />
          <span className="bg-[linear-gradient(135deg,#a78bfa_0%,#f472b6_55%,#22d3ee_100%)] bg-clip-text text-lg font-semibold tracking-tight text-transparent">
            vivida
          </span>
        </Link>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6">
        <AhaResult
          firstName={user.name?.split(" ")[0] ?? null}
          placements={placements}
          next={safeNext(next)}
          locale={locale}
        />
        <Link
          href="/account#profile-photos"
          className="mt-8 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {locale === "en"
            ? "Add a profile photo later in Account"
            : "პროფილის ფოტო მოგვიანებით დაამატე ანგარიშში"}
        </Link>
      </section>
    </main>
  );
}
