-- Make every existing profile public, then drop the column.
-- The visibility toggle was removed from the product; every profile is
-- now public by definition (the column no longer exists).
UPDATE "profile" SET "is_public" = true WHERE "is_public" = false;
--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "is_public";
