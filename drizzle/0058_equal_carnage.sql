CREATE TABLE "horoscope_lead" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"sun_sign" integer NOT NULL,
	"big" text,
	"source" text DEFAULT 'natal_calculator' NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"last_sent_date" text,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "horoscope_lead_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "horoscope_lead_active_idx" ON "horoscope_lead" USING btree ("unsubscribed_at");