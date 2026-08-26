ALTER TYPE "public"."notification_kind" ADD VALUE 'relationship_connected';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'relationship_weekly';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'relationship_transit';--> statement-breakpoint
CREATE TABLE "relationship_checkin_answer" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"week_start" text NOT NULL,
	"question_key" text NOT NULL,
	"user_id" text NOT NULL,
	"answer" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_notification_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"delivery_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_subscription" (
	"partner_id" text NOT NULL,
	"user_id" text NOT NULL,
	"weekly_enabled" boolean DEFAULT false NOT NULL,
	"transit_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relationship_subscription_partner_id_user_id_pk" PRIMARY KEY("partner_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "relationship_weekly_update" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"week_start" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"owner_chart_hash" text NOT NULL,
	"partner_chart_hash" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "linked_user_id" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "invite_token_hash" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "invite_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "invite_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "relationship_checkin_answer" ADD CONSTRAINT "relationship_checkin_answer_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_checkin_answer" ADD CONSTRAINT "relationship_checkin_answer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_notification_delivery" ADD CONSTRAINT "relationship_notification_delivery_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_notification_delivery" ADD CONSTRAINT "relationship_notification_delivery_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_subscription" ADD CONSTRAINT "relationship_subscription_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_subscription" ADD CONSTRAINT "relationship_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_weekly_update" ADD CONSTRAINT "relationship_weekly_update_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "relationship_answer_partner_week_question_user_idx" ON "relationship_checkin_answer" USING btree ("partner_id","week_start","question_key","user_id");--> statement-breakpoint
CREATE INDEX "relationship_answer_partner_week_idx" ON "relationship_checkin_answer" USING btree ("partner_id","week_start");--> statement-breakpoint
CREATE UNIQUE INDEX "relationship_delivery_partner_user_key_idx" ON "relationship_notification_delivery" USING btree ("partner_id","user_id","delivery_key");--> statement-breakpoint
CREATE INDEX "relationship_subscription_user_idx" ON "relationship_subscription" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "relationship_weekly_partner_week_language_idx" ON "relationship_weekly_update" USING btree ("partner_id","week_start","language");--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_linked_user_id_user_id_fk" FOREIGN KEY ("linked_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_linked_user_idx" ON "partner" USING btree ("linked_user_id","deleted_at");--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_invite_token_hash_unique" UNIQUE("invite_token_hash");