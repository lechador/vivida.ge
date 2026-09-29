ALTER TYPE "public"."notification_kind" ADD VALUE 'ask_nudge';--> statement-breakpoint
ALTER TABLE "ask_user_memory" ADD COLUMN "nudges_enabled" boolean DEFAULT true NOT NULL;