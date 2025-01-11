CREATE TABLE IF NOT EXISTS "competition_submission_requirement" (
	"type_id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"type_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competition_submission" DROP CONSTRAINT "competition_submission_team_id_type_pk";--> statement-breakpoint
ALTER TABLE "competition_submission" ALTER COLUMN "media_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "competition_submission" ADD COLUMN "type_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission_requirement" ADD CONSTRAINT "competition_submission_requirement_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_type_id_competition_submission_requirement_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."competition_submission_requirement"("type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "competition_submission" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
DROP TYPE "public"."competition_submission_type_enum";