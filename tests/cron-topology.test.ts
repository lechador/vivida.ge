import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards the cron topology itself.
 *
 * Between 2026-08-04 and 2026-10-18 the daily-horoscope blast grew to fill its
 * entire 300s `maxDuration`, and because winback / verify_reminder / birthday /
 * profile_incomplete all ran *after* it inside the same invocation, every one of
 * them silently stopped sending. Nine weeks, zero emails, no alert.
 *
 * The fix was to give the lifecycle jobs their own scheduled invocation. This
 * test fails if they are ever folded back into the blast's request, which would
 * quietly reintroduce the starvation.
 */

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("cron topology", () => {
  it("schedules the lifecycle jobs separately from the email blast", () => {
    const vercel = JSON.parse(read("vercel.json")) as {
      crons: { path: string; schedule: string }[];
    };
    const paths = vercel.crons.map((c) => c.path);

    expect(paths).toContain("/api/cron/lifecycle");
    expect(paths).toContain("/api/cron/daily-horoscope");

    // The lifecycle tick must not collide with the blast's 05:00/05:30 slots,
    // so it gets a fresh function budget rather than sharing one.
    const lifecycle = vercel.crons.find(
      (c) => c.path === "/api/cron/lifecycle",
    );
    expect(lifecycle?.schedule).not.toMatch(/^0 5 /);
  });

  it("keeps the blast endpoint limited to the blast", () => {
    const blast = read("lib/cron/daily-horoscope.ts");

    for (const job of [
      "sendWinbackNudges",
      "sendBirthdayGifts",
      "sendVerificationRenudges",
      "sendProfileIncompleteRenudges",
      "sendDailyPushBlast",
      "sendDailyHoroscopeToLeads",
    ]) {
      expect(blast).not.toContain(job);
    }
  });

  it("runs every lifecycle job from the lifecycle endpoint", () => {
    const lifecycle = read("lib/cron/lifecycle.ts");

    for (const job of [
      "sendWinbackNudges",
      "sendBirthdayGifts",
      "sendVerificationRenudges",
      "sendProfileIncompleteRenudges",
      "sendDailyPushBlast",
      "sendDailyHoroscopeToLeads",
    ]) {
      expect(lifecycle).toContain(job);
    }
  });

  it("isolates each lifecycle job so one failure cannot abort the rest", () => {
    const lifecycle = read("lib/cron/lifecycle.ts");

    // Every job must be individually wrapped: a throw inside one must not stop
    // the others from running. Count the try/catch blocks against the jobs.
    const guarded = lifecycle.match(/try \{/g) ?? [];
    expect(guarded.length).toBeGreaterThanOrEqual(6);
  });

  it("reports delivery health from both endpoints", () => {
    expect(read("lib/cron/lifecycle.ts")).toContain("checkEmailHealth");
    expect(read("lib/cron/daily-horoscope.ts")).toContain("checkEmailHealth");
  });
});

describe("email blast invariants", () => {
  it("drains through the batch API", () => {
    const source = read("lib/email-marketing.ts");
    expect(source).toContain("c.batch.send");
  });

  it("never leaves undelivered rows pending forever", () => {
    const source = read("lib/email-marketing.ts");
    // The expiry path must exist and must be wired into the cron.
    expect(source).toContain("expireStaleDailyRows");
    expect(read("lib/cron/daily-horoscope.ts")).toContain(
      "expireStaleDailyRows",
    );
  });
});
