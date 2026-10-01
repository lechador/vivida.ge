ALTER TABLE "user" ADD COLUMN "sms_marketing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "sms_marketing_consented_at" timestamp with time zone;