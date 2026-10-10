ALTER TYPE "public"."notification_kind" ADD VALUE 'booking_paid';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'reading_delivered';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bazaar_updates" boolean DEFAULT true NOT NULL;