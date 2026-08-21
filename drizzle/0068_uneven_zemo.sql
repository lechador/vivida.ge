ALTER TABLE "premium_subscription" ALTER COLUMN "stripe_subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "premium_subscription" ALTER COLUMN "stripe_price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "premium_subscription" ADD COLUMN "source" text DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
ALTER TABLE "premium_subscription" ADD COLUMN "rc_original_transaction_id" text;--> statement-breakpoint
ALTER TABLE "premium_subscription" ADD COLUMN "rc_product_id" text;--> statement-breakpoint
ALTER TABLE "premium_subscription" ADD COLUMN "rc_store" text;--> statement-breakpoint
ALTER TABLE "premium_subscription" ADD CONSTRAINT "premium_subscription_rc_original_transaction_id_unique" UNIQUE("rc_original_transaction_id");