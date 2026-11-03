import type { AskUserMemory, AskUserMemoryTraits } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Pure helpers for ask long-term memory, no DB imports, so unit tests can
 * load this module without DATABASE_URL. DB access lives in `ask-memory.ts`.
 */

export const MAX_SUMMARY_CHARS = 1500;

/** Throttle window for the rolling-portrait merge, counted in user turns. */
export const ASK_MEMORY_REFRESH_EVERY_TURNS = 5;

/**
 * True when a portrait merge is due: at least `every` new *user* turns since
 * the last merge. A missing baseline always merges once there is anything to
 * merge. `turnsSeen` stored before user-only counting can exceed the current
 * total; that delta clamps at 0 so those rows re-baseline instead of
 * refreshing on the old doubled cadence.
 */
export function askMemoryRefreshDue(
  totalUserTurns: number,
  turnsSeen: number | null | undefined,
  every: number = ASK_MEMORY_REFRESH_EVERY_TURNS,
): boolean {
  if (totalUserTurns === 0) return false;
  if (turnsSeen == null) return true;
  return Math.max(0, totalUserTurns - turnsSeen) >= every;
}

export type MergedMemory = { summary: string; traits: AskUserMemoryTraits };

/**
 * Deterministic style signal from the user's own messages, no AI needed.
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
  opts: { topicIsolated?: boolean } = {},
): string {
  if (!memory) return "";
  const isolated = opts.topicIsolated === true;
  const parts: string[] = [];
  if (memory.summary.trim())
    parts.push(memory.summary.trim().slice(0, MAX_SUMMARY_CHARS));
  const t = memory.traits ?? {};
  const traitBits: string[] = [];
  if (t.verbosity)
    traitBits.push(
      locale === "pl"
        ? t.verbosity === "short"
          ? "preferuje zwięzłe odpowiedzi"
          : t.verbosity === "detailed"
            ? "preferuje szczegółowe odpowiedzi"
            : "preferuje odpowiedzi średniej długości"
        : locale === "en"
          ? `prefers ${t.verbosity} answers`
          : `უპირატესობა: ${t.verbosity === "short" ? "მოკლე" : t.verbosity === "detailed" ? "დეტალური" : "საშუალო"} პასუხები`,
    );
  if (t.tone)
    traitBits.push(
      locale === "pl"
        ? `ton: ${t.tone}`
        : locale === "en"
          ? `tone: ${t.tone}`
          : `ტონი: ${t.tone}`,
    );
  // A fresh topic keeps the person's durable style but not the story they just
  // left: recurring topics, short-lived notes and open threads are the parts
  // that would drag the previous subject into unrelated answers.
  if (!isolated && t.topics?.length)
    traitBits.push(
      locale === "pl"
        ? `powracające tematy: ${t.topics.join(", ")}`
        : locale === "en"
          ? `recurring topics: ${t.topics.join(", ")}`
          : `მუდმივი თემები: ${t.topics.join(", ")}`,
    );
  if (!isolated && t.notes) traitBits.push(t.notes.slice(0, 300));
  if (!isolated && t.openLoops?.length) {
    traitBits.push(
      locale === "pl"
        ? `otwarte wątki (od czasu do czasu możesz delikatnie nawiązać do jednego, nie w każdej wiadomości): ${t.openLoops.join("; ")}`
        : locale === "en"
          ? `open threads (gently ask about one at most occasionally, never every message): ${t.openLoops.join("; ")}`
          : `ღია თემები (შესაძლოა ერთზე ნაზად იკითხო ხოლმე, არა ყოველ პასუხში): ${t.openLoops.join("; ")}`,
    );
  }
  const traitsLine = traitBits.length > 0 ? traitBits.join("; ") : "";
  const body = [...parts, traitsLine].filter(Boolean).join("\n");
  if (!body) return "";
  if (isolated) {
    return locale === "pl"
      ? `Informacje o tej osobie z wcześniejszych rozmów. Właśnie rozpoczęła nowy temat, więc użyj tego tylko po to, aby dopasować ton i poziom szczegółowości. NIE nawiązuj do wcześniejszych tematów, osób ani otwartych wątków, chyba że rozmówca sam o nich wspomni:\n${body}`
      : locale === "en"
        ? `Background about this person from earlier conversations. They just started a new topic, so use this only to match their tone and level of detail. Do NOT bring up earlier topics, people or open threads unless the person mentions them first:\n${body}`
        : `ფონური ინფორმაცია ამ ადამიანზე წინა საუბრებიდან. მან ახლახან ახალი თემა დაიწყო, ამიტომ გამოიყენე ეს მხოლოდ ტონისა და დეტალურობის შესაბამისად. არ ახსენო წინა თემები, ადამიანები ან ღია საკითხები, სანამ თავად არ მოიხსენიებს:\n${body}`;
  }
  return locale === "pl"
    ? `Co pamiętasz o tej osobie (z wcześniejszych rozmów — używaj naturalnie, nigdy nie recytuj dosłownie):\n${body}`
    : locale === "en"
      ? `What you remember about this person (from earlier conversations, refer back to it naturally, never recite it verbatim):\n${body}`
      : `რას გახსოვს ამ ადამიანზე (წინა საუბრებიდან, გამოიყენე ბუნებრივად, ნუ ჩამოთვლი სიტყვა-სიტყვით):\n${body}`;
}

/** Guard the LLM merge output before persisting, junk in, junk out otherwise. */
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

