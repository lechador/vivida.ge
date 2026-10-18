import { describe, expect, it } from "vitest";

import { nextTarotAttempt } from "@/lib/tarot/request-attempt";

describe("nextTarotAttempt", () => {
  it("reuses the same request id while the user retries one question", () => {
    const first = nextTarotAttempt(
      null,
      "  რა უნდა დავინახო?  ",
      "situation",
      () => "req-1",
    );
    const retry = nextTarotAttempt(
      first,
      "რა უნდა დავინახო?",
      "situation",
      () => "req-2",
    );

    expect(first).toEqual({
      question: "რა უნდა დავინახო?",
      spreadId: "situation",
      requestId: "req-1",
    });
    expect(retry).toBe(first);
  });

  it("rotates the request id when the spread changes", () => {
    const first = nextTarotAttempt(
      null,
      "რა უნდა დავინახო?",
      "situation",
      () => "req-1",
    );
    const second = nextTarotAttempt(
      first,
      "რა უნდა დავინახო?",
      "relationship",
      () => "req-2",
    );

    expect(second).toEqual({
      question: "რა უნდა დავინახო?",
      spreadId: "relationship",
      requestId: "req-2",
    });
  });

  it("rotates the request id when the question changes", () => {
    const first = nextTarotAttempt(
      null,
      "პირველი კითხვა",
      "situation",
      () => "req-1",
    );
    const second = nextTarotAttempt(
      first,
      "მეორე კითხვა",
      "situation",
      () => "req-2",
    );

    expect(second).toEqual({
      question: "მეორე კითხვა",
      spreadId: "situation",
      requestId: "req-2",
    });
  });
});
