import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/nav/app-header";
import { RelationshipInviteAccept } from "@/components/synastry/relationship-invite-accept";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getRelationshipInvitePreview } from "@/lib/relationship-core";

export const metadata: Metadata = { title: "Relationship invitation", robots: { index: false } };

export default async function RelationshipInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  await requireUser(`/relationship/invite/${token}`);
  const preview = await getRelationshipInvitePreview(token);

  return (
    <main lang={locale} className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_0%,oklch(0.32_0.18_350/0.5),transparent_70%),radial-gradient(40%_30%_at_80%_70%,oklch(0.28_0.13_220/0.35),transparent_70%)]" />
      <AppHeader authed active="synastry" />
      <section className="mx-auto grid w-full max-w-xl flex-1 place-items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-[var(--vivida-violet)]/30 bg-card/75 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-9">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--vivida-violet)]/25 to-[var(--vivida-pink)]/25 text-[var(--vivida-pink)] ring-1 ring-foreground/10">
            <HeartHandshake className="size-7" aria-hidden />
          </div>
          {preview ? (
            <>
              <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {en ? `${preview.ownerName} invited you` : `${preview.ownerName} გიწვევს`}
              </h1>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
                {en
                  ? `Join the private compatibility space for ${preview.partnerName}. The reading is already unlocked, so accepting costs no credits.`
                  : `${preview.partnerName}-თან პირად თავსებადობის სივრცეში გაწევრიანდი. შედეგი უკვე გახსნილია და მიღება კრედიტებს არ დაგაკლებს.`}
              </p>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden />
                {en ? "Only the two participants can see shared answers" : "საერთო პასუხებს მხოლოდ ორი მონაწილე ხედავს"}
              </div>
              <RelationshipInviteAccept token={token} locale={locale} />
            </>
          ) : (
            <>
              <h1 className="mt-5 text-2xl font-semibold">{en ? "This invitation is no longer active" : "ეს მოწვევა აღარ არის აქტიური"}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{en ? "It may have expired or already been accepted." : "შესაძლოა ვადა გაუვიდა ან უკვე მიღებულია."}</p>
              <Button asChild variant="outline" className="mt-6"><Link href="/synastry">{en ? "Go to compatibility" : "თავსებადობაზე გადასვლა"}</Link></Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
