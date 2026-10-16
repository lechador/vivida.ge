import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The push prompt used to be dismissed permanently: a single tap on close set
 * `vivida_push_prompt_dismissed = "1"` and the user was excluded forever.
 *
 * With 13 push subscriptions against 728 signups, that mattered — anyone who
 * declined before they had a reason to want notifications could never be asked
 * again. These tests pin the replacement behaviour: quiet periods that escalate
 * but always expire.
 */

const store = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
});

import {
  clearPushPromptDismissal,
  readPushPromptState,
  recordPushPromptDismissal,
} from "@/lib/push-prompt";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 16);
const DISMISS_AT = "vivida_push_prompt_dismissed_at";
const DISMISS_COUNT = "vivida_push_prompt_dismiss_count";
const LEGACY = "vivida_push_prompt_dismissed";

beforeEach(() => {
  store.clear();
});

describe("push prompt state", () => {
  it("allows prompting when nothing has been dismissed", () => {
    expect(readPushPromptState(NOW)).toMatchObject({
      dismissCount: 0,
      snoozedUntil: null,
      canPrompt: true,
    });
  });

  it("stays quiet for 30 days after a first dismissal", () => {
    recordPushPromptDismissal(NOW);

    expect(readPushPromptState(NOW + 1).canPrompt).toBe(false);
    expect(readPushPromptState(NOW + 29 * DAY).canPrompt).toBe(false);
    expect(readPushPromptState(NOW + 31 * DAY).canPrompt).toBe(true);
  });

  it("escalates the quiet period on repeat dismissals", () => {
    recordPushPromptDismissal(NOW);
    recordPushPromptDismissal(NOW + 31 * DAY);

    // Second dismissal buys three months, not one.
    expect(readPushPromptState(NOW + 31 * DAY + 1).canPrompt).toBe(false);
    expect(readPushPromptState(NOW + 31 * DAY + 89 * DAY).canPrompt).toBe(
      false,
    );
    expect(readPushPromptState(NOW + 31 * DAY + 91 * DAY).canPrompt).toBe(true);
  });

  it("caps the quiet period rather than growing without bound", () => {
    for (let i = 0; i < 6; i++) recordPushPromptDismissal(NOW);

    // Settles at six months; it must still expire eventually.
    expect(readPushPromptState(NOW + 100 * DAY).canPrompt).toBe(false);
    expect(readPushPromptState(NOW + 181 * DAY).canPrompt).toBe(true);
  });

  it("counts dismissals for escalation", () => {
    expect(readPushPromptState(NOW).dismissCount).toBe(0);
    recordPushPromptDismissal(NOW);
    recordPushPromptDismissal(NOW);
    expect(readPushPromptState(NOW).dismissCount).toBe(2);
  });

  it("migrates the legacy permanent flag into one dismissal", () => {
    store.set(LEGACY, "1");

    const state = readPushPromptState(NOW);

    // Treated as a single dismissal, so the user enters the escalating
    // schedule instead of being excluded forever.
    expect(state.dismissCount).toBe(1);
    expect(state.canPrompt).toBe(false);
    // The legacy flag is consumed, not left to re-trigger.
    expect(store.has(LEGACY)).toBe(false);
    expect(store.get(DISMISS_COUNT)).toBe("1");
    expect(store.get(DISMISS_AT)).toBe(String(NOW));
  });

  it("clears the quiet period so an install can re-ask immediately", () => {
    recordPushPromptDismissal(NOW);
    recordPushPromptDismissal(NOW);
    expect(readPushPromptState(NOW + DAY).canPrompt).toBe(false);

    clearPushPromptDismissal();

    expect(readPushPromptState(NOW + DAY)).toMatchObject({
      dismissCount: 0,
      snoozedUntil: null,
      canPrompt: true,
    });
  });

  it("ignores corrupt stored values instead of throwing", () => {
    store.set(DISMISS_AT, "not-a-number");
    store.set(DISMISS_COUNT, "nonsense");

    expect(() => readPushPromptState(NOW)).not.toThrow();
    // A corrupt timestamp is treated as no dismissal.
    expect(readPushPromptState(NOW).canPrompt).toBe(true);
  });
});

describe("push prompt is never permanently closed", () => {
  it("always expires, however many times it is dismissed", () => {
    for (let i = 0; i < 20; i++) recordPushPromptDismissal(NOW);

    // The old implementation would return false here forever.
    expect(readPushPromptState(NOW + 400 * DAY).canPrompt).toBe(true);
  });
});
