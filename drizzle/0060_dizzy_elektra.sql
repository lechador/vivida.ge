CREATE TABLE "email_campaign_recipient" (
	"campaign_id" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"rewarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_campaign_recipient_campaign_id_user_id_pk" PRIMARY KEY("campaign_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "email_campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"template" text NOT NULL,
	"subject" text NOT NULL,
	"body" text,
	"cta_label" text,
	"cta_url" text,
	"reward_credits" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"launched_at" timestamp with time zone,
	CONSTRAINT "email_campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "email_campaign_recipient" ADD CONSTRAINT "email_campaign_recipient_campaign_id_email_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaign_recipient" ADD CONSTRAINT "email_campaign_recipient_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_campaign_recipient_user_idx" ON "email_campaign_recipient" USING btree ("user_id","completed_at");