CREATE TABLE IF NOT EXISTS "voucer" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"required_team_count" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "applied_voucer_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_applied_voucer_id_voucer_id_fk" FOREIGN KEY ("applied_voucer_id") REFERENCES "public"."voucer"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
