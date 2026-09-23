CREATE TABLE "pwa_installation" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"first_opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_opened_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "pwa_installation_last_opened_idx" ON "pwa_installation" USING btree ("last_opened_at");