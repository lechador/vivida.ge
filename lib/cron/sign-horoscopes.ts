import { NextResponse, type NextRequest } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { db } from "@/db";
import { signHoroscopes, type SignHoroscopePeriod } from "@/db/schema";
import { cronAuthed } from "@/lib/cron/auth";
import { SIGN_HOROSCOPE_PROMPT_VERSION } from "@/lib/openrouter";
import {
  ALL_HOROSCOPE_VIEWS,
  anchorForView,
  periodForView,
  signHoroscopePeriodKey,
} from "@/lib/sign-horoscope";
import { ALL_SLUGS, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

/**
 * Pre-generates the Georgian sign horoscopes the public /zodiac/<sign>/<view>
 * pages render, so a visitor (usually Googlebot) never waits on an AI call.
 *
 * Runs on its OWN schedule and budget: a slow job here must never delay the
 * email blast or lifecycle jobs (see the nine-week starvation incident noted
 * in lib/cron/daily-horoscope.ts).
 */

/** Max concurrent AI generations. */
export const SIGN_HOROSCOPE_CONCURRENCY = 3;

/**
 * Stop STARTING new generations after this long. The route's maxDuration is
 * 300s and an in-flight AI call can take a while, so leave generous headroom.
 */
export const SIGN_HOROSCOPE_BUDGET_MS = 180_000;

export type SignHoroscopeJob = {
  sign: ZodiacSlug;
  period: SignHoroscopePeriod;
  periodKey: string;
  anchor: Date;
};

/** Every (sign, period, periodKey) the public pages request, de-duplicated. */
export function buildSignHoroscopeJobs(now: Date): SignHoroscopeJob[] {
  const seen = new Set<string>();
  const jobs: SignHoroscopeJob[] = [];
  for (const view of ALL_HOROSCOPE_VIEWS) {
    const period = periodForView(view);
    const anchor = anchorForView(view, now);
    const periodKey = signHoroscopePeriodKey(anchor, period);
    for (const sign of ALL_SLUGS) {
      const id = `${sign}:${period}:${periodKey}`;
      if (seen.has(id)) continue;
      seen.add(id);
      jobs.push({ sign, period, periodKey, anchor });
    }
  }
  return jobs;
}

export function jobId(
  job: Pick<SignHoroscopeJob, "sign" | "period" | "periodKey">,
) {
  return `${job.sign}:${job.period}:${job.periodKey}`;
}

/** Jobs without an up-to-date row yet (idempotency: existing rows are skipped). */
export function pendingJobs(
  jobs: SignHoroscopeJob[],
  existingIds: ReadonlySet<string>,
): SignHoroscopeJob[] {
  return jobs.filter((job) => !existingIds.has(jobId(job)));
}

export type BoundedRunResult = {
  generated: number;
  failed: number;
  /** Jobs never started because the time budget ran out. */
  skipped: number;
};

/**
 * Run `work` over `jobs` with bounded concurrency. No new job starts once
 * `budgetMs` has elapsed; in-flight jobs are allowed to finish. A throwing or
 * falsy-returning worker counts as failed and never aborts the others.
 */
export async function runBounded<T>(
  jobs: T[],
  opts: {
    concurrency: number;
    budgetMs: number;
    now?: () => number;
    work: (job: T) => Promise<boolean>;
  },
): Promise<BoundedRunResult> {
  const now = opts.now ?? Date.now;
  const startedAt = now();
  const result: BoundedRunResult = { generated: 0, failed: 0, skipped: 0 };
  let next = 0;

  async function lane() {
    while (next < jobs.length) {
      if (now() - startedAt >= opts.budgetMs) return;
      const job = jobs[next++];
      try {
        if (await opts.work(job)) result.generated++;
        else result.failed++;
      } catch {
        result.failed++;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, opts.concurrency) }, () => lane()),
  );
  result.skipped = jobs.length - next;
  return result;
}

async function existingJobIds(jobs: SignHoroscopeJob[]): Promise<Set<string>> {
  const rows = await db
    .select({
      sign: signHoroscopes.sign,
      period: signHoroscopes.period,
      periodKey: signHoroscopes.periodKey,
    })
    .from(signHoroscopes)
    .where(
      and(
        inArray(signHoroscopes.periodKey, [
          ...new Set(jobs.map((j) => j.periodKey)),
        ]),
        eq(signHoroscopes.promptVersion, SIGN_HOROSCOPE_PROMPT_VERSION),
        eq(signHoroscopes.language, "ka"),
      ),
    );
  return new Set(rows.map((r) => jobId(r as SignHoroscopeJob)));
}

export async function runSignHoroscopeCron(req: NextRequest) {
  if (!cronAuthed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const jobs = buildSignHoroscopeJobs(new Date());
  const todo = pendingJobs(jobs, await existingJobIds(jobs));

  const result = await runBounded(todo, {
    concurrency: SIGN_HOROSCOPE_CONCURRENCY,
    budgetMs: SIGN_HOROSCOPE_BUDGET_MS,
    work: async (job) =>
      (await ensureSignHoroscope(job.sign, job.period, job.anchor)) !== null,
  });

  return NextResponse.json({
    total: jobs.length,
    alreadyDone: jobs.length - todo.length,
    ...result,
  });
}
