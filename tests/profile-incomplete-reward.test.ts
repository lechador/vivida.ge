import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@react-email/render";
import { createElement } from "react";

const mocks = vi.hoisted(() => ({
  selects: [] as unknown[],
  inserts: [] as { table: unknown; values: unknown }[],
  updates: [] as unknown[],
  grantCredits: vi.fn(),
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

vi.mock("@/db", () => ({
  db: {
    select: () => chain(mocks.selects.shift() ?? []),
    update: () => ({
      set: (v: unknown) => {
        mocks.updates.push(v);
        return chain([{ campaignId: "camp-1" }]);
      },
    }),
    insert: (table: unknown) => ({
      values: (values: unknown) => {
        mocks.inserts.push({ table, values });
        return chain([{ id: "camp-1" }]);
      },
    }),
  },
}));
vi.mock("@/lib/credits", () => ({ grantCredits: mocks.grantCredits }));

import {
  PROFILE_INCOMPLETE_CAMPAIGN_SLUG,
  completeEligibleEmailCampaigns,
  enrolProfileIncompleteRecipient,
} from "@/lib/email-campaigns";
import { WelcomeEmail } from "@/lib/email-templates/welcome";

describe("profile_incomplete bonus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selects = [];
    mocks.inserts = [];
    mocks.updates = [];
  });

  it("enrols the recipient in a 50-credit campaign and a recipient row", async () => {
    await enrolProfileIncompleteRecipient("u1", "a@b.ge");
    expect(mocks.inserts).toHaveLength(2);
    expect(mocks.inserts[0].values).toMatchObject({
      slug: PROFILE_INCOMPLETE_CAMPAIGN_SLUG,
      rewardCredits: 50,
      status: "active",
    });
    expect(mocks.inserts[1].values).toMatchObject({
      campaignId: "camp-1",
      userId: "u1",
      email: "a@b.ge",
    });
  });

  it("pays 50 credits once the profile has a birth date", async () => {
    mocks.selects = [
      [
        {
          campaignId: "camp-1",
          reward: 50,
          slug: PROFILE_INCOMPLETE_CAMPAIGN_SLUG,
        },
      ],
      [{ dob: "1990-01-01" }],
    ];
    await completeEligibleEmailCampaigns("u1");
    expect(mocks.grantCredits).toHaveBeenCalledWith(
      "u1",
      50,
      "campaign_reward",
      "email-campaign:camp-1",
    );
  });

  it("does not pay on a plain visit or purchase (no birth date yet)", async () => {
    mocks.selects = [
      [
        {
          campaignId: "camp-1",
          reward: 50,
          slug: PROFILE_INCOMPLETE_CAMPAIGN_SLUG,
        },
      ],
      [{ dob: null }],
    ];
    await completeEligibleEmailCampaigns("u1");
    expect(mocks.grantCredits).not.toHaveBeenCalled();
    expect(mocks.updates).toHaveLength(0);
  });
});

describe("welcome email copy", () => {
  it.each(["ka", "en", "pl"] as const)(
    "does not promise a free compatibility comparison (%s)",
    async (locale) => {
      const html = await render(
        createElement(WelcomeEmail, {
          name: "Ana",
          dashboardUrl: "https://vivida.ge/dashboard",
          locale,
        }),
      );
      expect(html).not.toMatch(/first compatibility/i);
      expect(html).not.toContain("თავსებადობის პირველი");
      expect(html).not.toContain("Pierwsze porównanie");
      expect(html).toMatch(
        /first tarot reading is free|ტაროს პირველი კითხვა უფასოა|Pierwszy rozkład tarota jest bezpłatny/,
      );
    },
  );
});
