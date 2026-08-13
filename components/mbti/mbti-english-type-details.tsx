import { BriefcaseBusiness, CircleAlert, CircleCheck, Heart, Sprout } from "lucide-react";

import { mbtiEnglishContent } from "@/lib/mbti-content-en";

export function MbtiEnglishTypeDetails({ type }: { type: string }) {
  const profile = mbtiEnglishContent(type);
  return (
    <div className="mt-8 space-y-4">
      <article className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 text-[15px] leading-relaxed text-foreground/90 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Understanding {type} — {profile.archetype}</h2>
        {profile.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </article>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListCard title="Core strengths" items={profile.strengths} positive />
        <ListCard title="Common challenges" items={profile.challenges} />
      </div>

      <InsightCard icon={Heart} title="Relationships" body={profile.relationships} />
      <InsightCard icon={BriefcaseBusiness} title="Career and work" body={profile.career} />
      <InsightCard icon={Sprout} title="Growth" body={profile.growth} />

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        Personality frameworks describe preferences, not fixed abilities, diagnoses or limits. Context, culture and experience shape how any type appears in real life.
      </p>
    </div>
  );
}

function ListCard({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  const Icon = positive ? CircleCheck : CircleAlert;
  const color = positive ? "#34d399" : "#fbbf24";
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight"><Icon className="size-5" style={{ color }} />{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-foreground/85"><Icon className="mt-0.5 size-4 shrink-0" style={{ color }} /><span>{item}</span></li>)}
      </ul>
    </section>
  );
}

function InsightCard({ icon: Icon, title, body }: { icon: typeof Heart; title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight"><Icon className="size-5 text-[var(--vivida-violet)]" />{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{body}</p>
    </section>
  );
}
