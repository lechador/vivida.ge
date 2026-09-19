import { describe, expect, it } from "vitest";

import { nextTarotAttempt } from "@/lib/tarot/request-attempt";

describe("nextTarotAttempt", () => {
  it("reuses the same request id while the user retries one question", () => {
    const first = nextTarotAttempt(
      null,
      "  რა უნდა დავინახო?  ",
      () => "req-1",
    );
    const retry = nextTarotAttempt(first, "რა უნდა დავინახო?", () => "req-2");

    expect(first).toEqual({
      question: "რა უნდა დავინახო?",
      requestId: "req-1",
    });
    expect(retry).toBe(first);
  });

  it("rotates the request id when the question changes", () => {
    const first = nextTarotAttempt(null, "პირველი კითხვა", () => "req-1");
    const second = nextTarotAttempt(first, "მეორე კითხვა", () => "req-2");

    expect(second).toEqual({ question: "მეორე კითხვა", requestId: "req-2" });
  });
});
