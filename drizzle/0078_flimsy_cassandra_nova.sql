ALTER TABLE "pdf_report" ADD COLUMN "edition_key" text DEFAULT 'evergreen' NOT NULL;--> statement-breakpoint
ALTER TABLE "pdf_report" ADD COLUMN "subject_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pdf_report" ADD COLUMN "partner_id" text;--> statement-breakpoint
ALTER TABLE "pdf_report" ADD COLUMN "bundle_id" text;--> statement-breakpoint
ALTER TABLE "pdf_report" ADD COLUMN "bundle_key" text;--> statement-breakpoint
ALTER TABLE "pdf_report" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "pdf_report" ADD CONSTRAINT "pdf_report_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "pdf_report"
SET "edition_key" = 'legacy:' || "id";--> statement-breakpoint
WITH ranked AS (
  SELECT "id", row_number() OVER (
    PARTITION BY "user_id", "type", "language", "subject_key"
    ORDER BY "created_at" DESC, "id" DESC
  ) AS rn
  FROM "pdf_report"
  WHERE "status" IN ('paid', 'generating', 'ready', 'failed')
)
UPDATE "pdf_report" AS report
SET "edition_key" = 'evergreen'
FROM ranked
WHERE report."id" = ranked."id" AND ranked.rn = 1;--> statement-breakpoint
CREATE UNIQUE INDEX "pdf_report_user_product_edition_idx" ON "pdf_report" USING btree ("user_id","type","language","edition_key","subject_key");--> statement-breakpoint
CREATE INDEX "pdf_report_bundle_idx" ON "pdf_report" USING btree ("user_id","bundle_id");
