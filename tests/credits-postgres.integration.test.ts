import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

describeWithDatabase("credit wallet PostgreSQL integration", () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl, max: 20 });
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM "user" WHERE id LIKE 'test-credit-%'`);
    await pool.end();
  });

  async function createWallet(balance: number) {
    const userId = `test-credit-${randomUUID()}`;
    await pool.query(`INSERT INTO "user" (id) VALUES ($1)`, [userId]);
    await pool.query(
      `INSERT INTO credit_account (user_id, balance) VALUES ($1, $2)`,
      [userId, balance]
    );
    return userId;
  }

  async function spendOnce(userId: string, cost: number, ref: string) {
    const result = await pool.query<{
      result_status: "already" | "unlocked" | "insufficient";
      resulting_balance: number;
    }>(
      `SELECT * FROM vivida_spend_credits_once($1, $2, $3, $4, $5)`,
      [userId, cost, "spend_iq", ref, randomUUID()]
    );
    return result.rows[0];
  }

  it("charges one idempotent unlock exactly once under concurrency", async () => {
    const userId = await createWallet(20);

    const results = await Promise.all(
      Array.from({ length: 12 }, () => spendOnce(userId, 5, "result-1"))
    );

    expect(results.filter((row) => row.result_status === "unlocked")).toHaveLength(1);
    expect(results.filter((row) => row.result_status === "already")).toHaveLength(11);

    const account = await pool.query<{ balance: number }>(
      `SELECT balance FROM credit_account WHERE user_id = $1`,
      [userId]
    );
    const ledger = await pool.query<{ amount: number }>(
      `SELECT amount FROM credit_transaction
       WHERE user_id = $1 AND reason = 'spend_iq' AND ref = 'result-1'`,
      [userId]
    );
    expect(account.rows[0]?.balance).toBe(15);
    expect(ledger.rows).toEqual([{ amount: -5 }]);
  });

  it("never lets competing unlocks drive the balance below zero", async () => {
    const userId = await createWallet(5);

    const results = await Promise.all([
      spendOnce(userId, 5, "result-a"),
      spendOnce(userId, 5, "result-b"),
    ]);

    expect(results.map((row) => row.result_status).sort()).toEqual([
      "insufficient",
      "unlocked",
    ]);
    const account = await pool.query<{ balance: number }>(
      `SELECT balance FROM credit_account WHERE user_id = $1`,
      [userId]
    );
    const ledger = await pool.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM credit_transaction WHERE user_id = $1`,
      [userId]
    );
    expect(account.rows[0]?.balance).toBe(0);
    expect(ledger.rows[0]?.count).toBe(1);
  });

  it("credits one Stripe session exactly once under concurrent retries", async () => {
    const userId = await createWallet(0);

    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        pool.query<{ was_granted: boolean; resulting_balance: number }>(
          `SELECT * FROM vivida_grant_purchase_credits($1, $2, $3, $4)`,
          [userId, 30, "cs_retry", randomUUID()]
        )
      )
    );

    expect(results.filter((result) => result.rows[0]?.was_granted)).toHaveLength(1);
    const account = await pool.query<{ balance: number }>(
      `SELECT balance FROM credit_account WHERE user_id = $1`,
      [userId]
    );
    const ledger = await pool.query<{ count: number; amount: number }>(
      `SELECT count(*)::int AS count, sum(amount)::int AS amount
       FROM credit_transaction
       WHERE user_id = $1 AND reason = 'purchase' AND ref = 'cs_retry'`,
      [userId]
    );
    expect(account.rows[0]?.balance).toBe(30);
    expect(ledger.rows[0]).toEqual({ count: 1, amount: 30 });
  });
});
