import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: {} }));

import { categoryAllowed } from "@/lib/native-push";

const enabled = {
  enabled: true,
  messages: true,
  horoscope: true,
  comments: true,
  reactions: true,
};

describe("native push preferences", () => {
  it("blocks every category when the master switch is off", () => {
    const preferences = { ...enabled, enabled: false };
    expect(categoryAllowed(preferences, "messages")).toBe(false);
    expect(categoryAllowed(preferences, "horoscope")).toBe(false);
    expect(categoryAllowed(preferences, "comments")).toBe(false);
    expect(categoryAllowed(preferences, "reactions")).toBe(false);
  });

  it("allows only categories the user kept enabled", () => {
    const preferences = {
      ...enabled,
      messages: false,
      reactions: false,
    };
    expect(categoryAllowed(preferences, "messages")).toBe(false);
    expect(categoryAllowed(preferences, "horoscope")).toBe(true);
    expect(categoryAllowed(preferences, "comments")).toBe(true);
    expect(categoryAllowed(preferences, "reactions")).toBe(false);
  });

  it("uses the master switch for uncategorized social pushes", () => {
    expect(categoryAllowed(enabled)).toBe(true);
    expect(categoryAllowed({ ...enabled, enabled: false })).toBe(false);
  });
});
