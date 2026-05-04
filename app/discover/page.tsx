import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { DiscoverCard } from "@/components/discover/discover-card";
import { SpotlightCard } from "@/components/discover/spotlight-card";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import {
  ELEMENT_GLYPH,
  getDiscoveryFeed,
  type DiscoverCard as DiscoverCardType,
  type Element,
} from "@/lib/discover";

export const metadata = { title: "აღმოაჩინე" };

const ELEMENT_LABEL_KA: Record<Element, string> = {
  ცეცხლი: "ცეცხლი",
  მიწა: "მიწა",
  ჰაერი: "ჰაერი",
  წყალი: "წყალი",
};

const COMPLEMENTARY: Record<Element, Element> = {
  ცეცხლი: "ჰაერი",
  ჰაერი: "ცეცხლი",
  მიწა: "წყალი",
  წყალი: "მიწა",
};

export default async function DiscoverPage() {
  const user = await requireUser();
  const [plan, feed] = await Promise.all([
    getCurrentPlan(user.id),
    getDiscoveryFeed(user.id),
  ]);

  const isEmpty =
    !feed.spotlight &&
    feed.tribe.length === 0 &&
    feed.magic.length === 0 &&
    feed.other.length === 0;

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.30_0.15_220/0.4),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.34_0.16_350/0.35),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />

      <AppHeader authed plan={plan} active="discover" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          აღმოაჩინე
        </div>
        <h1 className="mb-3 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          ვარსკვლავები, რომლებიც{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            შენთან რეზონირებენ
          </span>
        </h1>
        {feed.viewerElement && (
          <p className="text-pretty text-muted-foreground">
            შენი მზე {ELEMENT_LABEL_KA[feed.viewerElement]}-ის
            ტერიტორიაზეა. ქვემოთ — ვინც იმავე ენაზე გელაპარაკება, ვინც შენთვის
            მაგია იქნება, და ვინც შენი სამყაროს კიდიდან მოდის.
          </p>
        )}

        {isEmpty && <EmptyState hasElement={!!feed.viewerElement} />}

        {/* Top match — daily spotlight */}
        {feed.spotlight && <SpotlightCard match={feed.spotlight} />}

        {/* Tribe */}
        {feed.tribe.length > 0 && feed.viewerElement && (
          <Section
            number="01"
            title={`შენი ტომი — ${ELEMENT_LABEL_KA[feed.viewerElement]}`}
            subtitle="იგივე ელემენტი, იგივე ენერგია"
            element={feed.viewerElement}
            cards={feed.tribe}
          />
        )}

        {/* Magic */}
        {feed.magic.length > 0 && feed.viewerElement && (
          <Section
            number="02"
            title="მაგიური წყვილი"
            subtitle={`${ELEMENT_LABEL_KA[COMPLEMENTARY[feed.viewerElement]]} — შენი ბუნებრივი დამხმარე ელემენტი`}
            element={COMPLEMENTARY[feed.viewerElement]}
            cards={feed.magic}
          />
        )}

        {/* Other */}
        {feed.other.length > 0 && (
          <Section
            number="03"
            title="სხვა ბმები"
            subtitle="განსხვავებული ცის რუკები — შესაძლოა, საინტერესო კონტრასტი"
            element={null}
            cards={feed.other}
          />
        )}
      </section>
    </main>
  );
}

function Section({
  number,
  title,
  subtitle,
  element,
  cards,
}: {
  number: string;
  title: string;
  subtitle: string;
  element: Element | null;
  cards: DiscoverCardType[];
}) {
  const accent = element
    ? `oklch(0.75 ${element === "მიწა" ? "0.13 130" : element === "ცეცხლი" ? "0.22 30" : element === "ჰაერი" ? "0.16 220" : "0.2 280"})`
    : "oklch(0.78 0.18 305)";

  return (
    <section className="mt-12">
      <header className="mb-5 flex items-center gap-4">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border/80 ring-1 ring-foreground/10"
          style={{
            background: `linear-gradient(135deg, ${accent}/0.18, transparent 60%)`,
          }}
        >
          <span className="text-2xl" style={{ color: accent }}>
            {element ? ELEMENT_GLYPH[element] : "✦"}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
            სექცია {number}
          </div>
          <h2 className="mt-0.5 text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <DiscoverCard key={card.userId} card={card} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ hasElement }: { hasElement: boolean }) {
  return (
    <div className="mt-16 rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Compass className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">ჯერ ცარიელია</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasElement
          ? "სხვა საჯარო პროფილები ჯერ არ არიან. დაბრუნდი ცოტა ხანში — ცა იცვლება."
          : "შეავსე დაბადების მონაცემები, რომ აღმოაჩინო შენთან თავსებადი ხალხი."}
      </p>
      {!hasElement && (
        <Button asChild variant="mystic" className="mt-4">
          <Link href="/onboarding">შეავსე ახლავე</Link>
        </Button>
      )}
    </div>
  );
}
