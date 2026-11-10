import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/actions/sign-horoscope", () => ({ ensureSignHoroscope: vi.fn() }));

import {
  buildSignHoroscopeJobs,
  jobId,
  pendingJobs,
  runBounded,
} from "@/lib/cron/sign-horoscopes";

const NOW = new Date("2026-11-10T04:00:00Z");

describe("buildSignHoroscopeJobs", () => {
  it("covers 12 signs x 6 public views with unique period keys", () => {
    const jobs = buildSignHoroscopeJobs(NOW);
    expect(jobs).toHaveLength(72);
    expect(new Set(jobs.map(jobId)).size).toBe(72);
    const keys = new Set(jobs.map((j) => `${j.period}:${j.periodKey}`));
    expect(keys).toEqual(
      new Set([
        "day:2026-11-10",
        "day:2026-11-11",
        "week:2026-W46",
        "week:2026-W47",
        "month:2026-11",
        "month:2026-12",
      ]),
    );
  });
});

describe("pendingJobs (idempotency)", () => {
  it("skips jobs whose row already exists", () => {
    const jobs = buildSignHoroscopeJobs(NOW);
    const existing = new Set(jobs.slice(0, 70).map(jobId));
    expect(pendingJobs(jobs, existing)).toEqual(jobs.slice(70));
    expect(pendingJobs(jobs, new Set(jobs.map(jobId)))).toEqual([]);
  });
});

describe("runBounded", () => {
  it("never exceeds the concurrency limit", async () => {
    let active = 0;
    let peak = 0;
    const res = await runBounded(
      Array.from({ length: 10 }, (_, i) => i),
      {
        concurrency: 3,
        budgetMs: 1e9,
        work: async () => {
          peak = Math.max(peak, ++active);
          await new Promise((r) => setTimeout(r, 5));
          active--;
          return true;
        },
      },
    );
    expect(peak).toBe(3);
    expect(res).toEqual({ generated: 10, failed: 0, skipped: 0 });
  });

  it("stops starting jobs once the time budget is spent", async () => {
    let clock = 0;
    const res = await runBounded([1, 2, 3, 4, 5, 6], {
      concurrency: 1,
      budgetMs: 100,
      now: () => clock,
      work: async () => {
        clock += 60;
        return true;
      },
    });
    expect(res).toEqual({ generated: 2, failed: 0, skipped: 4 });
  });

  it("counts failures and throws without aborting other jobs", async () => {
    const res = await runBounded([1, 2, 3], {
      concurrency: 2,
      budgetMs: 1e9,
      work: async (n) => {
        if (n === 1) throw new Error("boom");
        return n !== 2;
      },
    });
    expect(res).toEqual({ generated: 1, failed: 2, skipped: 0 });
  });
});

describe("cron schedule", () => {
  it("runs on its own entry before the 05:00 email blast", async () => {
    const { readFileSync } = await import("node:fs");
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      crons: { path: string; schedule: string }[];
    };
    const entry = vercel.crons.find(
      (c) => c.path === "/api/cron/sign-horoscopes",
    );
    expect(entry?.schedule).toBe("0 4 * * *");
  });
});
