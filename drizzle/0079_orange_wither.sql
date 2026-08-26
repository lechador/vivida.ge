ALTER TYPE "public"."notification_kind" ADD VALUE 'timing_reminder';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'forecast_reminder';--> statement-breakpoint
CREATE TABLE "reminder_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic" text NOT NULL,
	"channel" text NOT NULL,
	"delivery_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_setting" (
	"user_id" text PRIMARY KEY NOT NULL,
	"transit_push" boolean DEFAULT false NOT NULL,
	"transit_email" boolean DEFAULT false NOT NULL,
	"transit_cadence" text DEFAULT 'weekly' NOT NULL,
	"forecast_push" boolean DEFAULT false NOT NULL,
	"forecast_email" boolean DEFAULT false NOT NULL,
	"relationship_push" boolean DEFAULT true NOT NULL,
	"relationship_email" boolean DEFAULT false NOT NULL,
	"local_hour" integer DEFAULT 9 NOT NULL,
	"weekly_day" integer DEFAULT 1 NOT NULL,
	"calendar_enabled" boolean DEFAULT false NOT NULL,
	"calendar_token" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminder_setting_calendar_token_unique" UNIQUE("calendar_token")
);
--> statement-breakpoint
ALTER TABLE "reminder_delivery" ADD CONSTRAINT "reminder_delivery_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_setting" ADD CONSTRAINT "reminder_setting_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_delivery_user_topic_channel_key_idx" ON "reminder_delivery" USING btree ("user_id","topic","channel","delivery_key");--> statement-breakpoint
CREATE INDEX "reminder_delivery_created_idx" ON "reminder_delivery" USING btree ("created_at");