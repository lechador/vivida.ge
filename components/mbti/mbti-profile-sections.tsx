import { ChevronDown, CircleAlert, CircleCheck } from "lucide-react";

import type { MbtiSection } from "@/lib/mbti-library";

type Item = { title: string; body: string };

const STRONG = "#34d399"; // emerald — strengths
const WEAK = "#fbbf24"; // amber — weaknesses / challenges

/** Parse a "**Title** — body" line into its parts (body optional). */
function parseListItem(line: string): Item | null {
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

/** Bold-titled lines only — drops any preamble/outro or section-label lines. */
function parseItems(block: string): Item[] {
  return block
    .split(/\n+/)
    .filter((line) => line.includes("**"))
    .map(parseListItem)
    .filter((x): x is Item => x !== null);
}

/** Split a "dual" body into its ძლიერი (strong) and სუსტი (weak) halves. */
function splitDual(body: string): { strong: Item[]; weak: Item[] } {
  const lines = body.split(/\n/);
  const weakStart = lines.findIndex((l) => /^\s*(\*\*)?\s*სუსტ/.test(l));
  if (weakStart < 0) return { strong: parseItems(body), weak: [] };
  return {
    strong: parseItems(lines.slice(0, weakStart).join("\n")),
    weak: parseItems(lines.slice(weakStart).join("\n")),
  };
}

function ItemList({ items, accent }: { items: Item[]; accent: string }) {
  const Icon = accent === STRONG ? CircleCheck : CircleAlert;
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <Icon className="mt-0.5 size-4 shrink-0" style={{ color: accent }} aria-hidden />
          <p className="text-[15px] leading-relaxed text-foreground/85">
            <span className="font-semibold text-foreground">{item.title}</span>
            {item.body && (
              <span className="mt-0.5 block text-muted-foreground">{item.body}</span>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** A single top-level list card (strengths OR weaknesses for the whole type). */
function ListSection({ section }: { section: MbtiSection }) {
  const strengths = section.kind === "strengths";
  const accent = strengths ? STRONG : WEAK;
  const Icon = strengths ? CircleCheck : CircleAlert;
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="size-5" style={{ color: accent }} />
        <h3 className="text-lg font-semibold tracking-tight">{section.titleKa}</h3>
      </div>
      <ItemList items={parseItems(section.body)} accent={accent} />
    </div>
  );
}

/** A collapsible life-domain with BOTH a strengths and a weaknesses list. */
function DualSection({ section }: { section: MbtiSection }) {
  const { strong, weak } = splitDual(section.body);
  return (
    <details className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl [&[open]]:bg-card/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 sm:p-7 [&::-webkit-details-marker]:hidden">
        <h3 className="text-lg font-semibold tracking-tight">{section.titleKa}</h3>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2 sm:px-7 sm:pb-7">
        {strong.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CircleCheck className="size-4" style={{ color: STRONG }} />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
                ძლიერი მხარეები
              </h4>
            </div>
            <ItemList items={strong} accent={STRONG} />
          </div>
        )}
        {weak.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CircleAlert className="size-4" style={{ color: WEAK }} />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
                სუსტი მხარეები
              </h4>
            </div>
            <ItemList items={weak} accent={WEAK} />
          </div>
        )}
      </div>
    </details>
  );
}

/**
 * The 16Personalities-style rich profile: whole-type strengths/weaknesses as
 * two lists, then a collapsible section per life-domain (relationships, career,
 * growth, …) — each showing both its strengths and its challenges. All
 * pre-written per type. Renders nothing if the library hasn't been seeded yet.
 */
export function MbtiProfileSections({ sections }: { sections: MbtiSection[] }) {
  if (sections.length === 0) return null;

  const lists = sections.filter((s) => s.format === "list");
  const duals = sections.filter((s) => s.format === "dual");

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

      {duals.map((s) => (
        <DualSection key={s.kind} section={s} />
      ))}
    </div>
  );
}
