import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Pure helpers for proactive ask nudges, no DB imports, unit-testable.
 * DB access + push/bell delivery live in `ask-nudges.ts`.
 *
 * Cost discipline: nudge copy is deterministic templates (zero AI per send).
 * AI is spent only when the user opens the app, through the normal
 * credit-gated chat flow.
 */

// ── Gates ─────────────────────────────────────────────────────────────────

export const ASK_NUDGE_MIN_TURNS = 3;
export const ASK_NUDGE_QUIET_DAYS_MIN = 3;
export const ASK_NUDGE_STALE_DAYS_MAX = 10;
export const ASK_NUDGE_DORMANT_DAYS_MAX = 21;
export const ASK_NUDGE_WEEK_CAP = 2;
export const ASK_NUDGE_GAP_HOURS = 72;
/** Global ceiling per cron run, bounds Neon writes + push fan-out. */
export const ASK_NUDGE_DAY_CAP = 200;
/** Base candidates scanned per run (filtered down in memory). */
export const ASK_NUDGE_SCAN_LIMIT = 400;

const DAY = 24 * 60 * 60 * 1000;

/**
 * Due predicate: the portrait went quiet 3–10 days ago (an open loop is
 * waiting), the user hasn't chatted since, and they aren't long churned.
 */
export function nudgeDue(
  memoryUpdatedAt: Date,
  lastUserTurnAt: Date,
  now: Date = new Date(),
): boolean {
  const memAge = now.getTime() - memoryUpdatedAt.getTime();
  if (memAge < ASK_NUDGE_QUIET_DAYS_MIN * DAY) return false;
  if (memAge > ASK_NUDGE_STALE_DAYS_MAX * DAY) return false;
  if (lastUserTurnAt.getTime() >= memoryUpdatedAt.getTime()) return false;
  if (
    now.getTime() - lastUserTurnAt.getTime() >
    ASK_NUDGE_DORMANT_DAYS_MAX * DAY
  )
    return false;
  return true;
}

/** Frequency caps from the user's recent send timestamps (newest last ok). */
export function capsOk(sentAts: Date[], now: Date = new Date()): boolean {
  const recent = sentAts.filter((d) => now.getTime() - d.getTime() < 7 * DAY);
  if (recent.length >= ASK_NUDGE_WEEK_CAP) return false;
  if (
    recent.some(
      (d) => now.getTime() - d.getTime() < ASK_NUDGE_GAP_HOURS * 60 * 60 * 1000,
    )
  ) {
    return false;
  }
  return true;
}

/** Stable dedupe key per user+loop, the same thread is never nudged twice. */
export function nudgeDeliveryKey(userId: string, loop: string): string {
  const s = `${userId}\n${loop.trim().toLowerCase()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `ask-nudge-${(h >>> 0).toString(16).padStart(8, "0")}`;
}

// ── Copy (templates only, no LLM) ────────────────────────────────────────

export type NudgeCopy = { title: string; body: string };

export function nudgeCopy(
  loop: string,
  locale: UserLocale = "ka",
  firstName: string | null = null,
): NudgeCopy {
  const l = loop.trim().slice(0, 60);
  if (locale === "en") {
    return {
      title: firstName ? `${firstName}, remember this?` : "Remember this?",
      body: `How's the "${l}" situation going? Your astrologer is here.`,
    };
  }
  return {
    title: firstName ? `${firstName}, ერთი რამ მახსოვს…` : "ერთი რამ მახსოვს…",
    body: `„${l}", როგორ მიდის საქმე? ჩამოდი, რუკას გადავხედოთ.`,
  };
}
