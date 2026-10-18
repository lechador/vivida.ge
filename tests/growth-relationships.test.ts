import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: { execute: mocks.execute } }));

import { getGrowthMetrics } from "@/lib/growth-metrics";

const empty = { rows: [] as Array<Record<string, unknown>> };

function queueExecutions(
  relationshipRows: Array<Record<string, unknown>>,
  firstPurchaseRows: Array<Record<string, unknown>> = [],
) {
  mocks.execute
    .mockResolvedValueOnce({ ...empty })
    .mockResolvedValueOnce({ ...empty })
    .mockResolvedValueOnce({ ...empty })
    .mockResolvedValueOnce({ ...empty })
    .mockResolvedValueOnce({ ...empty })
    .mockResolvedValueOnce({ rows: relationshipRows })
    .mockResolvedValueOnce({ rows: firstPurchaseRows });
}

beforeEach(() => {
  mocks.execute.mockReset();
  mocks.execute.mockResolvedValue({ ...empty });
});

describe("growth relationship metrics", () => {
  it("maps invite, subscriber, answer, and weekly-update counts", async () => {
    queueExecutions([
      {
        invites_created: 12,
        invites_accepted: 5,
        weekly_subscribers: 34,
        transit_subscribers: 21,
        answers: 47,
        answer_users: 18,
        weekly_updates: 60,
      },
    ]);

    const metrics = await getGrowthMetrics(28);

    expect(metrics.relationships).toEqual({
      invitesCreated: 12,
      invitesAccepted: 5,
      weeklySubscribers: 34,
      transitSubscribers: 21,
      answers: 47,
      answerUsers: 18,
      weeklyUpdates: 60,
    });
    expect(mocks.execute).toHaveBeenCalledTimes(7);
  });

  it("defaults every relationship metric to zero when the query returns no row", async () => {
    queueExecutions([]);

    const metrics = await getGrowthMetrics(84);

    expect(metrics.relationships).toEqual({
      invitesCreated: 0,
      invitesAccepted: 0,
      weeklySubscribers: 0,
      transitSubscribers: 0,
      answers: 0,
      answerUsers: 0,
      weeklyUpdates: 0,
    });
  });

  it("maps first web purchases and delivered value", async () => {
    queueExecutions([], [
      {
        total: 14,
        credits: 11,
        premium: 3,
        new_registrations: 8,
        returning_users: 6,
        value_delivered_24h: 10,
      },
    ]);

    const metrics = await getGrowthMetrics(28);

    expect(metrics.firstPurchases).toEqual({
      total: 14,
      credits: 11,
      premium: 3,
      newRegistrations: 8,
      returningUsers: 6,
      valueDelivered24h: 10,
    });
  });
});
