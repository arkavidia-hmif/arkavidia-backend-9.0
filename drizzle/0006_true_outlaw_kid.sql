ALTER TABLE "competition_submission" DROP CONSTRAINT "competition_submission_competition_id_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "competition_submission" DROP COLUMN IF EXISTS "competition_id";