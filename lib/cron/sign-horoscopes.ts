import { NextResponse, type NextRequest } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import {
  ensureSignHoroscope,
  signHoroscopeStorageKey,
} from "@/actions/sign-horoscope";
import { db } from "@/db";
import { signHoroscopes, type SignHoroscopePeriod } from "@/db/schema";
import { cronAuthed } from "@/lib/cron/auth";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { SIGN_HOROSCOPE_PROMPT_VERSION } from "@/lib/openrouter";
import {
  ALL_HOROSCOPE_VIEWS,
  anchorForView,
  periodForView,
  signHoroscopePeriodKey,
} from "@/lib/sign-horoscope";
import { ALL_SLUGS, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

/**
 * Pre-generates the sign horoscopes the public /zodiac/<sign>/<view> pages
 * render (Georgian on vivida.ge, English on vividaastro.com), plus today's
 * Polish reading for the Polish lead email, so a visitor (usually Googlebot)
 * never waits on an AI call.
 *
 * Runs on its OWN schedule and budget: a slow job here must never delay the
 * email blast or lifecycle jobs (see the nine-week starvation incident noted
 * in lib/cron/daily-horoscope.ts).
 */

/** Max concurrent AI generations. */
export const SIGN_HOROSCOPE_CONCURRENCY = 5;

/**
 * Stop STARTING new generations after this long. The route's maxDuration is
 * 300s and an in-flight AI call can take a while, so leave generous headroom.
 */
export const SIGN_HOROSCOPE_BUDGET_MS = 180_000;

export type SignHoroscopeJob = {
  language: UserLocale;
  sign: ZodiacSlug;
  period: SignHoroscopePeriod;
  periodKey: string;
  anchor: Date;
};

/**
 * Which views each language needs. Georgian and English back every public
 * page; Polish has no per-sign pages yet and only feeds today's lead email.
 * Order matters: the time budget may run out, and Georgian (the indexed
 * traffic) goes first.
 */
const LANGUAGE_VIEWS: ReadonlyArray<
  [UserLocale, ReadonlyArray<(typeof ALL_HOROSCOPE_VIEWS)[number]>]
> = [
  ["ka", ALL_HOROSCOPE_VIEWS],
  ["pl", ["today"]],
  ["en", ALL_HOROSCOPE_VIEWS],
];

/** Every (language, sign, period, periodKey) to pre-generate, de-duplicated. */
export function buildSignHoroscopeJobs(now: Date): SignHoroscopeJob[] {
  const seen = new Set<string>();
  const jobs: SignHoroscopeJob[] = [];
  for (const [language, views] of LANGUAGE_VIEWS) {
    for (const view of views) {
      const period = periodForView(view);
      const anchor = anchorForView(view, now);
      const periodKey = signHoroscopePeriodKey(anchor, period);
      for (const sign of ALL_SLUGS) {
        const job = { language, sign, period, periodKey, anchor };
        const id = jobId(job);
        if (seen.has(id)) continue;
        seen.add(id);
        jobs.push(job);
      }
    }
  }
  return jobs;
}

export function jobId(
  job: Pick<SignHoroscopeJob, "language" | "sign" | "period" | "periodKey">,
) {
  return `${job.language}:${job.sign}:${job.period}:${job.periodKey}`;
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
  const storageKeys = [
    ...new Set(
      jobs.map((j) => signHoroscopeStorageKey(j.periodKey, j.language)),
    ),
  ];
  const rows = await db
    .select({
      sign: signHoroscopes.sign,
      period: signHoroscopes.period,
      periodKey: signHoroscopes.periodKey,
      language: signHoroscopes.language,
    })
    .from(signHoroscopes)
    .where(
      and(
        inArray(signHoroscopes.periodKey, storageKeys),
        eq(signHoroscopes.promptVersion, SIGN_HOROSCOPE_PROMPT_VERSION),
      ),
    );
  return new Set(
    rows.map((r) => {
      const language = r.language as UserLocale;
      // Strip the "en:"/"pl:" storage prefix back to the plain period key.
      const periodKey =
        language === "ka"
          ? r.periodKey
          : r.periodKey.slice(language.length + 1);
      return jobId({
        language,
        sign: r.sign as ZodiacSlug,
        period: r.period as SignHoroscopePeriod,
        periodKey,
      });
    }),
  );
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
      (await ensureSignHoroscope(
        job.sign,
        job.period,
        job.anchor,
        job.language,
      )) !== null,
  });

  return NextResponse.json({
    total: jobs.length,
    alreadyDone: jobs.length - todo.length,
    ...result,
  });
}
