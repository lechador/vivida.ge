// One-shot: apply migration 0009 directly via the Neon HTTP driver.
// drizzle-kit push needs a TTY (we don't have one here) and drizzle-kit
// migrate hangs because the project has been using `db:push` so the
// migrations journal isn't trusted. This script just executes the SQL.
//
// Idempotent: each statement is wrapped in IF NOT EXISTS / DO blocks so
// running it twice is safe.

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Applying 0009: password_hash + auth_token table…");

  // Postgres doesn't support IF NOT EXISTS on CREATE TYPE; wrap in DO/EXCEPTION.
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_token_purpose') THEN
        CREATE TYPE "public"."auth_token_purpose" AS ENUM('email_verify', 'password_reset');
      END IF;
    END $$;
  `;
  console.log("  ✓ auth_token_purpose enum");

  await sql`
    CREATE TABLE IF NOT EXISTS "auth_token" (
      "token" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "purpose" "auth_token_purpose" NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  console.log("  ✓ auth_token table");

  await sql`
    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password_hash" text
  `;
  console.log("  ✓ user.password_hash column");

  // FK: skip if already exists.
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'auth_token_user_id_user_id_fk'
      ) THEN
        ALTER TABLE "auth_token"
          ADD CONSTRAINT "auth_token_user_id_user_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `;
  console.log("  ✓ auth_token FK");

  await sql`
    CREATE INDEX IF NOT EXISTS "auth_token_user_purpose_idx"
      ON "auth_token" USING btree ("user_id","purpose")
  `;
  console.log("  ✓ auth_token_user_purpose_idx");

  console.log("Done.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
