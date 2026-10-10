CREATE TABLE "bazaar_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"buyer_user_id" text NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"price_usdc_cents" integer NOT NULL,
	"provider_wallet" text NOT NULL,
	"buyer_note" text DEFAULT '' NOT NULL,
	"delivery_text" text,
	"payer_wallet" text,
	"tx_signature" text,
	"tx_verified_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bazaar_booking_tx_signature_unique" UNIQUE("tx_signature")
);
--> statement-breakpoint
CREATE TABLE "bazaar_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"specialties" text DEFAULT '' NOT NULL,
	"solana_wallet" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"avg_rating_100" integer,
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bazaar_provider_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "bazaar_review" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"service_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"buyer_user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bazaar_review_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "bazaar_service" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"price_usdc_cents" integer NOT NULL,
	"delivery_promise" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bazaar_booking" ADD CONSTRAINT "bazaar_booking_service_id_bazaar_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."bazaar_service"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_booking" ADD CONSTRAINT "bazaar_booking_provider_id_bazaar_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."bazaar_provider"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_booking" ADD CONSTRAINT "bazaar_booking_buyer_user_id_user_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_provider" ADD CONSTRAINT "bazaar_provider_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_review" ADD CONSTRAINT "bazaar_review_booking_id_bazaar_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bazaar_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_review" ADD CONSTRAINT "bazaar_review_service_id_bazaar_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."bazaar_service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_review" ADD CONSTRAINT "bazaar_review_provider_id_bazaar_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."bazaar_provider"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_review" ADD CONSTRAINT "bazaar_review_buyer_user_id_user_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bazaar_service" ADD CONSTRAINT "bazaar_service_provider_id_bazaar_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."bazaar_provider"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bazaar_booking_buyer_idx" ON "bazaar_booking" USING btree ("buyer_user_id");--> statement-breakpoint
CREATE INDEX "bazaar_booking_provider_idx" ON "bazaar_booking" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "bazaar_booking_service_idx" ON "bazaar_booking" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "bazaar_provider_status_idx" ON "bazaar_provider" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bazaar_review_provider_idx" ON "bazaar_review" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "bazaar_review_service_idx" ON "bazaar_review" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bazaar_review_booking_unique" ON "bazaar_review" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bazaar_service_provider_idx" ON "bazaar_service" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "bazaar_service_status_idx" ON "bazaar_service" USING btree ("status");