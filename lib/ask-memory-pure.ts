import type { AskUserMemory, AskUserMemoryTraits } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Pure helpers for ask long-term memory — no DB imports, so unit tests can
 * load this module without DATABASE_URL. DB access lives in `ask-memory.ts`.
 */

export const MAX_SUMMARY_CHARS = 1500;

export type MergedMemory = { summary: string; traits: AskUserMemoryTraits };

/**
 * Deterministic style signal from the user's own messages — no AI needed.
 * Avg user-turn length decides verbosity; the prompt mirrors it.
 */
export function inferVerbosity(
  userMessages: string[],
): "short" | "medium" | "detailed" {
  const lens = userMessages.map((m) => m.trim().length).filter((n) => n > 0);
  if (lens.length === 0) return "medium";
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  if (avg < 80) return "short";
  if (avg > 350) return "detailed";
  return "medium";
}

/** Prompt block injected into the chart-chat system prompt. Empty when no memory yet. */
export function buildMemoryBlock(
  memory: AskUserMemory | null,
  locale: UserLocale = "ka",
): string {
  if (!memory) return "";
  const parts: string[] = [];
  if (memory.summary.trim())
    parts.push(memory.summary.trim().slice(0, MAX_SUMMARY_CHARS));
  const t = memory.traits ?? {};
  const traitBits: string[] = [];
  if (t.verbosity)
    traitBits.push(
      locale === "en"
        ? `prefers ${t.verbosity} answers`
        : `უპირატესობა: ${t.verbosity === "short" ? "მოკლე" : t.verbosity === "detailed" ? "დეტალური" : "საშუალო"} პასუხები`,
    );
  if (t.tone)
    traitBits.push(locale === "en" ? `tone: ${t.tone}` : `ტონი: ${t.tone}`);
  if (t.topics?.length)
    traitBits.push(
      locale === "en"
        ? `recurring topics: ${t.topics.join(", ")}`
        : `მუდმივი თემები: ${t.topics.join(", ")}`,
    );
  if (t.notes) traitBits.push(t.notes.slice(0, 300));
  const traitsLine = traitBits.length > 0 ? traitBits.join("; ") : "";
  const body = [...parts, traitsLine].filter(Boolean).join("\n");
  if (!body) return "";
  return locale === "en"
    ? `What you remember about this person (from earlier conversations — refer back to it naturally, never recite it verbatim):\n${body}`
    : `რას გახსოვს ამ ადამიანზე (წინა საუბრებიდან — გამოიყენე ბუნებრივად, ნუ ჩამოთვლი სიტყვა-სიტყვით):\n${body}`;
}

/** Guard the LLM merge output before persisting — junk in, junk out otherwise. */
export function sanitizeMergedMemory(raw: unknown): MergedMemory | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.summary !== "string" || !r.summary.trim()) return null;
  const traitsRaw = (r.traits ?? {}) as Record<string, unknown>;
  const traits: AskUserMemoryTraits = {};
  if (
    traitsRaw.verbosity === "short" ||
    traitsRaw.verbosity === "medium" ||
    traitsRaw.verbosity === "detailed"
  ) {
    traits.verbosity = traitsRaw.verbosity;
  }
  if (typeof traitsRaw.tone === "string" && traitsRaw.tone.trim()) {
    traits.tone = traitsRaw.tone.trim().slice(0, 40);
  }
  if (Array.isArray(traitsRaw.topics)) {
    const topics = traitsRaw.topics
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim().slice(0, 40))
      .slice(0, 8);
    if (topics.length > 0) traits.topics = topics;
  }
  if (typeof traitsRaw.notes === "string" && traitsRaw.notes.trim()) {
    traits.notes = traitsRaw.notes.trim().slice(0, 300);
  }
  return { summary: r.summary.trim().slice(0, MAX_SUMMARY_CHARS), traits };
}
