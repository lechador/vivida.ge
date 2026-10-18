import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PENDING_NATAL_PROFILE_TTL_MS,
  clearPendingNatalProfile,
  readPendingNatalProfile,
  savePendingNatalProfile,
  type PendingNatalProfile,
} from "../lib/pending-natal-profile";

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

const draft: PendingNatalProfile = {
  dateOfBirth: "1994-05-17",
  timeOfBirth: "08:35",
  place: {
    id: 611717,
    name: "Tbilisi",
    displayName: "თბილისი, საქართველო",
    country: "საქართველო",
    countryCode: "GE",
    admin1: "Tbilisi",
    latitude: 41.6941,
    longitude: 44.8337,
    timezone: "Asia/Tbilisi",
  },
};

describe("pending natal profile", () => {
  beforeEach(() => {
    const sessionStorage = new MemoryStorage();
    (globalThis as { window?: unknown }).window = { sessionStorage };
    vi.spyOn(Date, "now").mockReturnValue(1_800_000_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as { window?: unknown }).window;
  });

  it("round-trips a valid calculator draft", () => {
    expect(savePendingNatalProfile(draft)).toBe(true);
    expect(readPendingNatalProfile()).toEqual(draft);
  });

  it("accepts an unknown birth time", () => {
    const unknown = { ...draft, timeOfBirth: null };
    savePendingNatalProfile(unknown);
    expect(readPendingNatalProfile()).toEqual(unknown);
  });

  it("expires and removes stale sensitive data", () => {
    savePendingNatalProfile(draft);
    vi.mocked(Date.now).mockReturnValue(
      1_800_000_000_000 + PENDING_NATAL_PROFILE_TTL_MS + 1
    );
    expect(readPendingNatalProfile()).toBeNull();
  });

  it("clears the draft explicitly", () => {
    savePendingNatalProfile(draft);
    clearPendingNatalProfile();
    expect(readPendingNatalProfile()).toBeNull();
  });
});
