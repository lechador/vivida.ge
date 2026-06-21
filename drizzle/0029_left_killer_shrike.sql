CREATE TYPE "public"."pdf_report_status" AS ENUM('pending', 'paid', 'generating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "pdf_report" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'natal' NOT NULL,
	"status" "pdf_report_status" DEFAULT 'pending' NOT NULL,
	"input_hash" text,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'GEL' NOT NULL,
	"comped" boolean DEFAULT false NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"pdf_key" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"ready_at" timestamp with time zone,
	CONSTRAINT "pdf_report_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "pdf_report" ADD CONSTRAINT "pdf_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pdf_report_user_created_idx" ON "pdf_report" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "pdf_report_status_idx" ON "pdf_report" USING btree ("status");