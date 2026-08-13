import type { MbtiScoresJson } from "@/db/schema";
import { AXIS_LABEL_EN, mbtiArchetypeEn, mbtiBaseType, type MbtiAxis } from "@/lib/mbti-questions";
import { mbtiEnglishContent } from "@/lib/mbti-content-en";

const AXIS_NOTE: Record<MbtiAxis, Record<string, string>> = {
  EI: { E: "Interaction and outward activity tend to recharge you.", I: "Solitude and inward reflection tend to restore your energy." },
  SN: { S: "You tend to trust concrete evidence, experience and useful detail.", N: "You tend to notice patterns, implications and future possibilities." },
  TF: { T: "You tend to prioritize consistency, logic and objective criteria.", F: "You tend to weigh values, relationships and human impact heavily." },
  JP: { J: "You tend to prefer plans, structure and resolved decisions.", P: "You tend to prefer flexibility, exploration and open options." },
  AT: { A: "You report a steadier, more self-assured response to pressure.", T: "You report greater sensitivity to pressure, feedback and self-evaluation." },
};

export function MbtiEnglishProfile({ type, scores }: { type: string; scores: MbtiScoresJson }) {
  const base = mbtiBaseType(type);
  const profile = mbtiEnglishContent(base);
  const axes: MbtiAxis[] = ["EI", "SN", "TF", "JP", "AT"];
  return (
    <section className="mt-6 space-y-4 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Your type portrait</div>
        <h2 className="mt-1 text-2xl font-semibold">{mbtiArchetypeEn(type)}</h2>
        <p className="mt-3 leading-relaxed text-foreground/85">{profile.summary[0]}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {axes.map((axis) => {
          const score = scores[axis];
          if (!score) return null;
          const [first, second] = AXIS_LABEL_EN[axis];
          return (
            <article key={axis} className="rounded-2xl border border-border bg-background/30 p-4">
              <div className="text-sm font-semibold">{score.letter === axis[0] ? first : second} · {score.pct}%</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{AXIS_NOTE[axis][score.letter]}</p>
            </article>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">Personality frameworks describe preferences, not fixed abilities or diagnoses. Percentages near 50% often reflect flexibility between both poles.</p>
    </section>
  );
}
