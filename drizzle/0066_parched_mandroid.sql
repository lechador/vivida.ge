CREATE TABLE "premium_subscription" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan_key" text NOT NULL,
	"country_code" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"status" text NOT NULL,
	"currency" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "premium_subscription_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "residence_country_code" text;--> statement-breakpoint
UPDATE "user" SET "residence_country_code" = 'GE' WHERE "residence_country_code" IS NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "residence_city" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_premium" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "premium_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "premium_subscription" ADD CONSTRAINT "premium_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "premium_subscription_status_idx" ON "premium_subscription" USING btree ("status");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "horoscope_voice";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
