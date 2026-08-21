CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TABLE "generation_lock" (
	"key" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "generation_lock_expires_idx" ON "generation_lock" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "message_recipient_created_idx" ON "message" USING btree ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX "message_sender_read_idx" ON "message" USING btree ("sender_id","read_at");--> statement-breakpoint
CREATE INDEX "profile_username_trgm_idx" ON "profile" USING gin ("username" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "profile_display_name_trgm_idx" ON "profile" USING gin ("display_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "user_name_trgm_idx" ON "user" USING gin ("name" gin_trgm_ops);
