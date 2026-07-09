import type { MbtiScoresJson } from "@/db/schema";
import { AXIS_LABEL_KA, type MbtiAxis } from "@/lib/mbti-questions";
import { cn } from "@/lib/utils";

const AXES: MbtiAxis[] = ["EI", "SN", "TF", "JP", "AT"];

/**
 * The visual result block — the type code, archetype, and the five axis bars.
 * Shared by the full results page and the anonymous teaser gate (which passes
 * `analysis={null}` to keep the deep text locked). Rows written before the
 * Identity axis existed lack `AT`; that bar is simply skipped for them.
 */
export function MbtiResultView({
  type,
  archetypeNameGe,
  scores,
  analysis,
}: {
  type: string;
  archetypeNameGe: string;
  scores: MbtiScoresJson;
  /** Full synthesis text, or null to lock it (anonymous teaser). */
  analysis: string | null;
}) {
  return (
    <div className="space-y-8">
      {/* Type hero */}
      <div className="rounded-3xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
        <div className="text-5xl font-bold tracking-[0.15em] sm:text-7xl">
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {type}
          </span>
        </div>
        <div className="mt-3 text-lg font-medium text-foreground/90 sm:text-xl">
          {archetypeNameGe}
        </div>
      </div>

      {/* Axis bars */}
      <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
        {AXES.map((axis) => {
          const s = scores[axis];
          if (!s) return null; // pre-Identity rows have no AT bar
          const [firstKa, secondKa] = AXIS_LABEL_KA[axis];
          const firstLetter = axis[0];
          const winnerIsFirst = s.letter === firstLetter;
          // pct is the winner's strength; render as the first-pole share.
          const firstPct = winnerIsFirst ? s.pct : 100 - s.pct;
          return (
            <div key={axis}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span
                  className={cn(
                    "font-medium",
                    winnerIsFirst ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {firstKa} {winnerIsFirst && `· ${s.pct}%`}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    !winnerIsFirst ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {!winnerIsFirst && `${s.pct}% ·`} {secondKa}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[var(--vivida-pink)]/25">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--vivida-cyan)]"
                  style={{ width: `${firstPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Synthesis */}
      {analysis ? (
        <article className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 text-[15px] leading-relaxed text-foreground/90 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          {analysis
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </article>
      ) : null}
    </div>
  );
}
