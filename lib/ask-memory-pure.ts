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
  if (t.openLoops?.length) {
    traitBits.push(
      locale === "en"
        ? `open threads (gently ask about one at most occasionally, never every message): ${t.openLoops.join("; ")}`
        : `ღია თემები (შესაძლოა ერთზე ნაზად იკითხო ხოლმე, არა ყოველ პასუხში): ${t.openLoops.join("; ")}`,
    );
  }
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
  if (Array.isArray(traitsRaw.openLoops)) {
    const openLoops = traitsRaw.openLoops
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim().slice(0, 60))
      .slice(0, 3);
    if (openLoops.length > 0) traits.openLoops = openLoops;
  }
  return { summary: r.summary.trim().slice(0, MAX_SUMMARY_CHARS), traits };
}

// ── Answer depth (user-chosen) ────────────────────────────────────────────

export type AskDepth = "auto" | "short" | "detailed";

export function normalizeAskDepth(value: unknown): AskDepth {
  return value === "short" || value === "detailed" ? value : "auto";
}

/** Token budget per depth — short stays cheap, detailed may use the full 4 paragraphs. */
export const ASK_DEPTH_TOKENS: Record<AskDepth, number> = {
  auto: 900,
  short: 450,
  detailed: 1400,
};

/** Extra instruction appended to the system prompt when the user picked a depth. Empty for auto. */
export function depthInstruction(
  depth: AskDepth,
  locale: UserLocale = "ka",
): string {
  if (depth === "short") {
    return locale === "en"
      ? "The person asked for a brief answer: reply in 1–2 short paragraphs, essentials only."
      : "ადამიანმა მოკლე პასუხი მთხოვა: უპასუხე 1-2 მოკლე აბზაცით, მხოლოდ მთავარი.";
  }
  if (depth === "detailed") {
    return locale === "en"
      ? "The person asked for a detailed answer: you may use the full 4 paragraphs with concrete examples."
      : "ადამიანმა დეტალური პასუხი მთხოვა: გამოიყენე სრული 4 აბზაცი კონკრეტული მაგალითებით.";
  }
  return "";
}

// ── Emotional state (deterministic keyword signal, no AI cost) ────────────

export type DistressLevel = "none" | "support" | "crisis";

const CRISIS_KA = [
  "თავის მოკვლა",
  "თავი მოვიკლა",
  "სუიციდ",
  "ცხოვრება აღარ მინდა",
  "მინდა მოვკვდე",
  "სიკვდილი მინდა",
  "აღარ მინდა ცხოვრება",
];

const CRISIS_EN = [
  "kill myself",
  "suicide",
  "suicidal",
  "want to die",
  "end my life",
  "don't want to live",
  "do not want to live",
];

const SUPPORT_KA = [
  "ცუდად ვარ",
  "ძალიან ცუდად",
  "დაღლილი ვარ",
  "გადაღლილი",
  "ვტირი",
  "ტირილი მინდა",
  "ვღელავ",
  "შფოთვა",
  "შიში მაქვს",
  "დეპრესია",
  "მარტო ვარ",
  "ვერ ვიძინებ",
  "ძალა აღარ მაქვს",
  "განადგურებული ვარ",
  "გული მტკივა",
];

const SUPPORT_EN = [
  "i feel bad",
  "i feel awful",
  "i'm exhausted",
  "i am exhausted",
  "burned out",
  "burnout",
  "i'm crying",
  "i am crying",
  "anxious",
  "anxiety",
  "depressed",
  "depression",
  "lonely",
  "i'm lonely",
  "can't sleep",
  "cannot sleep",
  "hopeless",
  "overwhelmed",
  "heartbroken",
  "i'm scared",
];

/** Keyword scan of one user message. Crisis wins over support. */
export function detectDistress(message: string): DistressLevel {
  const text = message.toLowerCase();
  if (
    CRISIS_KA.some((k) => text.includes(k)) ||
    CRISIS_EN.some((k) => text.includes(k))
  ) {
    return "crisis";
  }
  if (
    SUPPORT_KA.some((k) => text.includes(k)) ||
    SUPPORT_EN.some((k) => text.includes(k))
  ) {
    return "support";
  }
  return "none";
}

/** Extra instruction for a vulnerable turn. Empty when no distress detected. */
export function distressInstruction(
  level: DistressLevel,
  locale: UserLocale = "ka",
): string {
  if (level === "crisis") {
    return locale === "en"
      ? "The person may be in crisis. First respond with care: acknowledge their pain, urge them to reach out right now to someone they trust or a mental-health professional. No astrology lecture, no platitudes, no medical claims. Keep it short."
      : "ადამიანი შესაძლოა კრიზისშია. პირველ რიგში მზრუნველობით უპასუხე: აღიარე მისი ტკივილი, ურჩიე ახლავე დაუკავშირდეს სანდო ადამიანს ან ფსიქიკური ჯანმრთელობის სპეციალისტს. არა ასტროლოგიური ლექცია, არა ბანალური ფრაზები, არა სამედიცინო მტკიცებები. მოკლედ.";
  }
  if (level === "support") {
    return locale === "en"
      ? "The person's message sounds heavy or vulnerable. Start with one warm validating sentence before any astrology. Keep the answer shorter than usual and gentle — no pep-talk clichés."
      : "ადამიანის შეტყობინება მძიმე ან მოწყვლადია. ასტროლოგიამდე დაიწყე ერთი თბილი, დამადასტურებელი წინადადებით. პასუხი ჩვეულებრივზე მოკლე და ნაზი — გამამხნევებელი კლიშეების გარეშე.";
  }
  return "";
}

// ── Proactive follow-ups & topic starters ──────────────────────────────────

/** Turns an open loop ("გასაუბრება ხუთშაბათს") into a sendable question. */
export function buildFollowUpQuestion(
  openLoop: string,
  locale: UserLocale = "ka",
): string {
  const loop = openLoop.trim().slice(0, 60);
  return locale === "en"
    ? `How's the "${loop}" situation going?`
    : `როგორ მიდის „${loop}“-ის ამბავი?`;
}

export type TopicStarter = { label: string; prompt: string };

/** Turns a remembered topic ("კარიერა") into a chip that asks about it. */
export function buildTopicStarter(
  topic: string,
  locale: UserLocale = "ka",
): TopicStarter {
  const t = topic.trim().slice(0, 40);
  return locale === "en"
    ? { label: t, prompt: `What does my chart say about ${t}?` }
    : { label: t, prompt: `რას ამბობს ჩემი რუკა „${t}“-ზე?` };
}
