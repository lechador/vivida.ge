import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * The "every user sees the popup exactly once" invariant, exercised against a
 * real database through the same code path the API route uses.
 *
 * Opt-in (SURVEY_TEST_LIVE_DB=1) because it writes to whatever DATABASE_URL
 * points at — normally the production Neon branch. It creates and removes its
 * own throwaway users and touches nothing else:
 *
 *   SURVEY_TEST_LIVE_DB=1 node --env-file=.env.local \
 *     ./node_modules/.bin/vitest run tests/survey-once.integration.test.ts
 *
 * @/db is imported lazily — it throws on a missing DATABASE_URL, which would
 * fail this file at load time even when the suite is skipped.
 */
const live = process.env.SURVEY_TEST_LIVE_DB === "1";
const describeLive = live ? describe : describe.skip;

const SURVEY = `test_survey_${randomUUID().slice(0, 8)}`;

describeLive("one-shot survey", () => {
  let db: typeof import("@/db")["db"];
  let schema: typeof import("@/db/schema");
  let survey: typeof import("@/lib/survey");
  const created: string[] = [];

  beforeAll(async () => {
    ({ db } = await import("@/db"));
    schema = await import("@/db/schema");
    survey = await import("@/lib/survey");
  });

  afterAll(async () => {
    for (const id of created) {
      await db.delete(schema.users).where(eq(schema.users.id, id));
    }
  });

  async function newUser() {
    const id = `test-survey-${randomUUID()}`;
    await db.insert(schema.users).values({ id });
    created.push(id);
    return id;
  }

  function readRow(userId: string) {
    return db
      .select()
      .from(schema.surveyResponses)
      .where(
        and(
          eq(schema.surveyResponses.userId, userId),
          eq(schema.surveyResponses.surveyKey, SURVEY)
        )
      );
  }

  it("shows once: concurrent renders collapse into a single row", async () => {
    const userId = await newUser();
    expect(await survey.hasSeenSurvey(userId, SURVEY)).toBe(false);

    // Two tabs open at the same moment.
    await Promise.all([
      survey.recordSurveyResponse({ userId, surveyKey: SURVEY, action: "shown" }),
      survey.recordSurveyResponse({ userId, surveyKey: SURVEY, action: "shown" }),
    ]);

    const rows = await readRow(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("shown");
    // Seen is seen — the popup never comes back, even unanswered.
    expect(await survey.hasSeenSurvey(userId, SURVEY)).toBe(true);
  });

  it("upgrades the placeholder row when the user submits", async () => {
    const userId = await newUser();
    await survey.recordSurveyResponse({ userId, surveyKey: SURVEY, action: "shown" });
    await survey.recordSurveyResponse({
      userId,
      surveyKey: SURVEY,
      action: "submitted",
      choice: "yes",
      feedback: "  მეტი ფუნქცია მინდა  ",
    });

    const [row] = await readRow(userId);
    expect(row.status).toBe("submitted");
    expect(row.choice).toBe("yes");
    expect(row.feedback).toBe("მეტი ფუნქცია მინდა"); // trimmed
    expect(row.respondedAt).toBeInstanceOf(Date);
  });

  it("never lets a late write clobber a recorded answer", async () => {
    const userId = await newUser();
    await survey.recordSurveyResponse({ userId, surveyKey: SURVEY, action: "shown" });
    await survey.recordSurveyResponse({
      userId,
      surveyKey: SURVEY,
      action: "submitted",
      choice: "maybe",
      feedback: "keep this",
    });

    // A second tab's dismissal arriving after the submit.
    await survey.recordSurveyResponse({
      userId,
      surveyKey: SURVEY,
      action: "dismissed",
    });

    const [row] = await readRow(userId);
    expect(row.status).toBe("submitted");
    expect(row.feedback).toBe("keep this");
    expect(row.choice).toBe("maybe");
  });

  it("records a dismissal with no answers", async () => {
    const userId = await newUser();
    await survey.recordSurveyResponse({ userId, surveyKey: SURVEY, action: "shown" });
    await survey.recordSurveyResponse({
      userId,
      surveyKey: SURVEY,
      action: "dismissed",
    });

    const [row] = await readRow(userId);
    expect(row.status).toBe("dismissed");
    expect(row.choice).toBeNull();
    expect(row.feedback).toBeNull();
    expect(await survey.hasSeenSurvey(userId, SURVEY)).toBe(true);
  });
});
