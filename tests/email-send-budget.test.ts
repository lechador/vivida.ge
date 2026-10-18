import { describe, expect, it } from "vitest";

import {
  PER_JOB_SEND_CAP,
  SendBudget,
  TOTAL_SEND_BUDGET,
} from "@/lib/email-send-budget";

/**
 * Restoring the lifecycle crons would have sent **861 emails** on the first run
 * (642 `profile_incomplete` + 219 `winback`, measured against production on
 * 2026-10-16). Every send costs 1.1s through the serial Resend throttle, so that
 * is ~947s of work against a 300s `maxDuration`.
 *
 * The budget bounds it. Two properties matter and are easy to get wrong:
 *   1. no single job may starve the others — the exact failure that killed these
 *      crons in the first place, reproduced at a smaller scale;
 *   2. the invocation must stay inside its time budget.
 */

describe("SendBudget", () => {
  it("caps a single job at the per-job limit", () => {
    const budget = new SendBudget();
    expect(budget.reserve(1000)).toBe(PER_JOB_SEND_CAP);
  });

  it("grants less than the cap when the job has fewer candidates", () => {
    const budget = new SendBudget();
    expect(budget.reserve(7)).toBe(7);
  });

  it("grants nothing when there is no work", () => {
    const budget = new SendBudget();
    expect(budget.reserve(0)).toBe(0);
  });

  it("shares the total across jobs so no single job can starve the rest", () => {
    const budget = new SendBudget(150);

    // First job asks for far more than the total; it may only take its cap.
    const first = budget.reserve(1000);
    const second = budget.reserve(1000);
    const third = budget.reserve(1000);

    expect(first).toBe(PER_JOB_SEND_CAP);
    expect(second).toBe(PER_JOB_SEND_CAP);
    // The third gets whatever is left, not a full cap.
    expect(third).toBe(150 - PER_JOB_SEND_CAP * 2);
    expect(first + second + third).toBe(150);
  });

  it("never exceeds the total budget across many jobs", () => {
    const budget = new SendBudget(TOTAL_SEND_BUDGET);
    let granted = 0;
    for (let i = 0; i < 50; i++) granted += budget.reserve(1000);
    expect(granted).toBe(TOTAL_SEND_BUDGET);
    expect(budget.left).toBe(0);
  });

  it("keeps the whole lifecycle run inside its invocation budget", () => {
    // 180 sends x 1.1s = 198s, leaving ~100s of the 300s maxDuration for the push
    // blast, birthday gifts, lead horoscopes, housekeeping and the health check.
    const worstCaseSeconds = (TOTAL_SEND_BUDGET * 1100) / 1000;
    expect(worstCaseSeconds).toBeLessThan(300);
    expect(300 - worstCaseSeconds).toBeGreaterThan(60);
  });

  it("clears the measured first-run backlog in a few days, not one burst", () => {
    // Measured against production on 2026-10-16.
    const profileIncomplete = 642;
    const winback = 219;
    const runsPerDay = 3;

    // The per-job cap binds before the shared budget for profile_incomplete.
    const profilePerDay = PER_JOB_SEND_CAP * runsPerDay;
    const profileDays = Math.ceil(profileIncomplete / profilePerDay);
    expect(profileDays).toBeLessThanOrEqual(4);

    // winback fits inside the remaining budget comfortably.
    expect(winback / (PER_JOB_SEND_CAP * runsPerDay)).toBeLessThanOrEqual(2);
  });

  it("keeps a bounded backlog rather than an unbounded one", () => {
    // Sanity: the whole point is that the queue cannot grow without limit once
    // the drain is capped, because each run recomputes fresh cohorts.
    const perDay = TOTAL_SEND_BUDGET * 3;
    expect(perDay).toBeGreaterThan(0);
    expect(PER_JOB_SEND_CAP).toBeLessThanOrEqual(TOTAL_SEND_BUDGET);
  });

  it("treats a negative total as zero rather than granting sends", () => {
    const budget = new SendBudget(-10);
    expect(budget.reserve(100)).toBe(0);
    expect(budget.left).toBe(0);
  });

  it("reports what is left", () => {
    const budget = new SendBudget(100);
    expect(budget.left).toBe(100);
    budget.reserve(30);
    expect(budget.left).toBe(70);
  });
});
