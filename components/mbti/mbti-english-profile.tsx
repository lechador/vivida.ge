import type { MbtiScoresJson } from "@/db/schema";
import { AXIS_LABEL_EN, mbtiArchetypeEn, mbtiBaseType, type MbtiAxis } from "@/lib/mbti-questions";

const TYPE_SUMMARY: Record<string, string> = {
  ISTJ: "Practical, dependable and detail-conscious, you tend to value clear responsibilities, proven methods and promises that can be trusted.",
  ISFJ: "Attentive and dependable, you often combine a strong memory for detail with a quiet commitment to protecting the people and traditions you value.",
  INFJ: "Insightful and values-driven, you tend to search for underlying meaning and use empathy, imagination and structure in service of a larger purpose.",
  INTJ: "Independent and strategic, you naturally look for systems, long-range patterns and more effective ways to turn complex ideas into reality.",
  ISTP: "Observant and adaptable, you often understand the world by testing it directly and solving immediate problems with calm, economical logic.",
  ISFP: "Sensitive, flexible and quietly expressive, you tend to value authenticity, lived experience and freedom to respond to each moment in your own way.",
  INFP: "Imaginative and guided by personal values, you often seek work and relationships that feel authentic, humane and rich with possibility.",
  INTP: "Curious and analytical, you naturally examine assumptions, build conceptual models and pursue ideas wherever their internal logic leads.",
  ESTP: "Energetic and pragmatic, you tend to notice opportunities quickly, learn through action and stay resourceful when circumstances change.",
  ESFP: "Warm and spontaneous, you often bring energy to the present moment and connect with people through openness, humor and shared experience.",
  ENFP: "Enthusiastic and imaginative, you tend to see possibilities in people and ideas, creating momentum through curiosity, warmth and conviction.",
  ENTP: "Inventive and intellectually adventurous, you enjoy testing ideas, reframing problems and finding possibilities that conventional thinking overlooks.",
  ESTJ: "Direct, organized and responsible, you naturally create structure, make decisions and coordinate people around clear, measurable goals.",
  ESFJ: "Sociable and considerate, you often build stability through practical care, shared expectations and close attention to the needs of a community.",
  ENFJ: "Empathetic and persuasive, you tend to understand group dynamics and help people move toward growth, cooperation and a shared vision.",
  ENTJ: "Decisive and strategic, you naturally organize resources around ambitious goals and challenge systems to become more effective.",
};

const AXIS_NOTE: Record<MbtiAxis, Record<string, string>> = {
  EI: { E: "Interaction and outward activity tend to recharge you.", I: "Solitude and inward reflection tend to restore your energy." },
  SN: { S: "You tend to trust concrete evidence, experience and useful detail.", N: "You tend to notice patterns, implications and future possibilities." },
  TF: { T: "You tend to prioritize consistency, logic and objective criteria.", F: "You tend to weigh values, relationships and human impact heavily." },
  JP: { J: "You tend to prefer plans, structure and resolved decisions.", P: "You tend to prefer flexibility, exploration and open options." },
  AT: { A: "You report a steadier, more self-assured response to pressure.", T: "You report greater sensitivity to pressure, feedback and self-evaluation." },
};

export function MbtiEnglishProfile({ type, scores }: { type: string; scores: MbtiScoresJson }) {
  const base = mbtiBaseType(type);
  const axes: MbtiAxis[] = ["EI", "SN", "TF", "JP", "AT"];
  return (
    <section className="mt-6 space-y-4 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Your type portrait</div>
        <h2 className="mt-1 text-2xl font-semibold">{mbtiArchetypeEn(type)}</h2>
        <p className="mt-3 leading-relaxed text-foreground/85">{TYPE_SUMMARY[base]}</p>
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
