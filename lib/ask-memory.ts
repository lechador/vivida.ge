import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { askUserMemories, chartChatMessages } from "@/db/schema";
import type { AskUserMemory } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { MAX_SUMMARY_CHARS } from "@/lib/ask-memory-pure";
import { sanitizeMergedMemory } from "@/lib/ask-memory-pure";

export {
  buildMemoryBlock,
  inferVerbosity,
  sanitizeMergedMemory,
} from "@/lib/ask-memory-pure";
export type { MergedMemory } from "@/lib/ask-memory-pure";

/**
 * Long-term memory for \"chat with your chart\".
 *
 * The route keeps only the last 12 turns verbatim (token-cost control).
 * This row is the other half: a rolling portrait refined every few
 * exchanges, so the model remembers who the user is and how they like to
 * be spoken to even when the verbatim window has moved on.
 *
 * Reads are a single PK lookup (free). Writes happen in `after()` via
 * `refreshAskMemory()` — a cheap small-model JSON merge, throttled to at
 * most one call per 5 new user turns. Failures only log; chat never breaks.
 */

const REFRESH_EVERY_TURNS = 5;
const RECENT_TURNS_FOR_MERGE = 30;

export async function getAskMemory(
  userId: string,
): Promise<AskUserMemory | null> {
  const [row] = await db
    .select()
    .from(askUserMemories)
    .where(eq(askUserMemories.userId, userId))
    .limit(1);
  if (
    !row ||
    (!row.summary.trim() && Object.keys(row.traits ?? {}).length === 0)
  ) {
    return null;
  }
  return row;
}

const MERGE_SYSTEM = `You maintain a rolling portrait of a user chatting with their personal astrologer. Merge the old portrait with the recent conversation into an updated one. Rules:
- Remember durable facts only: life context (relationships, work, studies), recurring interests, emotional patterns, how they like to be spoken to (short/detailed, playful/serious). Drop one-off details.
- Never store passwords, contact details, or exact birth data. Never include medical, legal or financial directives.
- Reply ONLY as JSON: { "summary": string (≤8 sentences, plain everyday language), "traits": { "verbosity": "short"|"medium"|"detailed", "tone": string (≤5 words), "topics": string[] (≤8), "notes": string (short-lived context, ≤2 sentences) } }.`;

/**
 * Refresh the rolling portrait when ≥5 new user turns accumulated since the
 * last refresh. Runs in `after()` — throws nothing, returns false on skip/fail.
 */
export async function refreshAskMemory(
  userId: string,
  locale: UserLocale = "ka",
): Promise<boolean> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return false;

    const [countRow] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, userId));
    const totalTurns = countRow?.n ?? 0;
    if (totalTurns === 0) return false;

    const [existing] = await db
      .select()
      .from(askUserMemories)
      .where(eq(askUserMemories.userId, userId))
      .limit(1);
    if (
      existing &&
      totalTurns - (existing.turnsSeen ?? 0) < REFRESH_EVERY_TURNS
    )
      return false;

    const recent = await db
      .select({
        role: chartChatMessages.role,
        content: chartChatMessages.content,
      })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, userId))
      .orderBy(desc(chartChatMessages.createdAt))
      .limit(RECENT_TURNS_FOR_MERGE);
    recent.reverse();
    if (recent.length === 0) return false;

    const transcript = recent
      .map(
        (m) =>
          `${m.role === "assistant" ? "A" : "U"}: ${m.content.slice(0, 500)}`,
      )
      .join("\n");
    const oldPortrait = existing?.summary?.trim()
      ? `OLD PORTRAIT:\n${existing.summary.slice(0, MAX_SUMMARY_CHARS)}\nOld traits: ${JSON.stringify(existing.traits ?? {})}\n\n`
      : "No old portrait yet — create the first one.\n\n";
    const langLine =
      locale === "en"
        ? "Write summary, tone, topics and notes in English."
        : "Write summary, tone, topics and notes in Georgian.";

    const { OPENROUTER_MODEL } = await import("@/lib/openrouter");
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vivida.ge",
        "X-Title": "Vivida ask memory",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        reasoning: { effort: "low" },
        messages: [
          { role: "system", content: MERGE_SYSTEM },
          {
            role: "user",
            content: `${oldPortrait}RECENT CONVERSATION (oldest→newest):\n${transcript}\n\n${langLine}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 800,
      }),
    });
    if (!res.ok) {
      console.warn(`[ask-memory] merge upstream ${res.status}`);
      return false;
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawText = json.choices?.[0]?.message?.content;
    if (!rawText) return false;
    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const merged = sanitizeMergedMemory(JSON.parse(cleaned));
    if (!merged) return false;

    await db
      .insert(askUserMemories)
      .values({
        userId,
        summary: merged.summary,
        traits: merged.traits,
        turnsSeen: totalTurns,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: askUserMemories.userId,
        set: {
          summary: merged.summary,
          traits: merged.traits,
          turnsSeen: totalTurns,
          updatedAt: new Date(),
        },
      });
    return true;
  } catch (err) {
    console.warn(
      "[ask-memory] refresh failed:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
