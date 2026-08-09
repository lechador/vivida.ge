import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// promotePhoto() invalidates the navbar avatar via Next's revalidateTag, which
// needs a request store that doesn't exist outside a Next server. Stub it —
// these tests are about the reordering SQL, not cache plumbing.
vi.mock("@/lib/header-cache", () => ({
  invalidateHeaderForUser: () => {},
}));

import { promotePhoto } from "@/lib/photos-core";

const databaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

/**
 * promotePhoto() used a transaction, which the production neon-http driver
 * rejects outright ("No transactions support in neon-http driver") — so "set
 * as main" was broken in production while every unit test passed. These
 * exercise the single-statement renumbering against a real Postgres.
 */
describeWithDatabase("promotePhoto PostgreSQL integration", () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl, max: 10 });
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM "user" WHERE id LIKE 'test-photo-%'`);
    await pool.end();
  });

  /** Creates a user owning `sortOrders.length` photos, returns their ids. */
  async function createGallery(sortOrders: number[]) {
    const userId = `test-photo-${randomUUID()}`;
    await pool.query(`INSERT INTO "user" (id) VALUES ($1)`, [userId]);
    const ids: string[] = [];
    for (const [i, order] of sortOrders.entries()) {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO profile_photo (id, user_id, key, url, sort_order, ready)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [id, userId, `test-photo-key-${id}`, `https://example.test/${i}.jpg`, order]
      );
      ids.push(id);
    }
    return { userId, ids };
  }

  /** Photo ids for a user, in stored gallery order. */
  async function orderOf(userId: string) {
    const r = await pool.query<{ id: string; sort_order: number }>(
      `SELECT id, sort_order FROM profile_photo WHERE user_id = $1
       ORDER BY sort_order ASC, id ASC`,
      [userId]
    );
    return r.rows;
  }

  it("moves the promoted photo to the front and keeps the rest in order", async () => {
    const { userId, ids } = await createGallery([0, 1, 2, 3]);
    const [a, b, c, d] = ids;

    const result = await promotePhoto(userId, c);
    expect(result).toEqual({ ok: true });

    const rows = await orderOf(userId);
    expect(rows.map((r) => r.id)).toEqual([c, a, b, d]);
    // Contiguous 0..n-1, no gaps or duplicates.
    expect(rows.map((r) => r.sort_order)).toEqual([0, 1, 2, 3]);
  });

  it("is a no-op when the photo is already first", async () => {
    const { userId, ids } = await createGallery([0, 1, 2]);

    await promotePhoto(userId, ids[0]);

    const rows = await orderOf(userId);
    expect(rows.map((r) => r.id)).toEqual(ids);
    expect(rows.map((r) => r.sort_order)).toEqual([0, 1, 2]);
  });

  it("renumbers deterministically when sort orders are tied", async () => {
    const { userId, ids } = await createGallery([0, 0, 0, 0]);
    const promoted = ids[2];

    await promotePhoto(userId, promoted);

    const rows = await orderOf(userId);
    expect(rows[0].id).toBe(promoted);
    expect(rows.map((r) => r.sort_order)).toEqual([0, 1, 2, 3]);
    // The others fall back to id order, which is stable across runs.
    expect(rows.slice(1).map((r) => r.id)).toEqual(
      ids.filter((id) => id !== promoted).sort()
    );
  });

  it("never touches another user's gallery", async () => {
    const mine = await createGallery([0, 1, 2]);
    const theirs = await createGallery([0, 1, 2]);

    await promotePhoto(mine.userId, mine.ids[2]);

    const untouched = await orderOf(theirs.userId);
    expect(untouched.map((r) => r.id)).toEqual(theirs.ids);
    expect(untouched.map((r) => r.sort_order)).toEqual([0, 1, 2]);
  });

  it("refuses a photo the user does not own", async () => {
    const mine = await createGallery([0, 1]);
    const theirs = await createGallery([0, 1]);

    const result = await promotePhoto(mine.userId, theirs.ids[0]);
    expect(result).toEqual({ ok: false, code: "not_found" });

    // And the other user's gallery is still intact.
    const untouched = await orderOf(theirs.userId);
    expect(untouched.map((r) => r.id)).toEqual(theirs.ids);
  });
});
