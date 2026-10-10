CREATE TABLE "bazaar_payment_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"reason" text NOT NULL,
	"sig_prefix" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bazaar_payment_attempt" ADD CONSTRAINT "bazaar_payment_attempt_booking_id_bazaar_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bazaar_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bazaar_payment_attempt_booking_idx" ON "bazaar_payment_attempt" USING btree ("booking_id");