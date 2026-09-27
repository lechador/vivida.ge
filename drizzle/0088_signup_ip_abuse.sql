ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "signup_ip_hash" text;
CREATE INDEX IF NOT EXISTS "user_signup_ip_created_idx" ON "user" ("signup_ip_hash", "created_at");
