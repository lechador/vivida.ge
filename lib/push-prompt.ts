/**
 * Client-side state for the push-notification opt-in prompt.
 *
 * Why this exists: push adoption is Vivida's weakest channel — 71 subscriptions
 * lifetime, and 13 against 728 signups in the 28 days to 2026-10-16. Two causes
 * were visible in the code:
 *
 *   1. Dismissal was permanent. `vivida_push_prompt_dismissed = "1"` meant a
 *      user who tapped close once could never be asked again, ever — so anyone
 *      who dismissed early, before they had a reason to want notifications, was
 *      permanently excluded.
 *   2. The prompt only appeared as a static banner on /dashboard and /feed, with
 *      no connection to a moment where the user had just received value.
 *
 * This module keeps dismissal *expiring* and *escalating*: each dismissal buys
 * quiet for longer, but never forever.
 *
 * Reads and writes are all guarded — browsers can disable localStorage, and a
 * storage failure must never break the prompt itself.
 */

const DISMISS_AT_KEY = "vivida_push_prompt_dismissed_at";
const DISMISS_COUNT_KEY = "vivida_push_prompt_dismiss_count";

/** Legacy permanent flag, still honoured once so we do not nag existing users. */
const LEGACY_DISMISS_KEY = "vivida_push_prompt_dismissed";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Quiet period after a dismissal, escalating with repeat dismissals.
 *
 * A first "no" is respected for a month; a second for three; beyond that it
 * settles at six. This is deliberately long — push is a trust channel, and
 * nagging costs more than it gains.
 */
const SNOOZE_STEPS_MS = [30 * DAY_MS, 90 * DAY_MS, 180 * DAY_MS];

function readNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // The in-memory dismissal still applies for this render.
  }
}

export type PushPromptState = {
  /** Number of times the user has dismissed the prompt. */
  dismissCount: number;
  /** Epoch ms until which we stay quiet, or null when no dismissal recorded. */
  snoozedUntil: number | null;
  /** True when it is acceptable to show the prompt. */
  canPrompt: boolean;
};

/** Current prompt state. Pure read — safe to call during render effects. */
export function readPushPromptState(now: number = Date.now()): PushPromptState {
  // Honour the old permanent flag exactly once: treat it as a single dismissal
  // and clear it, so established users enter the escalating schedule rather than
  // being excluded forever.
  let dismissCount = readNumber(DISMISS_COUNT_KEY) ?? 0;
  let dismissedAt = readNumber(DISMISS_AT_KEY);
  try {
    if (localStorage.getItem(LEGACY_DISMISS_KEY) !== null) {
      localStorage.removeItem(LEGACY_DISMISS_KEY);
      if (dismissedAt === null) {
        dismissCount = Math.max(dismissCount, 1);
        dismissedAt = now;
        writeNumber(DISMISS_COUNT_KEY, dismissCount);
        writeNumber(DISMISS_AT_KEY, dismissedAt);
      }
    }
  } catch {
    // ignore
  }

  if (dismissedAt === null) {
    return { dismissCount, snoozedUntil: null, canPrompt: true };
  }

  const step =
    SNOOZE_STEPS_MS[Math.min(dismissCount, SNOOZE_STEPS_MS.length) - 1] ??
    SNOOZE_STEPS_MS[SNOOZE_STEPS_MS.length - 1];
  const snoozedUntil = dismissedAt + step;
  return { dismissCount, snoozedUntil, canPrompt: now >= snoozedUntil };
}

/** Record a dismissal, escalating the quiet period for next time. */
export function recordPushPromptDismissal(now: number = Date.now()): void {
  const dismissCount = (readNumber(DISMISS_COUNT_KEY) ?? 0) + 1;
  writeNumber(DISMISS_COUNT_KEY, dismissCount);
  writeNumber(DISMISS_AT_KEY, now);
}

/**
 * Clear any dismissal.
 *
 * Used when the user has just installed the app: at that moment the reason to
 * want notifications is concrete ("we can reach you now"), so a previous "no"
 * should not block the ask.
 */
export function clearPushPromptDismissal(): void {
  try {
    localStorage.removeItem(DISMISS_AT_KEY);
    localStorage.removeItem(DISMISS_COUNT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Custom event names the push prompt listens to.
 *
 * `vivida:push-value-moment` is dispatched after the user receives something
 * worth coming back for. `vivida:pwa-value-action` and `appinstalled` are
 * existing PWA signals reused so install and notification asks stay in sync.
 */
export const PUSH_VALUE_MOMENT_EVENT = "vivida:push-value-moment";
export const PWA_VALUE_ACTION_EVENT = "vivida:pwa-value-action";
export const PWA_INSTALL_ACCEPTED_EVENT = "vivida:pwa-install-accepted";
