ALTER TABLE "competition_submission" DROP CONSTRAINT "competition_submission_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "competition_submission" DROP CONSTRAINT "competition_submission_type_id_competition_submission_requirement_type_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_type_id_competition_submission_requirement_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."competition_submission_requirement"("type_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

