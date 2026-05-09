CREATE TABLE "daily_email_log" (
	"user_id" text NOT NULL,
	"send_date" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"last_attempt_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_email_log_user_id_send_date_pk" PRIMARY KEY("user_id","send_date")
);
--> statement-breakpoint
ALTER TABLE "daily_email_log" ADD CONSTRAINT "daily_email_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_email_log_send_date_status_idx" ON "daily_email_log" USING btree ("send_date","status");