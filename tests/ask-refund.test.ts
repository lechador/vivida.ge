import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  spendCredits: vi.fn(),
  refundCredits: vi.fn(),
  streamChatCompletion: vi.fn(),
  selectResults: [] as unknown[],
}));

function chain(value: unknown): unknown {
  const p = Promise.resolve(value);
  const handler: ProxyHandler<object> = {
    get(_t, key) {
      if (key === "then") return p.then.bind(p);
      if (key === "catch") return p.catch.bind(p);
      return () => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler);
}

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("next/server", () => ({ after: () => {} }));
vi.mock("@/db", () => ({
  db: {
    select: () => chain(mocks.selectResults.shift() ?? []),
    insert: () => chain([{ id: "m1", createdAt: new Date() }]),
  },
}));
vi.mock("@/db/schema", () => ({ charts: {}, chartChatMessages: {} }));
vi.mock("@/lib/credits", () => ({
  CREDIT_COST: { chat: 2 },
  FREE_ALLOWANCE: { chatPerDay: 1 },
  getBalance: async () => 10,
  spendCredits: mocks.spendCredits,
  refundCredits: mocks.refundCredits,
}));
vi.mock("@/lib/premium", () => ({ isPremiumUser: async () => false }));
vi.mock("@/lib/ask-synastry", () => ({ buildSynastryProposal: vi.fn() }));
vi.mock("@/lib/report-salience", () => ({ computeChartSalience: () => ({}) }));
vi.mock("@/lib/chart-chat", () => ({ buildChartChatSystem: () => "sys" }));
vi.mock("@/lib/ask-memory", () => ({
  ASK_DEPTH_TOKENS: { short: 10, normal: 10, deep: 10 },
  buildMemoryBlock: () => "",
  detectDistress: () => false,
  getAskMemory: async () => null,
  inferVerbosity: () => "medium",
  normalizeAskDepth: () => "normal",
  refreshAskMemory: async () => {},
}));
vi.mock("@/lib/ask-conversations", () => ({
  resolveConversation: async () => ({
    conversation: { id: "c1", isolatedMemory: false },
  }),
  touchAskConversation: async () => {},
}));
vi.mock("@/lib/openrouter", () => ({
  isOpenRouterConfigured: () => true,
  streamChatCompletion: mocks.streamChatCompletion,
}));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: async () => {} }));
vi.mock("@/lib/i18n/user-locale", () => ({ getUserLocale: async () => "en" }));
vi.mock("@/lib/library", () => ({ archiveLibraryEntry: async () => {} }));

import { POST } from "@/app/api/ask/route";

function request() {
  return new Request("https://vivida.ge/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "What does my Moon say?" }),
  });
}

async function drain(res: Response) {
  return res.text();
}

describe("POST /api/ask credit refunds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1", name: "Ana" } });
    mocks.spendCredits.mockResolvedValue(true);
    mocks.refundCredits.mockResolvedValue(undefined);
    // chart, history, today's user-message count (over the free allowance)
    mocks.selectResults = [[{ data: {} }], [], [{ n: 1 }]];
  });

  it("refunds the paid message when the stream fails with no answer", async () => {
    mocks.streamChatCompletion.mockImplementation(async function* () {
      throw new Error("upstream down");
    });
    await drain(await POST(request()));
    expect(mocks.spendCredits).toHaveBeenCalledWith("user-1", 2, "spend_chat");
    expect(mocks.refundCredits).toHaveBeenCalledWith(
      "user-1",
      2,
      expect.stringContaining("ask:"),
    );
  });

  it("refunds when the model returns an empty answer", async () => {
    mocks.streamChatCompletion.mockImplementation(async function* () {
      yield "   ";
    });
    await drain(await POST(request()));
    expect(mocks.refundCredits).toHaveBeenCalledTimes(1);
  });

  it("keeps the charge when an answer was delivered", async () => {
    mocks.streamChatCompletion.mockImplementation(async function* () {
      yield "Your Moon is in Cancer.";
    });
    await drain(await POST(request()));
    expect(mocks.refundCredits).not.toHaveBeenCalled();
  });

  it("never refunds the free daily message", async () => {
    mocks.selectResults = [[{ data: {} }], [], [{ n: 0 }]];
    mocks.streamChatCompletion.mockImplementation(async function* () {
      throw new Error("upstream down");
    });
    await drain(await POST(request()));
    expect(mocks.spendCredits).not.toHaveBeenCalled();
    expect(mocks.refundCredits).not.toHaveBeenCalled();
  });
});
