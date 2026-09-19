import { describe, expect, it } from "vitest";

import {
  savePendingTarotQuestion,
  takePendingTarotQuestion,
} from "@/lib/tarot/pending-question";

function memoryStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe("pending tarot question", () => {
  it("round-trips a question and consumes it on take", () => {
    const storage = memoryStorage();

    savePendingTarotQuestion(storage, "  რა უნდა დავინახო?  ");
    expect(takePendingTarotQuestion(storage)).toEqual({
      question: "რა უნდა დავინახო?",
      requestId: null,
      spreadId: null,
    });
    expect(takePendingTarotQuestion(storage)).toBeNull();
  });

  it("round-trips the request id so retries stay idempotent", () => {
    const storage = memoryStorage();

    savePendingTarotQuestion(storage, "რა უნდა დავინახო?", "req-abc-123");
    expect(takePendingTarotQuestion(storage)).toEqual({
      question: "რა უნდა დავინახო?",
      requestId: "req-abc-123",
      spreadId: null,
    });
  });

  it("round-trips the spread so the retry replays the same spread", () => {
    const storage = memoryStorage();

    savePendingTarotQuestion(
      storage,
      "რა უნდა დავინახო?",
      "req-abc-123",
      "relationship",
    );
    expect(takePendingTarotQuestion(storage)).toEqual({
      question: "რა უნდა დავინახო?",
      requestId: "req-abc-123",
      spreadId: "relationship",
    });
  });

  it("ignores stale or malformed payloads", () => {
    const stale = memoryStorage();
    savePendingTarotQuestion(stale, "შეკითხვა");
    expect(
      takePendingTarotQuestion(stale, Date.now() + 31 * 60 * 1000),
    ).toBeNull();

    const malformed = memoryStorage({ "vivida:tarot:pending": "not-json" });
    expect(takePendingTarotQuestion(malformed)).toBeNull();
  });
});
