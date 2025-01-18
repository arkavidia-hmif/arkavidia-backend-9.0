ALTER TYPE "public"."phase_enum" ADD VALUE 'verification';--> statement-breakpoint
ALTER TABLE "competition_submission_requirement" ADD COLUMN "start_date" timestamp NOT NULL;