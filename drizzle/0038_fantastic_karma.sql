ALTER TABLE "email_send_log" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "email_send_log" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "email_send_log" ADD COLUMN "status" text DEFAULT 'sent';--> statement-breakpoint
ALTER TABLE "email_send_log" ADD COLUMN "error" text;