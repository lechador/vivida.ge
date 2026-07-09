import { ChevronDown, CircleAlert, CircleCheck } from "lucide-react";

import type { MbtiSection } from "@/lib/mbti-library";

/** Parse a "**Title** — body" line into its parts (body optional). */
function parseListItem(line: string): { title: string; body: string } | null {
  // Strip leading bullets/numbering/space, but NOT "*" — the "**bold**" markers
  // are how we detect the item title.
  const trimmed = line.replace(/^[\s•–—]*(?:\d+[.)]\s*)?[\s-]*/, "").trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^\*\*(.+?)\*\*\s*[—:–-]?\s*(.*)$/);
  if (m) return { title: m[1].trim(), body: m[2].trim() };
  // No bold markers — fall back to first "—"/":" as the split point.
  const split = trimmed.match(/^(.+?)\s*[—:–-]\s+(.*)$/);
  if (split) return { title: split[1].trim(), body: split[2].trim() };
  return { title: trimmed, body: "" };
}

function ListSection({ section }: { section: MbtiSection }) {
  const items = section.body
    .split(/\n+/)
    // Only real list items (bold-titled). Drops any preamble/outro the model
    // may add despite instructions.
    .filter((line) => line.includes("**"))
    .map(parseListItem)
    .filter((x): x is { title: string; body: string } => x !== null);

  const strengths = section.kind === "strengths";
  // 16Personalities semantics: green check for strengths, amber alert for the
  // growth edges. Tuned to read on Vivida's dark glass.
  const accent = strengths ? "#34d399" : "#fbbf24";
  const Icon = strengths ? CircleCheck : CircleAlert;

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="size-5" style={{ color: accent }} />
        <h3 className="text-lg font-semibold tracking-tight">{section.titleKa}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <Icon
              className="mt-0.5 size-4 shrink-0"
              style={{ color: accent }}
              aria-hidden
            />
            <p className="text-[15px] leading-relaxed text-foreground/85">
              <span className="font-semibold text-foreground">{item.title}</span>
              {item.body && (
                <span className="mt-0.5 block text-muted-foreground">{item.body}</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProseSection({ section }: { section: MbtiSection }) {
  const paras = section.body.split(/\n{2,}/).filter(Boolean);
  return (
    <details className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl [&[open]]:bg-card/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 sm:p-7 [&::-webkit-details-marker]:hidden">
        <h3 className="text-lg font-semibold tracking-tight">{section.titleKa}</h3>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-6 pb-6 text-[15px] leading-relaxed text-foreground/85 sm:px-7 sm:pb-7">
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </details>
  );
}

/**
 * The 16Personalities-style rich profile: strengths/weaknesses as lists, plus
 * collapsible long-form sections (relationships, career, growth, …). All
 * pre-written per type; the astro personalization lives in the hero synthesis
 * above. Renders nothing if the library hasn't been seeded yet.
 */
export function MbtiProfileSections({ sections }: { sections: MbtiSection[] }) {
  if (sections.length === 0) return null;

  const lists = sections.filter((s) => s.list);
  const prose = sections.filter((s) => !s.list);

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        სრული პროფილი
      </h2>

      {lists.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((s) => (
            <ListSection key={s.kind} section={s} />
          ))}
        </div>
      )}

      {prose.map((s) => (
        <ProseSection key={s.kind} section={s} />
      ))}
    </div>
  );
}
