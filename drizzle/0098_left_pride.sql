CREATE TABLE "crypto_purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"pack_id" text,
	"credits" integer,
	"days" integer,
	"amount_usdc_cents" integer NOT NULL,
	"recipient_wallet" text NOT NULL,
	"reference" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"tx_signature" text,
	"payer_wallet" text,
	"confirmed_at" timestamp with time zone,
	"granted_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"product" text,
	"return_to" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crypto_purchase_reference_unique" UNIQUE("reference"),
	CONSTRAINT "crypto_purchase_tx_signature_unique" UNIQUE("tx_signature")
);
--> statement-breakpoint
ALTER TABLE "crypto_purchase" ADD CONSTRAINT "crypto_purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crypto_purchase_user_idx" ON "crypto_purchase" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "crypto_purchase_status_idx" ON "crypto_purchase" USING btree ("status");