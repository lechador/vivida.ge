import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { generateTarotFollowup, generateTarotReading } from "@/lib/openrouter";

type OpenRouterRequest = {
  messages: Array<{ role: string; content: string }>;
  response_format?: {
    type?: string;
    json_schema?: { strict?: boolean; schema?: Record<string, unknown> };
  };
  provider?: { require_parameters?: boolean };
};

function mockOpenRouter(content: object) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        choices: [{ message: { content: JSON.stringify(content) } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

function requestFrom(fetchMock: ReturnType<typeof vi.spyOn>) {
  const init = fetchMock.mock.calls[0]?.[1];
  return JSON.parse(String(init?.body)) as OpenRouterRequest;
}

describe("tarot OpenRouter prompts", () => {
  beforeEach(() => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("keeps a relationship spread in its supplied positions", async () => {
    const fetchMock = mockOpenRouter({
      headline: "სათაური",
      cards: ["ერთი", "ორი", "სამი"],
      reading: "პასუხი",
      advice: "რჩევა",
      followupSuggestions: [
        "რა მჭირდება ახლა?",
        "რა ქმნის დაძაბულობას?",
        "როგორ დავიწყო საუბარი?",
      ],
    });

    await generateTarotReading({
      question: "როგორ შევქმნა ჯანსაღი ურთიერთობა?",
      cards: [
        {
          position: "ჩემი საჭიროება",
          name: "თასების დედოფალი",
          orientation: "პირდაპირი",
          meaning: "ემოციური სიმწიფე",
        },
        {
          position: "დაძაბულობა",
          name: "ხუთი კვერთხი",
          orientation: "პირდაპირი",
          meaning: "განსხვავებული სურვილები",
        },
        {
          position: "შესაძლო ნაბიჯი",
          name: "ზომიერება",
          orientation: "პირდაპირი",
          meaning: "ბალანსი და მოთმინება",
        },
      ],
      spreadLogic:
        "ურთიერთობის დინამიკა: ჩემი საჭიროება, დაძაბულობა, შესაძლო ნაბიჯი",
      locale: "ka",
    });

    const request = requestFrom(fetchMock);
    expect(request.messages[0]?.content).toContain("პოზიციებს ნუ გადაარქმევ");
    expect(request.messages[0]?.content).not.toContain(
      "3-კარტიან განლაგებას (წარსული/ფესვი",
    );
    expect(request.messages[1]?.content).toContain(
      "1. ჩემი საჭიროება — თასების დედოფალი (პირდაპირი)",
    );
    expect(request.messages[1]?.content).toContain(
      "ურთიერთობის დინამიკა: ჩემი საჭიროება, დაძაბულობა, შესაძლო ნაბიჯი",
    );
    expect(request.response_format).toMatchObject({
      type: "json_schema",
      json_schema: {
        strict: true,
        schema: {
          required: [
            "headline",
            "cards",
            "reading",
            "advice",
            "followupSuggestions",
          ],
          additionalProperties: false,
        },
      },
    });
    expect(request.provider).toEqual({ require_parameters: true });
  });

  it("includes the previous advice when answering a follow-up", async () => {
    const fetchMock = mockOpenRouter({
      answer: "დაზუსტებული პასუხი",
      followupSuggestions: [
        "რომელი ფაქტი გადავამოწმო?",
        "რა რისკი გავითვალისწინო?",
        "როგორ შევადარო ვარიანტები?",
      ],
    });

    await generateTarotFollowup({
      question: "რომელი ნაბიჯია ახლა სასარგებლო?",
      cards: [
        {
          position: "საერთო რჩევა",
          name: "სამართლიანობა",
          orientation: "შებრუნებული",
          meaning: "არასრული ინფორმაცია",
        },
      ],
      reading: "ჯერ ყველა ფაქტი შეაგროვე.",
      advice: "შეადარე პირობები წერილობით.",
      followupQuestion: "კონკრეტულად რა შევამოწმო?",
      previousFollowupQuestions: ["რომელი ინფორმაცია მაკლია?"],
      locale: "ka",
    });

    const request = requestFrom(fetchMock);
    expect(request.messages[1]?.content).toContain(
      "წინა რჩევა: შეადარე პირობები წერილობით.",
    );
    expect(request.messages[1]?.content).toContain(
      "- რომელი ინფორმაცია მაკლია?",
    );
    expect(request.response_format).toMatchObject({
      type: "json_schema",
      json_schema: {
        strict: true,
        schema: {
          required: ["answer", "followupSuggestions"],
          additionalProperties: false,
        },
      },
    });
    expect(request.provider).toEqual({ require_parameters: true });
  });

  it("rejects an incomplete reading instead of returning a partial result", async () => {
    mockOpenRouter({
      headline: "სათაური",
      cards: ["ერთი", "ორი"],
      reading: "პასუხი",
      advice: "რჩევა",
      followupSuggestions: ["ერთი?", "ორი?", "სამი?"],
    });

    await expect(
      generateTarotReading({
        question: "რას უნდა მივაქციო ყურადღება?",
        cards: [
          {
            position: "ფესვი",
            name: "განდეგილი",
            orientation: "პირდაპირი",
            meaning: "შინაგანი ძიება",
          },
          {
            position: "აწმყო",
            name: "ზომიერება",
            orientation: "პირდაპირი",
            meaning: "ბალანსი",
          },
          {
            position: "გზა",
            name: "ვარსკვლავი",
            orientation: "პირდაპირი",
            meaning: "იმედი",
          },
        ],
        locale: "ka",
      }),
    ).rejects.toThrow("missing required fields in tarot reading");
  });
});
