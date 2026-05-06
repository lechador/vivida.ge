ALTER TABLE "user" ADD COLUMN "email_daily_horoscope" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_marketing" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_nudges" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "unsubscribe_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_unsubscribe_token_unique" UNIQUE("unsubscribe_token");