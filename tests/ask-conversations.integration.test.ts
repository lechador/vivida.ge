import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// "@/db" throws at import time when DATABASE_URL is unset. When
// TEST_DATABASE_URL is also unset this suite skips anyway, so fall back to a
// stub db and avoid failing the whole vitest run on import.
vi.mock("@/db", async (importOriginal) => {
  if (process.env.TEST_DATABASE_URL) {
    return await importOriginal<typeof import("@/db")>();
  }
  return { db: {}, schema: {} };
});

import { touchAskConversation } from "@/lib/ask-conversations";

const databaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

/**
 * touchAskConversation fills the title from the first question only while
 * the stored title is blank. needsConversationTitle() treats whitespace as
 * blank, so the SQL guard must too (btrim) — with a plain `title = ''` a
 * whitespace-only title would never fill.
 */
describeWithDatabase("touchAskConversation PostgreSQL integration", () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl, max: 5 });
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM "user" WHERE id LIKE 'test-ask-%'`);
    await pool.end();
  });

  async function createConversation(title: string) {
    const userId = `test-ask-${randomUUID()}`;
    await pool.query(`INSERT INTO "user" (id) VALUES ($1)`, [userId]);
    const conversationId = randomUUID();
    await pool.query(
      `INSERT INTO ask_conversation (id, user_id, title) VALUES ($1, $2, $3)`,
      [conversationId, userId, title],
    );
    return conversationId;
  }

  async function titleOf(conversationId: string) {
    const r = await pool.query<{ title: string }>(
      `SELECT title FROM ask_conversation WHERE id = $1`,
      [conversationId],
    );
    return r.rows[0]?.title;
  }

  it("fills a whitespace-only title from the first question", async () => {
    const conversationId = await createConversation("   ");

    await touchAskConversation(conversationId, "rogori var urtiertobebshi?");

    expect(await titleOf(conversationId)).toBe("rogori var urtiertobebshi?");
  });

  it("fills an empty title and never overwrites a real one", async () => {
    const emptyId = await createConversation("");
    await touchAskConversation(emptyId, "first question");
    expect(await titleOf(emptyId)).toBe("first question");

    const titledId = await createConversation("existing title");
    await touchAskConversation(titledId, "another question");
    expect(await titleOf(titledId)).toBe("existing title");
  });
});
