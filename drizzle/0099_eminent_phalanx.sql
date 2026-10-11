ALTER TABLE "crypto_purchase" ADD COLUMN "method" text DEFAULT 'wallet' NOT NULL;--> statement-breakpoint
ALTER TABLE "crypto_purchase" ADD COLUMN "fiat_confirmed_at" timestamp with time zone;