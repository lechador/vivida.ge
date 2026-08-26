CREATE TABLE "experiment_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"experiment" text NOT NULL,
	"variant" text NOT NULL,
	"event_type" text NOT NULL,
	"event_name" text NOT NULL,
	"surface" text NOT NULL,
	"event_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_preference_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic" text NOT NULL,
	"channel" text NOT NULL,
	"event_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reminder_delivery" ADD COLUMN "destination" text DEFAULT '/dashboard' NOT NULL;--> statement-breakpoint
ALTER TABLE "reminder_delivery" ADD COLUMN "status" text DEFAULT 'claimed' NOT NULL;--> statement-breakpoint
ALTER TABLE "reminder_delivery" ADD COLUMN "sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reminder_delivery" ADD COLUMN "failed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reminder_delivery" ADD COLUMN "value_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "experiment_event" ADD CONSTRAINT "experiment_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_preference_event" ADD CONSTRAINT "reminder_preference_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "experiment_event_dedupe_idx" ON "experiment_event" USING btree ("user_id","experiment","event_type","event_name","event_key");--> statement-breakpoint
CREATE INDEX "experiment_event_analysis_idx" ON "experiment_event" USING btree ("experiment","variant","event_type","created_at");--> statement-breakpoint
CREATE INDEX "reminder_preference_event_funnel_idx" ON "reminder_preference_event" USING btree ("event_type","topic","channel","created_at");--> statement-breakpoint
CREATE INDEX "reminder_preference_event_user_idx" ON "reminder_preference_event" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "reminder_delivery_funnel_idx" ON "reminder_delivery" USING btree ("status","topic","channel","created_at");