/** Token budget per depth, short stays cheap, detailed may use the full 4 paragraphs. */
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
    return locale === "pl"
      ? "Użytkownik poprosił o zwięzłą odpowiedź: odpowiedz w 1–2 krótkich akapitach, same konkrety."
      : locale === "en"
        ? "The person asked for a brief answer: reply in 1–2 short paragraphs, essentials only."
        : "ადამიანმა მოკლე პასუხი მთხოვა: უპასუხე 1-2 მოკლე აბზაცით, მხოლოდ მთავარი.";
  }
  if (depth === "detailed") {
    return locale === "pl"
      ? "Użytkownik poprosił o szczegółową odpowiedź: możesz wykorzystać pełne 4 akapity z konkretnymi przykładami."
      : locale === "en"
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

const CRISIS_PL = [
  "zabić się",
  "odebrać sobie życie",
  "samobój",
  "nie chcę żyć",
  "chcę umrzeć",
  "koniec mojego życia",
  "nie mam po co żyć",
  "nie mam siły żyć",
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

const SUPPORT_PL = [
  "źle się czuję",
  "czuję się fatalnie",
  "jestem wykończony",
  "jestem wykończona",
  "wypalenie",
  "płaczę",
  "chce mi się płakać",
  "lęk",
  "stany lękowe",
  "depresja",
  "jestem sam",
  "jestem sama",
  "nie mogę spać",
  "nie mam już sił",
  "załamana",
  "załamany",
  "pęka mi serce",
  "boję się",
];

/** Keyword scan of one user message. Crisis wins over support. */
export function detectDistress(message: string): DistressLevel {
  const text = message.toLowerCase();
  if (
    CRISIS_KA.some((k) => text.includes(k)) ||
    CRISIS_EN.some((k) => text.includes(k)) ||
    CRISIS_PL.some((k) => text.includes(k))
  ) {
    return "crisis";
  }
  if (
    SUPPORT_KA.some((k) => text.includes(k)) ||
    SUPPORT_EN.some((k) => text.includes(k)) ||
    SUPPORT_PL.some((k) => text.includes(k))
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
    return locale === "pl"
      ? "Rozmówca może przeżywać kryzys emocjonalny. Przede wszystkim odpowiedz z troską: doceń jego ból, zachęć do natychmiastowego kontaktu z bliską osobą lub specjalistą ds. zdrowia psychicznego. Bez wykładu z astrologii, bez banałów, bez porad medycznych. Odpowiedz krótko."
      : locale === "en"
        ? "The person may be in crisis. First respond with care: acknowledge their pain, urge them to reach out right now to someone they trust or a mental-health professional. No astrology lecture, no platitudes, no medical claims. Keep it short."
        : "ადამიანი შესაძლოა კრიზისშია. პირველ რიგში მზრუნველობით უპასუხე: აღიარე მისი ტკივილი, ურჩიე ახლავე დაუკავშირდეს სანდო ადამიანს ან ფსიქიკური ჯანმრთელობის სპეციალისტს. არა ასტროლოგიური ლექცია, არა ბანალური ფრაზები, არა სამედიცინო მტკიცებები. მოკლედ.";
  }
  if (level === "support") {
    return locale === "pl"
      ? "Wiadomość użytkownika brzmi ciężko lub bezbronnie. Przed jakąkolwiek astrologią zacznij od jednego ciepłego, wspierającego zdania. Odpowiedź powinna być krótsza niż zwykle i delikatna, bez pustych frazesów motywacyjnych."
      : locale === "en"
        ? "The person's message sounds heavy or vulnerable. Start with one warm validating sentence before any astrology. Keep the answer shorter than usual and gentle, no pep-talk clichés."
        : "ადამიანის შეტყობინება მძიმე ან მოწყვლადია. ასტროლოგიამდე დაიწყე ერთი თბილი, დამადასტურებელი წინადადებით. პასუხი ჩვეულებრივზე მოკლე და ნაზი, გამამხნევებელი კლიშეების გარეშე.";
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
  if (locale === "pl") return `Jak wygląda sytuacja z: „${loop}”?`;
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
  if (locale === "pl")
    return { label: t, prompt: `Co mój horoskop mówi o: ${t}?` };
  return locale === "en"
    ? { label: t, prompt: `What does my chart say about ${t}?` }
    : { label: t, prompt: `რას ამბობს ჩემი რუკა „${t}“-ზე?` };
}
