ALTER TABLE "user" ADD COLUMN "verified_badge_granted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verified_badge_granted_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verified_badge_email_sent_at" timestamp with time zone;