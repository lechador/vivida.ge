import { BriefcaseBusiness, CircleAlert, CircleCheck, Heart, Sprout } from "lucide-react";

import { mbtiByCodeAm } from "@/lib/mbti-content-am";

export function MbtiArmenianTypeDetails({ type }: { type: string }) {
  const profile = mbtiByCodeAm(type);
  if (!profile) return null;

  return (
    <div className="mt-8 space-y-4">
      <article className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 text-[15px] leading-relaxed text-foreground/90 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Հասկանալ {type} — {profile.archetype}
        </h2>
        {profile.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListCard title="Գլխավոր ուժեղ կողմեր" items={profile.strengths} positive />
        <ListCard title="Հնարավոր մարտահրավերներ" items={profile.challenges} />
      </div>

      <InsightCard icon={Heart} title="Հարաբերություններ և սեր" body={profile.relationships} />
      <InsightCard icon={BriefcaseBusiness} title="Կարիերա և աշխատանք" body={profile.career} />
      <InsightCard icon={Sprout} title="Անձնական աճ" body={profile.growth} />

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        Անհատականության տիպերը նկարագրում են նախասիրությունները, այլ ոչ թե ֆիքսված սահմանափակումներ: Կյանքի փորձն ու միջավայրը մեծ դեր ունեն յուրաքանչյուր մարդու զարգացման մեջ:
      </p>
    </div>
  );
}

function ListCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  const Icon = positive ? CircleCheck : CircleAlert;
  const color = positive ? "#34d399" : "#fbbf24";
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Icon className="size-5" style={{ color }} />
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-foreground/85">
            <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function InsightCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Heart;
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Icon className="size-5 text-[var(--vivida-violet)]" />
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{body}</p>
    </section>
  );
}
