ALTER TABLE "partner" ADD COLUMN "deep_report" jsonb;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "deep_viewer_hash" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "deep_model" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "deep_generated_at" timestamp with time zone;