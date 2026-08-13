import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EMPTY_DAILY_RITUAL,
  isDailyRitualComplete,
  readDailyRitual,
  saveDailyRitual,
} from "../lib/daily-ritual";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("daily ritual browser state", () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = {
      localStorage: new MemoryStorage(),
    };
    vi.spyOn(Date, "now").mockReturnValue(1_800_000_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as { window?: unknown }).window;
  });

  it("persists progress for the same user and day", () => {
    const state = {
      horoscopeRead: true,
      moonRead: true,
      focus: "სიცხადე",
    };
    expect(saveDailyRitual("user-1", "2026-08-09", state)).toBe(true);
    expect(readDailyRitual("user-1", "2026-08-09")).toEqual(state);
  });

  it("resets progress on a new day", () => {
    saveDailyRitual("user-1", "2026-08-09", {
      horoscopeRead: true,
      moonRead: true,
      focus: "სიმშვიდე",
    });
    expect(readDailyRitual("user-1", "2026-08-10")).toEqual(
      EMPTY_DAILY_RITUAL
    );
  });

  it("keeps different users isolated", () => {
    saveDailyRitual("user-1", "2026-08-09", {
      horoscopeRead: true,
      moonRead: false,
      focus: null,
    });
    expect(readDailyRitual("user-2", "2026-08-09")).toEqual(
      EMPTY_DAILY_RITUAL
    );
  });

  it("requires every available ritual step", () => {
    const withoutMoon = {
      horoscopeRead: true,
      moonRead: false,
      focus: "გაბედულება",
    };
    expect(isDailyRitualComplete(withoutMoon, false)).toBe(true);
    expect(isDailyRitualComplete(withoutMoon, true)).toBe(false);
    expect(
      isDailyRitualComplete({ ...withoutMoon, moonRead: true }, true)
    ).toBe(true);
  });

  it("uses the account completion as the cross-device source of truth", () => {
    expect(isDailyRitualComplete(EMPTY_DAILY_RITUAL, true, true)).toBe(true);
    expect(isDailyRitualComplete(EMPTY_DAILY_RITUAL, true, false)).toBe(false);
  });
});
