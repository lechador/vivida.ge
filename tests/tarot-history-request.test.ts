import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  listLibraryEntries: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/library", () => ({
  listLibraryEntries: mocks.listLibraryEntries,
}));

import { GET } from "@/app/api/tarot/history/route";

const entry = {
  id: "lib-1",
  title: "წარსულის შუქზე",
  summary: "რას მიპირებს ეს ურთიერთობა?",
  createdAt: new Date("2026-09-18T10:00:00.000Z"),
  content: {
    type: "tarot",
    question: "რას მიპირებს ეს ურთიერთობა?",
    cards: [
      {
        slug: "the-fool",
        name: "ბრიყვი",
        glyph: "🃏",
        image: "/tarot/the-fool.webp",
        reversed: false,
        position: "წარსული / ფესვი",
        interpretation: "ახალი დასაწყისი.",
      },
    ],
    reading: "სრული პასუხი.",
    advice: "რჩევა.",
    charged: 0,
    free: true,
    degraded: false,
    spreadId: "situation",
    followups: [{ question: "კიდევ?", answer: "კიდევ პასუხი." }],
  },
};

describe("GET /api/tarot/history", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.listLibraryEntries.mockResolvedValue({
      items: [entry],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
      counts: {},
    });
  });

  it("requires authentication", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mocks.listLibraryEntries).not.toHaveBeenCalled();
  });

  it("returns the user's recent tarot readings newest first", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.listLibraryEntries).toHaveBeenCalledWith("user-1", {
      filter: "tarot",
      page: 1,
      pageSize: 10,
    });
    const body = (await response.json()) as {
      items: Array<{
        id: string;
        question: string;
        headline: string;
        createdAt: string;
      }>;
    };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "lib-1",
      question: "რას მიპირებს ეს ურთიერთობა?",
      headline: "წარსულის შუქზე",
    });
    expect(body.items[0].createdAt).toBe("2026-09-18T10:00:00.000Z");
  });

  it("returns an empty list when the user has no readings", async () => {
    mocks.listLibraryEntries.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
      counts: {},
    });

    const response = await GET();
    const body = (await response.json()) as { items: unknown[] };

    expect(response.status).toBe(200);
    expect(body.items).toEqual([]);
  });
});
